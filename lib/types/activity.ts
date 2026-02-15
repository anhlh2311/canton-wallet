export interface InstrumentIdResponse {
  admin: string;
  id: string;
}

export interface ActivityResponse {
  amount: string;
  contractId: string;
  eventId: string;
  instrumentId: InstrumentIdResponse;
  offset: string;
  outputFee: string;
  owner: string;
  receiver: string;
  recordTime: string;
  resultHoldingCid: string;
  sender: string;
  timestamp: string;
  type: string;
  updateId: string;
}
