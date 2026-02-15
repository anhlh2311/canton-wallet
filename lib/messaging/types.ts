import type { MSG } from './constants';
import type {
  AboutMeResponse,
  ActivityResponse,
  AutoApprovalPrepareResponse,
  BalanceSwapResponse,
  GetApproveRequestsResponse,
  GetHistoryRequestsQuery,
  GetIncomingRequestsQuery,
  PrepareTransferProps,
  PrepareTransferResponse,
  PrepareTransferTokenStandardProps,
  PrepareTransferTokenStandardResponse,
  PriceFeedResponse,
  User,
} from '../types';

// ── Request types ──

export type MessageRequest =
  // Auth
  | { action: typeof MSG.GOOGLE_AUTH }
  | { action: typeof MSG.REFRESH_TOKEN }
  | { action: typeof MSG.LOGOUT }
  | { action: typeof MSG.GET_AUTH_STATE }
  // Session
  | { action: typeof MSG.UNLOCK; payload: { password: string } }
  | { action: typeof MSG.LOCK }
  | { action: typeof MSG.GET_LOCK_STATE }
  // Keystore
  | { action: typeof MSG.CREATE_KEYPAIR }
  | {
      action: typeof MSG.VALIDATE_IMPORT_KEY;
      payload: { privateKey: string };
    }
  | {
      action: typeof MSG.COMPLETE_ONBOARDING;
      payload: {
        password: string;
        privateKey: string;
        publicKey: string;
      };
    }
  | {
      action: typeof MSG.EXPORT_PRIVATE_KEY;
      payload: { password: string };
    }
  | { action: typeof MSG.DELETE_KEYSTORE }
  // Signing
  | {
      action: typeof MSG.SIGN_AND_SUBMIT_TRANSFER_PREAPPROVAL;
      payload: {
        password: string;
        preparedData: PrepareTransferResponse;
      };
    }
  | {
      action: typeof MSG.SIGN_AND_SUBMIT_TRANSFER_TOKEN_STANDARD;
      payload: {
        password: string;
        preparedData: PrepareTransferTokenStandardResponse;
      };
    }
  | {
      action: typeof MSG.SIGN_AND_SUBMIT_APPROVE;
      payload: {
        password: string;
        preparedData: PrepareTransferTokenStandardResponse;
      };
    }
  | {
      action: typeof MSG.SIGN_AND_SUBMIT_REJECT;
      payload: {
        password: string;
        preparedData: PrepareTransferTokenStandardResponse;
      };
    }
  // API proxy
  | { action: typeof MSG.FETCH_BALANCES }
  | { action: typeof MSG.FETCH_PRICES }
  | {
      action: typeof MSG.PREPARE_TRANSFER_PREAPPROVAL;
      payload: PrepareTransferProps;
    }
  | {
      action: typeof MSG.PREPARE_TRANSFER_TOKEN_STANDARD;
      payload: PrepareTransferTokenStandardProps;
    }
  | {
      action: typeof MSG.FETCH_INCOMING_OFFERS;
      payload: GetIncomingRequestsQuery;
    }
  | {
      action: typeof MSG.FETCH_OUTGOING_OFFERS;
      payload: GetIncomingRequestsQuery;
    }
  | {
      action: typeof MSG.FETCH_HISTORY_OFFERS;
      payload: GetHistoryRequestsQuery;
    }
  | {
      action: typeof MSG.PREPARE_APPROVE;
      payload: { contractId: string; tokenId: string };
    }
  | {
      action: typeof MSG.PREPARE_REJECT;
      payload: { contractId: string; tokenId: string };
    }
  | {
      action: typeof MSG.FETCH_ACTIVITY;
      payload: { page: number; limit: number };
    }
  | { action: typeof MSG.FETCH_ABOUT_ME }
  | { action: typeof MSG.REQUEST_FAUCET };

// ── Response types ──

export type MessageResponse<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string };

// ── Response data by action ──

export interface AuthStateData {
  isAuthenticated: boolean;
  user: User | null;
  partyId: string | null;
}

export interface GoogleAuthData {
  token: string;
  user: User;
  partyId: string;
  partyStatus: 'PENDING' | 'ACTIVE';
  publicKey: string;
}

export interface LockStateData {
  unlocked: boolean;
}

export interface KeyPairData {
  privateKey: string;
  publicKey: string;
}

export interface BalancesData {
  balances: BalanceSwapResponse[];
}

export interface PricesData {
  prices: PriceFeedResponse;
}

export interface PaginatedOffersData {
  data: GetApproveRequestsResponse[];
  page: number;
  total: number;
  totalPages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface PaginatedActivityData {
  data: ActivityResponse[];
  page: number;
  total: number;
  totalPages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface AboutMeData {
  aboutMe: AboutMeResponse;
}

export interface PrepareData {
  preparedData: PrepareTransferResponse | PrepareTransferTokenStandardResponse | AutoApprovalPrepareResponse;
}
