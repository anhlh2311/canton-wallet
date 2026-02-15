import { useBalances } from '../../hooks/useBalances';
import { Loader2Icon, AlertCircleIcon } from 'lucide-react';
import { IconCanton } from '@assets/icons/icon-canton';
import { IconCBTCCoin } from '@assets/icons/icon-yield-coin';
import { IconUSDC } from '@assets/icons/icon-usdc';
import { IconDefaultToken } from '@assets/icons/icon-default-token';
import BigNumber from 'bignumber.js';

const TOKEN_ICONS: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
  Amulet: IconCanton,
  CBTC: IconCBTCCoin,
  USDCx: IconUSDC,
};

export function Balances() {
  const { data, isLoading, error, refetch } = useBalances();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2Icon className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-40 gap-2">
        <AlertCircleIcon className="w-5 h-5 text-destructive" />
        <p className="text-sm text-destructive">Failed to load balances</p>
        <button onClick={() => refetch()} className="text-xs text-primary hover:underline">
          Retry
        </button>
      </div>
    );
  }

  const balances = data?.balances ?? [];

  if (balances.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">
        No token balances found
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      {balances.map((b) => {
        const tokenId = b.instrumentId?.id ?? 'Unknown';
        const Icon = TOKEN_ICONS[tokenId] ?? IconDefaultToken;
        const total = new BigNumber(b.unlocked ?? '0').plus(b.locked ?? '0');

        return (
          <div
            key={tokenId}
            className="rounded-xl bg-secondary p-4 flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-background">
              <Icon className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">{tokenId}</p>
              <p className="text-xs text-muted-foreground">
                Available: {new BigNumber(b.unlocked ?? '0').toFormat()}
              </p>
            </div>
            <div className="text-right">
              <p className="font-medium text-foreground">{total.toFormat()}</p>
              {new BigNumber(b.locked ?? '0').gt(0) && (
                <p className="text-xs text-yellow-500">
                  Locked: {new BigNumber(b.locked ?? '0').toFormat()}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
