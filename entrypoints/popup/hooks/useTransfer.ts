import { sendMessage, MSG } from '@lib/messaging';
import type { PrepareData } from '@lib/messaging';
import type {
  PrepareTransferOfferProps,
  PrepareTransferOfferResponse,
} from '@lib/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKey } from '@lib/constants';

export function usePrepareTransferOffer() {
  return useMutation({
    mutationFn: (payload: PrepareTransferOfferProps) =>
      sendMessage<PrepareData>({
        action: MSG.PREPARE_TRANSFER_OFFER,
        payload,
      }),
  });
}

export function useSignAndSubmitTransferOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      password: string;
      preparedData: PrepareTransferOfferResponse;
    }) =>
      sendMessage<{ success: boolean }>({
        action: MSG.SIGN_AND_SUBMIT_TRANSFER_OFFER,
        payload,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey.BALANCE] });
      queryClient.invalidateQueries({ queryKey: [queryKey.HISTORY_REQUESTS] });
      queryClient.invalidateQueries({
        queryKey: [queryKey.OUTGOING_REQUESTS],
      });
    },
  });
}
