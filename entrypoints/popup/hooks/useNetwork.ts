import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sendMessage, MSG } from '@lib/messaging';
import type { NetworkData } from '@lib/messaging';
import type { NetworkId } from '@lib/network';

export function useNetwork() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['network'],
    queryFn: () => sendMessage<NetworkData>({ action: MSG.GET_NETWORK }),
    staleTime: Infinity,
  });

  const switchMutation = useMutation({
    mutationFn: (network: NetworkId) =>
      sendMessage<NetworkData>({
        action: MSG.SWITCH_NETWORK,
        payload: { network },
      }),
    onSuccess: (result) => {
      queryClient.setQueryData(['network'], result);
      // Invalidate all queries since we switched networks
      queryClient.invalidateQueries();
    },
  });

  return {
    network: data?.network,
    config: data?.config,
    isLoading,
    switchNetwork: switchMutation.mutateAsync,
    isSwitching: switchMutation.isPending,
  };
}
