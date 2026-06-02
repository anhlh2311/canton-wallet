export interface PrepareTransferProps {
  senderPartyId: string;
  receiverPartyId: string;
  amount: string | number;
  reason: string;
}

export interface SubmitTransferProps {
  preparedTransaction: string;
  hashingSchemeVersion: string;
  signature: string;
  senderPartyId: string;
}

export interface PrepareTransferResponse {
  preparedTransaction: string;
  preparedTransactionHash: string;
  hashingSchemeVersion: string;
  senderPartyId: string;
  receiverPartyId: string;
  amount: string;
  disclosedContracts: string[];
}

export interface SubmitTransferResponse {
  success: boolean;
}

export interface PrepareTransferTokenStandardProps {
  assetId: string;
  assetAmount: string;
  receiverPartyId: string;
  reason: string;
  maxTimeToExecute: number;
}

export interface SubmitTransferTokenStandardProps {
  preparedTransaction: string;
  signature: string;
}

export interface PrepareTransferTokenStandardResponse {
  hashingDetails: string;
  hashingSchemeVersion: string;
  preparedTransaction: string;
  preparedTransactionHash: string;
}

export interface SubmitTransferTokenStandardResponse {
  success: boolean;
}
