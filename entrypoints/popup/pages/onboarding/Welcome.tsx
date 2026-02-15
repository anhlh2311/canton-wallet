import { useState, useEffect, useRef } from 'react';
import { useGoogleAuth } from '../../hooks/useAuth';
import { IconGoogle } from '@assets/icons/icon-google';
import { IconLogo } from '@assets/icons/icon-logo';
import type { GoogleAuthData } from '@lib/messaging';

interface Props {
  onSuccess: (data: GoogleAuthData) => void;
}

/** Check if we're running inside a persistent window (not the extension popup). */
function isStandaloneWindow(): boolean {
  return new URLSearchParams(window.location.search).has('window');
}

export function Welcome({ onSuccess }: Props) {
  const googleAuth = useGoogleAuth();
  const [error, setError] = useState('');
  const authTriggered = useRef(false);

  // Auto-trigger auth when opened in a persistent window with ?action=sign-in
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('action') === 'sign-in' && !authTriggered.current) {
      authTriggered.current = true;
      // Clean up action param but keep window param
      params.delete('action');
      const qs = params.toString();
      window.history.replaceState({}, '', window.location.pathname + (qs ? `?${qs}` : ''));
      doAuth();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- intentional one-time trigger

  const doAuth = async () => {
    setError('');
    try {
      const data = await googleAuth.mutateAsync();
      onSuccess(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Sign in failed');
    }
  };

  const handleGoogleSignIn = async () => {
    if (isStandaloneWindow()) {
      // Already in a persistent window — do auth directly
      doAuth();
      return;
    }

    // Open a persistent popup window so the UI survives the OAuth redirect.
    // The extension popup auto-closes when it loses focus, but a window stays open.
    try {
      await chrome.windows.create({
        url: chrome.runtime.getURL('popup.html?window=1&action=sign-in'),
        type: 'popup',
        width: 420,
        height: 660,
      });
      // Close the extension popup so only the persistent window remains
      window.close();
    } catch {
      // Fallback: try auth directly
      doAuth();
    }
  };

  return (
    <div className="flex flex-col items-center justify-between h-full p-6 bg-background">
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <IconLogo className="w-32 h-12" />
        <h1 className="text-2xl font-bold text-foreground">Canton Wallet</h1>
        <p className="text-sm text-muted-foreground text-center">
          Securely manage your Canton Network tokens
        </p>
      </div>

      <div className="w-full space-y-3">
        {error && (
          <p className="text-sm text-destructive text-center">{error}</p>
        )}
        <button
          onClick={handleGoogleSignIn}
          disabled={googleAuth.isPending}
          className="w-full flex items-center justify-center gap-3 rounded-xl bg-white text-black py-3 px-4 font-medium hover:bg-gray-100 disabled:opacity-50 transition-colors"
        >
          {googleAuth.isPending ? (
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-400 border-t-transparent" />
          ) : (
            <IconGoogle className="w-5 h-5" />
          )}
          {googleAuth.isPending ? 'Signing in…' : 'Sign in with Google'}
        </button>
      </div>
    </div>
  );
}
