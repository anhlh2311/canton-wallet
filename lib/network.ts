export type NetworkId = 'localnet' | 'devnet' | 'testnet' | 'mainnet';

export interface NetworkConfig {
  id: NetworkId;
  label: string;
  apiBaseUrl: string;
  explorerUrl: string;
}

export const NETWORKS: Record<NetworkId, NetworkConfig> = {
  localnet: {
    id: 'localnet',
    label: 'Localnet',
    apiBaseUrl: 'http://localhost:3003/',
    explorerUrl: '',
  },
  devnet: {
    id: 'devnet',
    label: 'Devnet',
    apiBaseUrl: 'https://api-devnet.kairo.ag/',
    explorerUrl: 'https://lighthouse.devnet.cantonloop.com',
  },
  testnet: {
    id: 'testnet',
    label: 'Testnet',
    apiBaseUrl: 'https://api-testnet.kairo.ag/',
    explorerUrl: 'https://lighthouse.testnet.cantonloop.com',
  },
  mainnet: {
    id: 'mainnet',
    label: 'Mainnet',
    apiBaseUrl: 'https://api.kairo.ag/',
    explorerUrl: 'https://lighthouse.cantonloop.com',
  },
};

export const DEFAULT_NETWORK: NetworkId = 'devnet';

export const NETWORK_IDS = Object.keys(NETWORKS) as NetworkId[];
