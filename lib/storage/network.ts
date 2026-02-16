import { DEFAULT_NETWORK, type NetworkId } from '../network';

const NETWORK_KEY = 'selectedNetwork';

/** Global (non-namespaced) store for the active network selection. */
export const networkStore = {
  async get(): Promise<NetworkId> {
    const result = await chrome.storage.local.get(NETWORK_KEY);
    return (result[NETWORK_KEY] as NetworkId) ?? DEFAULT_NETWORK;
  },

  async set(network: NetworkId): Promise<void> {
    await chrome.storage.local.set({ [NETWORK_KEY]: network });
  },
};
