import type { FC, SVGProps } from 'react';

export interface TokenType {
  id: string;
  symbol: string;
  chainID: string;
  chainName: string;
  decimal: number;
  icon: FC<SVGProps<SVGSVGElement>>;
  minAmount: string;
}

export interface InstrumentBalanceResponse {
  admin: string;
  id: 'Amulet' | 'CBTC' | 'USDCx';
}

export interface LockedDetails {
  amount: string;
  etaUnlockAt: string;
}

export interface BalanceSwapResponse {
  instrumentId: InstrumentBalanceResponse;
  locked: string;
  unlocked: string;
  lockedDetails: LockedDetails[];
}

export interface PricesResponse {
  baseSymbolId: string;
  quoteSymbolId: string;
  price: string;
  id: number;
  tokenId: string;
}

export interface PriceFeedResponse {
  prices: PricesResponse[];
}
