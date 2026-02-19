import { ArrowLeftIcon, LockIcon, UnlockIcon, ClockIcon } from 'lucide-react';
import { IconCanton } from '@assets/icons/icon-canton';
import { IconCBTCCoin } from '@assets/icons/icon-yield-coin';
import { IconUSDC } from '@assets/icons/icon-usdc';
import { IconDefaultToken } from '@assets/icons/icon-default-token';
import { SUPPORTED_TOKENS } from '@lib/constants';
import { format } from '@lib/format';
import type { BalanceSwapResponse } from '@lib/types';
import BigNumber from 'bignumber.js';

const TOKEN_ICONS: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
  Amulet: IconCanton,
  CBTC: IconCBTCCoin,
  USDCx: IconUSDC,
};

interface Props {
  balance: BalanceSwapResponse;
  onBack: () => void;
}

export function TokenDetail({ balance, onBack }: Props) {
  const tokenId = balance.instrumentId?.id ?? 'Unknown';
  const Icon = TOKEN_ICONS[tokenId] ?? IconDefaultToken;
  const tokenMeta = SUPPORTED_TOKENS.find((t) => t.id === tokenId);
  const tokenName = tokenMeta?.chainName ?? tokenId;
  const symbol = tokenMeta?.symbol ?? tokenId;

  const unlocked = new BigNumber(balance.unlocked ?? '0');
  const locked = new BigNumber(balance.locked ?? '0');
  const total = unlocked.plus(locked);
  const lockedDetails = balance.lockedDetails ?? [];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <button
          onClick={onBack}
          className="rounded-lg p-1.5 hover:bg-secondary transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4 text-muted-foreground" />
        </button>
        <h2 className="text-sm font-bold text-foreground">Token Details</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Token header */}
        <div className="flex flex-col items-center gap-3 py-4">
          <div className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center bg-secondary">
            <Icon className="w-12 h-12" />
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-foreground">{tokenName}</p>
            <p className="text-sm text-muted-foreground">${symbol}</p>
          </div>
          <p className="text-2xl font-bold text-foreground">{total.toFormat()}</p>
        </div>

        {/* Balance breakdown */}
        <div className="rounded-xl bg-secondary p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UnlockIcon className="w-4 h-4 text-green-400" />
              <span className="text-sm text-muted-foreground">Available</span>
            </div>
            <span className="text-sm font-medium text-foreground">{unlocked.toFormat()}</span>
          </div>

          <div className="h-px bg-border" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LockIcon className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-muted-foreground">Locked</span>
            </div>
            <span className="text-sm font-medium text-foreground">{locked.toFormat()}</span>
          </div>
        </div>

        {/* Token info */}
        <div className="rounded-xl bg-secondary p-4 space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Token Info</p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Decimals</span>
              <span className="text-foreground">{tokenMeta?.decimal ?? '—'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Min Transfer</span>
              <span className="text-foreground">{tokenMeta?.minAmount ?? '—'}</span>
            </div>
            {balance.instrumentId?.admin && (
              <div className="flex flex-col gap-1 text-sm">
                <span className="text-muted-foreground">Admin</span>
                <span className="text-foreground text-xs font-mono break-all">
                  {balance.instrumentId.admin}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Locked details */}
        {lockedDetails.length > 0 && (
          <div className="rounded-xl bg-secondary p-4 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Locked Holdings ({lockedDetails.length})
            </p>
            <div className="space-y-2">
              {lockedDetails.map((detail, i) => (
                <div
                  key={i}
                  className="rounded-lg bg-background p-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <LockIcon className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
                    <span className="text-sm font-medium text-foreground">
                      {new BigNumber(detail.amount).toFormat()}
                    </span>
                  </div>
                  {detail.etaUnlockAt && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <ClockIcon className="w-3 h-3" />
                      <span>{format.date(detail.etaUnlockAt)}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
