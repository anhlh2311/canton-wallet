export interface PrepareTransferOfferProps {
  assetId: string;
  assetAmount: string;
  receiverPartyId: string;
  reason?: string;
  maxTimeToExecute?: number;
}

export interface PrepareTransferOfferResponse {
  preparedTransaction: string;
  preparedTransactionHash: string;
  hashingSchemeVersion: string;
  commandId: string;
}
