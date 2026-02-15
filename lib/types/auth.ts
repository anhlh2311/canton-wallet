export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export interface AboutMeResponse {
  party: {
    partyId: string;
    publicKey: string;
    status: 'PENDING' | 'ACTIVE';
  };
  user: User;
}

export interface PrepareExternalPartyResponse {
  hashingDetails: string;
  hashingSchemeVersion: string;
  preparedTransaction: string;
  preparedTransactionHash: string;
}

export interface SubmitExternalPartyProps {
  preparedTransaction: string;
  signature: string;
}

export interface AutoApprovalPrepareResponse {
  hashingDetails: string;
  hashingSchemeVersion: string;
  preparedTransaction: string;
  preparedTransactionHash: string;
}

export interface AutoApprovalSubmitProps {
  preparedTransaction: string;
  signature: string;
}

export interface IndexedProps {
  cantonKey: string;
  walletKey: string;
  hashedKey: string;
}
