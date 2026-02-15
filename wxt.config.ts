import { defineConfig } from 'wxt';
import path from 'node:path';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  outDir: 'build',
  manifest: {
    name: 'Canton Wallet',
    description: 'Canton Network (Kairo) wallet browser extension',
    version: '0.1.0',
    // Stable key pins the extension ID so the OAuth redirect URI stays consistent.
    // The redirect URI will be: https://<extension-id>.chromiumapp.org/
    // Register this URI in Google Cloud Console → OAuth 2.0 Client → Authorized redirect URIs.
    key: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEArtTfy73YDG/256XT2uWXrnqsVLPy3NogEEcK3AEoJobWtEqGbpn3xsizhbLDKYNf6v5IaEu1I2pyru8Wxd/ubx4fzONaOlImkRrNOS42ouuz7MZOqKvovphpAVEZ0A1EhFmlu3mVHJjAlzmq6nhMvt9uNhsNQkOmRG0aoks6mas3CsfH6Sr7BgkpWFcrGixzFvrnJt8A9BefpjHQmfWozGXEBlKEYc1ShZ2oz9rVpfmDb8oH03wZvlkuVkG/Iwjb028XObBn6BNkj2NRzHW6DfuGCG9H2NHEmbVkUT3mTy5T5jB0+yO47jfdo0dwpUVmBZJXRMsg+Roo01H6kbxUNwIDAQAB',
    permissions: ['storage', 'identity', 'alarms'],
    host_permissions: [
      'https://accounts.google.com/*',
      'https://*.kairo.ag/*',
    ],
  },
  imports: false,
  vite: () => ({
    resolve: {
      alias: {
        '@': path.resolve(__dirname),
        '@lib': path.resolve(__dirname, 'lib'),
        '@components': path.resolve(__dirname, 'components'),
        '@assets': path.resolve(__dirname, 'assets'),
      },
    },
  }),
});
