import bcrypt from 'bcryptjs';
import CryptoJS from 'crypto-js';
import type { EncryptedKeyBundle, EncryptionProvider } from './types';

const SALT_ROUNDS = Number(import.meta.env.VITE_SALT_ROUNDS ?? '10');

export const cryptojsProvider: EncryptionProvider = {
  async encryptKey(
    privateKey: string,
    password: string,
  ): Promise<EncryptedKeyBundle> {
    const hashedPassword = bcrypt.hashSync(password, SALT_ROUNDS);
    const encrypted = CryptoJS.AES.encrypt(
      privateKey,
      hashedPassword,
    ).toString();

    return {
      cantonKey: encrypted,
      walletKey: '', // public key stored separately by keystore handler
      hashedKey: hashedPassword,
      backend: 'cryptojs',
      version: 1,
    };
  },

  async decryptKey(
    bundle: EncryptedKeyBundle,
    password: string,
  ): Promise<string> {
    // Verify password against stored bcrypt hash
    const isValid = bcrypt.compareSync(password, bundle.hashedKey);
    if (!isValid) {
      throw new Error('Invalid password');
    }

    const decryptedBytes = CryptoJS.AES.decrypt(
      bundle.cantonKey,
      bundle.hashedKey,
    );
    const plaintext = decryptedBytes.toString(CryptoJS.enc.Utf8);

    if (!plaintext) {
      throw new Error('Decryption failed');
    }

    return plaintext;
  },

  async verifyPassword(
    bundle: EncryptedKeyBundle,
    password: string,
  ): Promise<boolean> {
    return bcrypt.compareSync(password, bundle.hashedKey);
  },
};
