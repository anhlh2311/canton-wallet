import { sendMessage, MSG } from '@lib/messaging';
import type { PaginatedActivityData } from '@lib/messaging';
import { useQuery } from '@tanstack/react-query';
import { queryKey } from '@lib/constants';

export function useActivity(params: { page: number; limit: number }) {
  return useQuery({
    queryKey: [queryKey.ACTIVITY, params],
    queryFn: () =>
      sendMessage<PaginatedActivityData>({
        action: MSG.FETCH_ACTIVITY,
        payload: params,
      }),
  });
}
