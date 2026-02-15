import { ok, err } from '@lib/messaging';
import type { MessageResponse, KeyPairData } from '@lib/messaging';
import { localStore, sessionStore } from '@lib/storage';
import { getEncryptionProvider } from '../encryption';
import apiClient from '../api-client';

export async function handleCreateKeypair(): Promise<MessageResponse<KeyPairData>> {
  try {
    // Dynamic import to avoid bundling in popup
    const { createKeyPair } = await import('@canton-network/core-signing-lib');
    const keypair = createKeyPair();

    return ok({
      privateKey: keypair.privateKey,
      publicKey: keypair.publicKey,
    });
  } catch (e: unknown) {
    return err(e instanceof Error ? e.message : 'Key generation failed');
  }
}

export async function handleValidateImportKey(
  rawKey: string,
): Promise<MessageResponse<KeyPairData>> {
  try {
    // Accept both hex and base64 — normalize to base64 for the signing lib
    const privateKey = isHex(rawKey) ? hexToBase64(rawKey) : rawKey;

    const { getPublicKeyFromPrivate } = await import(
      '@canton-network/core-signing-lib'
    );
    const publicKey = getPublicKeyFromPrivate(privateKey);

    return ok({ privateKey, publicKey });
  } catch (e: unknown) {
    return err(e instanceof Error ? e.message : 'Invalid private key');
  }
}

export async function handleCompleteOnboarding(payload: {
  password: string;
  privateKey: string;
  publicKey: string;
}): Promise<MessageResponse<{ success: boolean }>> {
  try {
    const { password, privateKey, publicKey } = payload;
    const provider = await getEncryptionProvider();

    // Encrypt and store the key
    const bundle = await provider.encryptKey(privateKey, password);
    bundle.walletKey = publicKey;
    await localStore.set('keystore', bundle);

    // Import signing lib (needed for both onboarding and auto-approval)
    const { signTransactionHash } = await import(
      '@canton-network/core-signing-lib'
    );

    // Only run onboarding if the user is new (not already registered on the backend)
    const partyStatus = await sessionStore.get('partyStatus');
    if (partyStatus !== 'SUCCESSFULLY') {
      const hexPubKey = base64ToHex(publicKey);
      const { data: prepareData } = await apiClient.post(
        '/external-party/onboarding/prepare',
        { publicKey: hexPubKey },
      );

      const { preparedTransaction, preparedTransactionHash } =
        prepareData.data;

      const signature = signTransactionHash(preparedTransactionHash, privateKey);

      await apiClient.post('/external-party/onboarding/submit', {
        preparedTransaction,
        signature,
      });
    }

    // Set up auto-approval: prepare → sign → submit (both new and existing users)
    const partyId = await sessionStore.get('partyId');
    if (partyId) {
      try {
        const { data: autoData } = await apiClient.post(
          '/auto-approval/prepare',
          { partyId },
        );
        const autoSig = signTransactionHash(
          autoData.data.preparedTransactionHash,
          privateKey,
        );
        await apiClient.post('/auto-approval/submit', {
          preparedTransaction: autoData.data.preparedTransaction,
          signature: autoSig,
        });
      } catch {
        // Auto-approval is best-effort
      }
    }

    // Request faucet (best-effort)
    try {
      const faucetPartyId = partyId || (await sessionStore.get('partyId'));
      if (faucetPartyId) {
        await apiClient.post('/external-party/request-faucet', { partyId: faucetPartyId });
      }
    } catch {
      // Faucet is best-effort
    }

    await localStore.set('onboardingComplete', true);
    await sessionStore.set('unlocked', true);

    return ok({ success: true });
  } catch (e: unknown) {
    return err(e instanceof Error ? e.message : 'Onboarding failed');
  }
}

export async function handleExportPrivateKey(
  password: string,
): Promise<MessageResponse<{ privateKey: string }>> {
  try {
    const keystore = await localStore.get('keystore');
    if (!keystore) return err('No keystore found');

    const provider = await getEncryptionProvider();
    const privateKey = await provider.decryptKey(keystore, password);

    return ok({ privateKey });
  } catch (e: unknown) {
    return err(e instanceof Error ? e.message : 'Failed to export key');
  }
}

export async function handleDeleteKeystore(): Promise<MessageResponse<void>> {
  try {
    await localStore.remove('keystore');
    await localStore.set('onboardingComplete', false);
    await sessionStore.clear();
    return ok(undefined);
  } catch (e: unknown) {
    return err(e instanceof Error ? e.message : 'Failed to delete keystore');
  }
}

function base64ToHex(b64: string): string {
  const raw = atob(b64);
  let hex = '';
  for (let i = 0; i < raw.length; i++) {
    hex += raw.charCodeAt(i).toString(16).padStart(2, '0');
  }
  return hex;
}

function isHex(s: string): boolean {
  return s.length > 0 && s.length % 2 === 0 && /^[0-9a-fA-F]+$/.test(s);
}

function hexToBase64(hex: string): string {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}
