import { useState } from 'react';
import { MSG } from '@lib/messaging/constants';

export function useFaucet() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function requestFaucet(password: string, amount: string): Promise<boolean> {
    setLoading(true);
    setError(null);
    try {
      const response = await chrome.runtime.sendMessage({
        action: MSG.REQUEST_FAUCET,
        payload: { password, amount },
      });
      if (response?.success) {
        return true;
      }
      setError(response?.error || 'Faucet request failed');
      return false;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Faucet request failed');
      return false;
    } finally {
      setLoading(false);
    }
  }

  return { requestFaucet, loading, error };
}
