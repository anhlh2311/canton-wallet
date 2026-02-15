import { sendMessage, MSG } from '@lib/messaging';
import type { BalancesData, PricesData } from '@lib/messaging';
import { useQuery } from '@tanstack/react-query';
import { queryKey } from '@lib/constants';

export function useBalances() {
  return useQuery({
    queryKey: [queryKey.BALANCE],
    queryFn: () => sendMessage<BalancesData>({ action: MSG.FETCH_BALANCES }),
    refetchInterval: 30_000,
  });
}

export function usePrices() {
  return useQuery({
    queryKey: [queryKey.GET_PRICE],
    queryFn: () => sendMessage<PricesData>({ action: MSG.FETCH_PRICES }),
    refetchInterval: 60_000,
  });
}
