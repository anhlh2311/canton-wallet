import { Server } from 'socket.io';
import type { Key, Transaction, SignTransactionRequest } from './types.js';
export declare function getRegisteredKeys(): Key[];
export declare function getTransaction(txId: string): Transaction | undefined;
/**
 * Request a signature from a connected extension.
 * Returns a Promise that resolves when the extension responds or times out.
 */
export declare function requestSignature(req: SignTransactionRequest): Promise<Transaction>;
export declare function setupSocketHandler(io: Server): void;
