export interface ApiResponse<T = unknown> {
  data: {
    data: T;
    code?: number;
    metadata: { timestamp: string };
  };
}

export interface PaginatedResponse<T> {
  data: {
    page: number;
    data: T[];
    incomingRequestes?: T[];
    outgoingRequestes?: T[];
    transferHistories?: T[];
    limit: number;
    total: number;
    totalPages: number;
    first: boolean;
    last: boolean;
    has_next: boolean;
    has_previous: boolean;
  };
  msg: string;
}
