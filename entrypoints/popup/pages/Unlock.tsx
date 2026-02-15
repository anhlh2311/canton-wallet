import { useState } from 'react';
import { EyeIcon, EyeOffIcon, Loader2Icon, LockIcon } from 'lucide-react';
import { useUnlock } from '../hooks/useLockState';
import { IconLogo } from '@assets/icons/icon-logo';

interface Props {
  onSuccess: () => void;
}

export function Unlock({ onSuccess }: Props) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const unlock = useUnlock();

  const handleUnlock = async () => {
    if (!password) return;
    setError('');
    try {
      await unlock.mutateAsync(password);
      onSuccess();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Invalid password');
    }
  };

  return (
    <div className="flex flex-col items-center justify-between h-full p-6 bg-background">
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <IconLogo className="w-28 h-10" />
        <div className="rounded-full bg-secondary p-4">
          <LockIcon className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-xl font-bold text-foreground">Wallet Locked</h1>
        <p className="text-sm text-muted-foreground text-center">
          Enter your password to unlock
        </p>
      </div>

      <div className="w-full space-y-3">
        {error && <p className="text-sm text-destructive text-center">{error}</p>}

        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
            className="w-full rounded-lg bg-secondary text-foreground px-4 py-3 pr-10 text-sm outline-none focus:ring-2 focus:ring-primary"
            placeholder="Enter password"
            autoFocus
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
          </button>
        </div>

        <button
          onClick={handleUnlock}
          disabled={!password || unlock.isPending}
          className="w-full rounded-xl bg-primary text-primary-foreground py-3 font-medium disabled:opacity-40 transition-opacity"
        >
          {unlock.isPending ? (
            <Loader2Icon className="w-5 h-5 animate-spin mx-auto" />
          ) : (
            'Unlock'
          )}
        </button>
      </div>
    </div>
  );
}
