import { sendMessage, MSG } from '@lib/messaging';
import type { KeyPairData } from '@lib/messaging';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useCreateKeypair() {
  return useMutation({
    mutationFn: () =>
      sendMessage<KeyPairData>({ action: MSG.CREATE_KEYPAIR }),
  });
}

export function useValidateImportKey() {
  return useMutation({
    mutationFn: (privateKey: string) =>
      sendMessage<KeyPairData>({
        action: MSG.VALIDATE_IMPORT_KEY,
        payload: { privateKey },
      }),
  });
}

export function useCompleteOnboarding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      password: string;
      privateKey: string;
      publicKey: string;
    }) =>
      sendMessage<{ success: boolean }>({
        action: MSG.COMPLETE_ONBOARDING,
        payload,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
}

export function useExportPrivateKey() {
  return useMutation({
    mutationFn: (password: string) =>
      sendMessage<{ privateKey: string }>({
        action: MSG.EXPORT_PRIVATE_KEY,
        payload: { password },
      }),
  });
}
