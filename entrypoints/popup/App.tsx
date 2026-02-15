import { useState, useEffect, useCallback } from 'react';
import { useAuthState } from './hooks/useAuth';
import { useLockState } from './hooks/useLockState';

import { Welcome } from './pages/onboarding/Welcome';
import { CreatePassword } from './pages/onboarding/CreatePassword';
import { KeySetup } from './pages/onboarding/KeySetup';
import { ShowPrivateKey } from './pages/onboarding/ShowPrivateKey';
import { Acknowledgment } from './pages/onboarding/Acknowledgment';
import { TypedConfirm } from './pages/onboarding/TypedConfirm';
import { Unlock } from './pages/Unlock';
import { Dashboard } from './pages/dashboard';

type Screen =
  | 'loading'
  | 'welcome'
  | 'create-password'
  | 'key-setup'
  | 'show-key'
  | 'acknowledgment'
  | 'typed-confirm'
  | 'unlock'
  | 'dashboard';

interface OnboardingState {
  password: string;
  privateKey: string;
  publicKey: string;
  isImport: boolean;
}

const EMPTY_ONBOARDING: OnboardingState = {
  password: '',
  privateKey: '',
  publicKey: '',
  isImport: false,
};

/** True when the app is running inside a persistent auth window (not the popup). */
const IS_STANDALONE_WINDOW = new URLSearchParams(window.location.search).has('window');

function App() {
  const { data: authState, isLoading: authLoading } = useAuthState();
  const { data: lockState, isLoading: lockLoading } = useLockState();
  const [screen, setScreen] = useState<Screen>('loading');
  const [onboarding, setOnboarding] = useState<OnboardingState>(EMPTY_ONBOARDING);

  // Wipe sensitive onboarding data when leaving the onboarding flow
  const clearOnboarding = useCallback(() => {
    setOnboarding(EMPTY_ONBOARDING);
  }, []);

  useEffect(() => {
    if (authLoading || lockLoading) {
      setScreen('loading');
      return;
    }

    if (!authState?.isAuthenticated) {
      setScreen('welcome');
      return;
    }

    if (lockState?.unlocked) {
      setScreen('dashboard');
      return;
    }

    // Authenticated but locked — check if onboarding is done
    chrome.storage.local.get('onboardingComplete', (result) => {
      if (result.onboardingComplete) {
        // Onboarding already complete — if we're in the persistent auth window,
        // close it and let the user continue via the extension popup.
        if (IS_STANDALONE_WINDOW) {
          window.close();
          return;
        }
        setScreen('unlock');
      } else {
        setScreen('create-password');
      }
    });
  }, [authState, lockState, authLoading, lockLoading]);

  if (screen === 'loading') {
    return (
      <div className="flex items-center justify-center h-full bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  switch (screen) {
    case 'welcome':
      return (
        <Welcome
          onSuccess={(data) => {
            if (data.partyStatus === 'SUCCESSFULLY') {
              setScreen('unlock');
            } else {
              setScreen('create-password');
            }
          }}
        />
      );

    case 'create-password':
      return (
        <CreatePassword
          onNext={(password) => {
            setOnboarding((prev) => ({ ...prev, password }));
            setScreen('key-setup');
          }}
        />
      );

    case 'key-setup':
      return (
        <KeySetup
          onNext={(data) => {
            setOnboarding((prev) => ({
              ...prev,
              privateKey: data.privateKey,
              publicKey: data.publicKey,
              isImport: data.isImport,
            }));
            // Imported keys don't need the "save your key" screen
            setScreen(data.isImport ? 'acknowledgment' : 'show-key');
          }}
          onBack={() => setScreen('create-password')}
        />
      );

    case 'show-key':
      return (
        <ShowPrivateKey
          privateKey={onboarding.privateKey}
          onNext={() => setScreen('acknowledgment')}
          onBack={() => setScreen('key-setup')}
        />
      );

    case 'acknowledgment':
      return (
        <Acknowledgment
          onNext={() => setScreen('typed-confirm')}
          onBack={() => setScreen(onboarding.isImport ? 'key-setup' : 'show-key')}
        />
      );

    case 'typed-confirm':
      return (
        <TypedConfirm
          password={onboarding.password}
          privateKey={onboarding.privateKey}
          publicKey={onboarding.publicKey}
          onSuccess={() => {
            clearOnboarding();
            setScreen('dashboard');
          }}
          onBack={() => setScreen('acknowledgment')}
        />
      );

    case 'unlock':
      return <Unlock onSuccess={() => setScreen('dashboard')} />;

    case 'dashboard':
      return (
        <Dashboard
          onLock={() => {
            clearOnboarding();
            setScreen('unlock');
          }}
          onLogout={() => {
            clearOnboarding();
            setScreen('welcome');
          }}
        />
      );

    default:
      return null;
  }
}

export default App;
