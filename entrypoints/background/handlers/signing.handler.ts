import { ok, err } from '@lib/messaging';
import type { MessageResponse } from '@lib/messaging';
import type {
  PrepareTransferResponse,
  PrepareTransferTokenStandardResponse,
} from '@lib/types';
import { localStore, sessionStore } from '@lib/storage';
import { getEncryptionProvider } from '../encryption';
import apiClient from '../api-client';
import { resetAutoLockTimer } from './session.handler';

async function decryptKey(password: string): Promise<string> {
  const keystore = await localStore.get('keystore');
  if (!keystore) throw new Error('No keystore found');

  const provider = await getEncryptionProvider();
  return provider.decryptKey(keystore, password);
}

export async function handleSignAndSubmitTransferPreapproval(payload: {
  password: string;
  preparedData: PrepareTransferResponse;
}): Promise<MessageResponse<{ success: boolean }>> {
  try {
    const { password, preparedData } = payload;
    const privateKey = await decryptKey(password);

    const { signTransactionHash } = await import(
      '@canton-network/core-signing-lib'
    );

    const signature = signTransactionHash(preparedData.preparedTransactionHash, privateKey);

    await apiClient.post('/external-party/transfer-amulet/submit', {
      preparedTransaction: preparedData.preparedTransaction,
      hashingSchemeVersion: preparedData.hashingSchemeVersion,
      signature,
      senderPartyId: preparedData.senderPartyId,
    });

    resetAutoLockTimer();
    return ok({ success: true });
  } catch (e: unknown) {
    return err(e instanceof Error ? e.message : 'Transfer failed');
  }
}

export async function handleSignAndSubmitTransferTokenStandard(payload: {
  password: string;
  preparedData: PrepareTransferTokenStandardResponse;
}): Promise<MessageResponse<{ success: boolean }>> {
  try {
    const { password, preparedData } = payload;
    const privateKey = await decryptKey(password);

    const { signTransactionHash } = await import(
      '@canton-network/core-signing-lib'
    );

    const signature = signTransactionHash(
      preparedData.preparedTransactionHash,
      privateKey,
    );

    await apiClient.post('/transfer-token-standard/submit', {
      preparedTransaction: preparedData.preparedTransaction,
      signature,
    });

    resetAutoLockTimer();
    return ok({ success: true });
  } catch (e: unknown) {
    return err(e instanceof Error ? e.message : 'Transfer failed');
  }
}

export async function handleSignAndSubmitApprove(payload: {
  password: string;
  preparedData: PrepareTransferTokenStandardResponse;
}): Promise<MessageResponse<{ success: boolean }>> {
  try {
    const { password, preparedData } = payload;
    const privateKey = await decryptKey(password);

    const { signTransactionHash } = await import(
      '@canton-network/core-signing-lib'
    );
    const signature = signTransactionHash(
      preparedData.preparedTransactionHash,
      privateKey,
    );

    await apiClient.post('/transfer-token-standard/approve/submit', {
      preparedTransaction: preparedData.preparedTransaction,
      signature,
    });

    resetAutoLockTimer();
    return ok({ success: true });
  } catch (e: unknown) {
    return err(e instanceof Error ? e.message : 'Approve failed');
  }
}

export async function handleSignAndSubmitReject(payload: {
  password: string;
  preparedData: PrepareTransferTokenStandardResponse;
}): Promise<MessageResponse<{ success: boolean }>> {
  try {
    const { password, preparedData } = payload;
    const privateKey = await decryptKey(password);

    const { signTransactionHash } = await import(
      '@canton-network/core-signing-lib'
    );
    const signature = signTransactionHash(
      preparedData.preparedTransactionHash,
      privateKey,
    );

    await apiClient.post('/transfer-token-standard/reject/submit', {
      preparedTransaction: preparedData.preparedTransaction,
      signature,
    });

    resetAutoLockTimer();
    return ok({ success: true });
  } catch (e: unknown) {
    return err(e instanceof Error ? e.message : 'Reject failed');
  }
}

