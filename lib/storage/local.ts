import type { KeystoreData, SettingsData, StoredUser } from './schemas';

export interface LocalStorageSchema {
  keystore: KeystoreData | null;
  user: StoredUser | null;
  settings: SettingsData;
  onboardingComplete: boolean;
}

const DEFAULTS: LocalStorageSchema = {
  keystore: null,
  user: null,
  settings: { autoLockMinutes: 15 },
  onboardingComplete: false,
};

export const localStore = {
  async get<K extends keyof LocalStorageSchema>(
    key: K,
  ): Promise<LocalStorageSchema[K]> {
    const result = await chrome.storage.local.get(key);
    return (result[key] as LocalStorageSchema[K]) ?? DEFAULTS[key];
  },

  async set<K extends keyof LocalStorageSchema>(
    key: K,
    value: LocalStorageSchema[K],
  ): Promise<void> {
    await chrome.storage.local.set({ [key]: value });
  },

  async remove<K extends keyof LocalStorageSchema>(key: K): Promise<void> {
    await chrome.storage.local.remove(key);
  },

  async clear(): Promise<void> {
    await chrome.storage.local.clear();
  },
};
