import type { EncryptedKeyBundle, EncryptionProvider } from './types';

const PBKDF2_ITERATIONS = 100_000;
const SALT_BYTES = 16;
const IV_BYTES = 12;

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

async function deriveKey(
  password: string,
  salt: Uint8Array,
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey'],
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

export const webcryptoProvider: EncryptionProvider = {
  async encryptKey(
    privateKey: string,
    password: string,
  ): Promise<EncryptedKeyBundle> {
    const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
    const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
    const key = await deriveKey(password, salt);

    const encoder = new TextEncoder();
    const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoder.encode(privateKey),
    );

    // Store salt + iv + ciphertext together, base64-encoded
    const cantonKey = arrayBufferToBase64(ciphertext);
    const hashedKey = JSON.stringify({
      salt: arrayBufferToBase64(salt.buffer),
      iv: arrayBufferToBase64(iv.buffer),
    });

    return {
      cantonKey,
      walletKey: '', // public key stored separately by keystore handler
      hashedKey,
      backend: 'webcrypto',
      version: 1,
    };
  },

  async decryptKey(
    bundle: EncryptedKeyBundle,
    password: string,
  ): Promise<string> {
    const { salt, iv } = JSON.parse(bundle.hashedKey);
    const saltBuf = new Uint8Array(base64ToArrayBuffer(salt));
    const ivBuf = new Uint8Array(base64ToArrayBuffer(iv));
    const ciphertext = base64ToArrayBuffer(bundle.cantonKey);

    const key = await deriveKey(password, saltBuf);
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: ivBuf },
      key,
      ciphertext,
    );

    return new TextDecoder().decode(decrypted);
  },

  async verifyPassword(
    bundle: EncryptedKeyBundle,
    password: string,
  ): Promise<boolean> {
    try {
      await webcryptoProvider.decryptKey(bundle, password);
      return true;
    } catch {
      return false;
    }
  },
};
