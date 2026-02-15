import { useState } from 'react';
import { WalletIcon, SendIcon, InboxIcon, HistoryIcon, SettingsIcon } from 'lucide-react';
import { Balances } from './Balances';
import { Transfer } from './Transfer';
import { Offers } from './offers';
import { Activity } from './Activity';
import { Settings } from './Settings';
import { useLock } from '../../hooks/useLockState';
import { useLogout } from '../../hooks/useAuth';

type Tab = 'balances' | 'transfer' | 'offers' | 'activity';

interface Props {
  onLock: () => void;
  onLogout: () => void;
}

export function Dashboard({ onLock, onLogout }: Props) {
  const [tab, setTab] = useState<Tab>('balances');
  const [showSettings, setShowSettings] = useState(false);
  const lock = useLock();
  const logout = useLogout();

  const handleLock = async () => {
    await lock.mutateAsync();
    onLock();
  };

  const handleLogout = async () => {
    await logout.mutateAsync();
    onLogout();
  };

  const tabs: { id: Tab; label: string; icon: typeof WalletIcon }[] = [
    { id: 'balances', label: 'Wallet', icon: WalletIcon },
    { id: 'transfer', label: 'Send', icon: SendIcon },
    { id: 'offers', label: 'Offers', icon: InboxIcon },
    { id: 'activity', label: 'Activity', icon: HistoryIcon },
  ];

  if (showSettings) {
    return (
      <Settings
        onBack={() => setShowSettings(false)}
        onLock={handleLock}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h1 className="text-sm font-bold text-foreground">Canton Wallet</h1>
        <button
          onClick={() => setShowSettings(true)}
          className="rounded-lg p-1.5 hover:bg-secondary transition-colors"
        >
          <SettingsIcon className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {tab === 'balances' && <Balances />}
        {tab === 'transfer' && <Transfer />}
        {tab === 'offers' && <Offers />}
        {tab === 'activity' && <Activity />}
      </div>

      {/* Bottom nav */}
      <div className="flex border-t border-border">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-xs transition-colors ${
              tab === id ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
