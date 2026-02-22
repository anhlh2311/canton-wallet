import { ok, err } from '@lib/messaging';
import type {
  MessageResponse,
  BalancesData,
  PricesData,
  PaginatedOffersData,
  PaginatedActivityData,
  AboutMeData,
  PrepareData,
} from '@lib/messaging';
import type {
  PrepareTransferProps,
  PrepareTransferTokenStandardProps,
  GetIncomingRequestsQuery,
  GetHistoryRequestsQuery,
} from '@lib/types';
import { localStore, sessionStore } from '@lib/storage';
import apiClient from '../api-client';

export async function handleFetchBalances(): Promise<
  MessageResponse<BalancesData>
> {
  try {
    const partyId = await sessionStore.get('partyId');
    if (!partyId) return err('No party ID');

    const { data } = await apiClient.get('/wallet/token-balance', {
      params: { partyId },
    });

    return ok({ balances: data.data ?? [] });
  } catch (e: unknown) {
    return err(e instanceof Error ? e.message : 'Failed to fetch balances');
  }
}

export async function handleFetchPrices(): Promise<
  MessageResponse<PricesData>
> {
  try {
    const { data } = await apiClient.get('/wallet/token-prices');
    return ok({ prices: data.data });
  } catch (e: unknown) {
    return err(e instanceof Error ? e.message : 'Failed to fetch prices');
  }
}

export async function handlePrepareTransferPreapproval(
  payload: PrepareTransferProps,
): Promise<MessageResponse<PrepareData>> {
  try {
    const { data } = await apiClient.post(
      '/external-party/transfer-amulet/prepare',
      payload,
    );
    return ok({ preparedData: data.data });
  } catch (e: unknown) {
    return err(e instanceof Error ? e.message : 'Prepare transfer failed');
  }
}

export async function handlePrepareTransferTokenStandard(
  payload: PrepareTransferTokenStandardProps,
): Promise<MessageResponse<PrepareData>> {
  try {
    const { data } = await apiClient.post(
      '/transfer-token-standard/prepare',
      payload,
    );
    return ok({ preparedData: data.data });
  } catch (e: unknown) {
    return err(e instanceof Error ? e.message : 'Prepare transfer failed');
  }
}

export async function handleFetchIncomingOffers(
  payload: GetIncomingRequestsQuery,
): Promise<MessageResponse<PaginatedOffersData>> {
  try {
    const { data } = await apiClient.get(
      '/transfer-token-standard/incoming-requests',
      { params: payload },
    );
    const result = data.data;
    return ok({
      data: result.incomingRequestes ?? result.data ?? [],
      page: result.page,
      total: result.total,
      totalPages: result.totalPages,
      has_next: result.has_next,
      has_previous: result.has_previous,
    });
  } catch (e: unknown) {
    return err(e instanceof Error ? e.message : 'Failed to fetch offers');
  }
}

export async function handleFetchOutgoingOffers(
  payload: GetIncomingRequestsQuery,
): Promise<MessageResponse<PaginatedOffersData>> {
  try {
    const { data } = await apiClient.get(
      '/transfer-token-standard/outgoing-requests',
      { params: payload },
    );
    const result = data.data;
    return ok({
      data: result.outgoingRequestes ?? result.data ?? [],
      page: result.page,
      total: result.total,
      totalPages: result.totalPages,
      has_next: result.has_next,
      has_previous: result.has_previous,
    });
  } catch (e: unknown) {
    return err(e instanceof Error ? e.message : 'Failed to fetch offers');
  }
}

export async function handleFetchHistoryOffers(
  payload: GetHistoryRequestsQuery,
): Promise<MessageResponse<PaginatedOffersData>> {
  try {
    const { data } = await apiClient.get(
      '/transfer-token-standard/history',
      { params: payload },
    );
    const result = data.data;
    return ok({
      data: result.transferHistories ?? result.data ?? [],
      page: result.page,
      total: result.total,
      totalPages: result.totalPages,
      has_next: result.has_next,
      has_previous: result.has_previous,
    });
  } catch (e: unknown) {
    return err(e instanceof Error ? e.message : 'Failed to fetch history');
  }
}

export async function handlePrepareApprove(payload: {
  contractId: string;
  tokenId: string;
}): Promise<MessageResponse<PrepareData>> {
  try {
    const { data } = await apiClient.post(
      '/transfer-token-standard/approve/prepare',
      payload,
    );
    return ok({ preparedData: data.data });
  } catch (e: unknown) {
    return err(e instanceof Error ? e.message : 'Prepare approve failed');
  }
}

export async function handlePrepareReject(payload: {
  contractId: string;
  tokenId: string;
}): Promise<MessageResponse<PrepareData>> {
  try {
    const { data } = await apiClient.post(
      '/transfer-token-standard/reject/prepare',
      payload,
    );
    return ok({ preparedData: data.data });
  } catch (e: unknown) {
    return err(e instanceof Error ? e.message : 'Prepare reject failed');
  }
}

export async function handleFetchActivity(payload: {
  page: number;
  limit: number;
}): Promise<MessageResponse<PaginatedActivityData>> {
  try {
    const partyId = await sessionStore.get('partyId');
    if (!partyId) return err('No party ID');

    const { data } = await apiClient.get('/external-party/tx-history', {
      params: { ...payload, partyId },
    });
    const result = data.data;
    return ok({
      data: result.data ?? [],
      page: result.page,
      total: result.total,
      totalPages: result.totalPages,
      has_next: result.has_next,
      has_previous: result.has_previous,
    });
  } catch (e: unknown) {
    return err(e instanceof Error ? e.message : 'Failed to fetch activity');
  }
}

export async function handleFetchAboutMe(): Promise<
  MessageResponse<AboutMeData>
> {
  try {
    const { data } = await apiClient.get('/auth/me');
    return ok({ aboutMe: data.data });
  } catch (e: unknown) {
    return err(e instanceof Error ? e.message : 'Failed to fetch user info');
  }
}

export async function handleRequestFaucet(
  password: string,
  amount: string,
): Promise<MessageResponse<{ success: boolean }>> {
  try {
    const partyId = await sessionStore.get('partyId');
    if (!partyId) return err('No party ID');

    // Step 1: Prepare the faucet tap (returns preparedTransaction + hash)
    const { data: prepareResp } = await apiClient.post(
      '/external-party/devnet-tap/prepare',
      { partyId, amount },
    );
    const prepared = prepareResp.data;
    if (!prepared?.preparedTransactionHash || !prepared?.preparedTransaction) {
      return err('Faucet prepare returned invalid data');
    }

    // Step 2: Decrypt private key and sign the transaction hash
    const keystore = await localStore.get('keystore');
    if (!keystore) return err('No keystore found');
    const { getEncryptionProvider } = await import('../encryption');
    const provider = await getEncryptionProvider();
    const privateKey = await provider.decryptKey(keystore, password);

    const { signTransactionHash } = await import(
      '@canton-network/core-signing-lib'
    );
    const signature = signTransactionHash(
      prepared.preparedTransactionHash,
      privateKey,
    );

    // Step 3: Submit the signed transaction
    await apiClient.post('/external-party/devnet-tap/submit', {
      preparedTransaction: prepared.preparedTransaction,
      signature,
      partyId,
    });

    return ok({ success: true });
  } catch (e: unknown) {
    return err(e instanceof Error ? e.message : 'Faucet request failed');
  }
}
