import { MSG } from '@lib/messaging';
import { err } from '@lib/messaging/protocol';
import type { MessageRequest } from '@lib/messaging/types';

import {
  handleGoogleAuth,
  handleGetAuthState,
  handleRefreshToken,
  handleLogout,
} from './background/handlers/auth.handler';
import {
  setupAutoLock,
  handleUnlock,
  handleLock,
  handleGetLockState,
} from './background/handlers/session.handler';
import {
  handleCreateKeypair,
  handleValidateImportKey,
  handleCompleteOnboarding,
  handleExportPrivateKey,
  handleDeleteKeystore,
} from './background/handlers/keystore.handler';
import {
  handleSignAndSubmitTransferPreapproval,
  handleSignAndSubmitTransferTokenStandard,
  handleSignAndSubmitApprove,
  handleSignAndSubmitReject,
} from './background/handlers/signing.handler';
import {
  handleFetchBalances,
  handleFetchPrices,
  handlePrepareTransferPreapproval,
  handlePrepareTransferTokenStandard,
  handleFetchIncomingOffers,
  handleFetchOutgoingOffers,
  handleFetchHistoryOffers,
  handlePrepareApprove,
  handlePrepareReject,
  handleFetchActivity,
  handleFetchAboutMe,
  handleRequestFaucet,
} from './background/handlers/api.handler';

export default defineBackground(() => {
  console.log('[Canton Wallet] Background service worker started');

  // Set up auto-lock alarm listener
  setupAutoLock();

  // Main message router
  chrome.runtime.onMessage.addListener((message: MessageRequest, _sender, sendResponse) => {
    const handler = routeMessage(message);
    handler.then(sendResponse).catch((e) => sendResponse(err(String(e))));
    return true; // Keep message channel open for async response
  });
});

async function routeMessage(message: MessageRequest) {
  switch (message.action) {
    // Auth
    case MSG.GOOGLE_AUTH:
      return handleGoogleAuth();
    case MSG.GET_AUTH_STATE:
      return handleGetAuthState();
    case MSG.REFRESH_TOKEN:
      return handleRefreshToken();
    case MSG.LOGOUT:
      return handleLogout();

    // Session
    case MSG.UNLOCK:
      return handleUnlock(message.payload.password);
    case MSG.LOCK:
      return handleLock();
    case MSG.GET_LOCK_STATE:
      return handleGetLockState();

    // Keystore
    case MSG.CREATE_KEYPAIR:
      return handleCreateKeypair();
    case MSG.VALIDATE_IMPORT_KEY:
      return handleValidateImportKey(message.payload.privateKey);
    case MSG.COMPLETE_ONBOARDING:
      return handleCompleteOnboarding(message.payload);
    case MSG.EXPORT_PRIVATE_KEY:
      return handleExportPrivateKey(message.payload.password);
    case MSG.DELETE_KEYSTORE:
      return handleDeleteKeystore();

    // Signing
    case MSG.SIGN_AND_SUBMIT_TRANSFER_PREAPPROVAL:
      return handleSignAndSubmitTransferPreapproval(message.payload);
    case MSG.SIGN_AND_SUBMIT_TRANSFER_TOKEN_STANDARD:
      return handleSignAndSubmitTransferTokenStandard(message.payload);
    case MSG.SIGN_AND_SUBMIT_APPROVE:
      return handleSignAndSubmitApprove(message.payload);
    case MSG.SIGN_AND_SUBMIT_REJECT:
      return handleSignAndSubmitReject(message.payload);

    // API proxy
    case MSG.FETCH_BALANCES:
      return handleFetchBalances();
    case MSG.FETCH_PRICES:
      return handleFetchPrices();
    case MSG.PREPARE_TRANSFER_PREAPPROVAL:
      return handlePrepareTransferPreapproval(message.payload);
    case MSG.PREPARE_TRANSFER_TOKEN_STANDARD:
      return handlePrepareTransferTokenStandard(message.payload);
    case MSG.FETCH_INCOMING_OFFERS:
      return handleFetchIncomingOffers(message.payload);
    case MSG.FETCH_OUTGOING_OFFERS:
      return handleFetchOutgoingOffers(message.payload);
    case MSG.FETCH_HISTORY_OFFERS:
      return handleFetchHistoryOffers(message.payload);
    case MSG.PREPARE_APPROVE:
      return handlePrepareApprove(message.payload);
    case MSG.PREPARE_REJECT:
      return handlePrepareReject(message.payload);
    case MSG.FETCH_ACTIVITY:
      return handleFetchActivity(message.payload);
    case MSG.FETCH_ABOUT_ME:
      return handleFetchAboutMe();
    case MSG.REQUEST_FAUCET:
      return handleRequestFaucet();

    default:
      return err(`Unknown action: ${(message as { action: string }).action}`);
  }
}
