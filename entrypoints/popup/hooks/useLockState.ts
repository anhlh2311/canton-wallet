import { sendMessage, MSG } from '@lib/messaging';
import type { LockStateData } from '@lib/messaging';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useLockState() {
  return useQuery({
    queryKey: ['lockState'],
    queryFn: () => sendMessage<LockStateData>({ action: MSG.GET_LOCK_STATE }),
    refetchOnWindowFocus: true,
  });
}

export function useUnlock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (password: string) =>
      sendMessage<LockStateData>({
        action: MSG.UNLOCK,
        payload: { password },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lockState'] });
    },
  });
}

export function useLock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => sendMessage<LockStateData>({ action: MSG.LOCK }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lockState'] });
    },
  });
}
