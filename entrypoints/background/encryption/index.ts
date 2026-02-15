import type { EncryptionProvider } from './types';

export type { EncryptedKeyBundle, EncryptionProvider } from './types';

let _provider: EncryptionProvider | null = null;

export async function getEncryptionProvider(): Promise<EncryptionProvider> {
  if (_provider) return _provider;

  const backend = import.meta.env.VITE_ENCRYPTION_BACKEND ?? 'webcrypto';

  if (backend === 'cryptojs') {
    const { cryptojsProvider } = await import('./cryptojs');
    _provider = cryptojsProvider;
  } else {
    const { webcryptoProvider } = await import('./webcrypto');
    _provider = webcryptoProvider;
  }

  return _provider;
}
