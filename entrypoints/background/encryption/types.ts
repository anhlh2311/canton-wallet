export interface EncryptedKeyBundle {
  cantonKey: string;
  walletKey: string;
  hashedKey: string;
  backend: 'webcrypto' | 'cryptojs';
  version: number;
}

export interface EncryptionProvider {
  encryptKey(privateKey: string, password: string): Promise<EncryptedKeyBundle>;
  decryptKey(bundle: EncryptedKeyBundle, password: string): Promise<string>;
  verifyPassword(bundle: EncryptedKeyBundle, password: string): Promise<boolean>;
}
