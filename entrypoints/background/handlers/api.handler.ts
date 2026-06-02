import { signTransactionHash, getPublicKeyFromPrivate } from '@canton-network/core-signing-lib';
import { ok, err } from '@lib/messaging';
import type {
  MessageResponse,
  BalancesData,
  PaginatedOffersData,
  AboutMeData,
  PrepareData,
} from '@lib/messaging';
import type {
  PrepareTransferOfferProps,
  GetIncomingRequestsQuery,
  GetHistoryRequestsQuery,
} from '@lib/types';
import { localStore, sessionStore } from '@lib/storage';
import apiClient from '../api-client';
import { getCachedPrivateKey } from './session.handler';

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

export async function handlePrepareTransferOffer(
  payload: PrepareTransferOfferProps,
): Promise<MessageResponse<PrepareData>> {
  try {
    const { data } = await apiClient.post(
      '/transfer-offer/prepare',
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
      '/transfer-offer/incoming-requests',
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
      '/transfer-offer/outgoing-requests',
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
      '/transfer-offer/history',
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
      '/transfer-offer/approve/prepare',
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
      '/transfer-offer/reject/prepare',
      payload,
    );
    return ok({ preparedData: data.data });
  } catch (e: unknown) {
    return err(e instanceof Error ? e.message : 'Prepare reject failed');
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

    let privateKey = getCachedPrivateKey();
    if (!privateKey) {
      const keystore = await localStore.get('keystore');
      if (!keystore) return err('No keystore found');
      const { getEncryptionProvider } = await import('../encryption');
      const provider = await getEncryptionProvider();
      privateKey = await provider.decryptKey(keystore, password);
    }

    const { data: prepareRes } = await apiClient.post(
      '/external-party/devnet-tap/prepare',
      { partyId, amount },
    );
    const prepared = prepareRes.data;
    if (!prepared?.preparedTransactionHash) {
      return err('Faucet prepare returned no transaction hash');
    }

    const signature = signTransactionHash(prepared.preparedTransactionHash, privateKey);
    const publicKey = getPublicKeyFromPrivate(privateKey);

    await apiClient.post('/external-party/devnet-tap/submit', {
      preparedTransaction: prepared.preparedTransaction,
      preparedTransactionHash: prepared.preparedTransactionHash,
      signature,
      publicKey,
      partyId,
    });

    return ok({ success: true });
  } catch (e: unknown) {
    return err(e instanceof Error ? e.message : 'Faucet request failed');
  }
}

export async function handlePrepareWithdraw(payload: {
  contractId: string;
  tokenId: string;
}): Promise<MessageResponse<PrepareData>> {
  try {
    const { data } = await apiClient.post(
      '/transfer-offer/withdraw/prepare',
      payload,
    );
    return ok({ preparedData: data.data });
  } catch (e: unknown) {
    return err(e instanceof Error ? e.message : 'Prepare withdraw failed');
  }
}
