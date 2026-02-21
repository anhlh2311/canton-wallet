# Backlog: Adopt Splice Wallet Kernel / Wallet Gateway

**Status:** Backlog
**Priority:** Low (future improvement)
**Scope:** Canton Exchange Backend + Canton Wallet Extension

## Context

The `@canton-network/wallet-sdk` npm package is **Node.js only** (confirmed by its README: "Currently the SDK only supports NodeJS environments"). Attempting to bundle it in the browser extension requires stubbing `http2`, `dns`, `fs`, `tls`, `net`, and polyfilling `crypto`, `buffer`, etc. — and the gRPC transport still won't function at runtime.

The upstream source repo is **Splice Wallet Kernel** (`hyperledger-labs/splice-wallet-kernel`), a TypeScript monorepo by Digital Asset that provides the official framework for building wallet integrations on Canton Network.

Local clone: `/Users/lehoanganh/Working/FETCH/Angelhack/Canton/splice-wallet-kernel/`

## Splice Wallet Kernel Overview

### Architecture

```
┌─────────────┐    dApp API (CIP-103)    ┌──────────────────┐    Ledger API     ┌──────────────────┐
│   Your dApp │ ◄──────────────────────► │  Wallet Gateway  │ ◄───────────────► │ Canton Validator │
│ (dApp SDK)  │   (HTTP / postMessage)   │   (Express.js)   │                   │                  │
└─────────────┘                          │  ┌────────────┐  │   Signing         └──────────────────┘
                                         │  │  User API  │  │   ┌──────────────────┐
                                         │  │  User UI   │  │ ◄►│ Signing Provider │
                                         │  └────────────┘  │   │ (Participant,    │
                                         └──────────────────┘   │  Fireblocks, …)  │
                                                                └──────────────────┘
```

### Key Packages

| Package | Purpose |
|---------|---------|
| `wallet-gateway/remote` | Express.js HTTP server — the Wallet Gateway |
| `wallet-gateway/extension` | Browser extension gateway — **NOT IMPLEMENTED YET** |
| `sdk/wallet-sdk` | Low-level SDK for backends (Node.js only) |
| `sdk/dapp-sdk` | Browser SDK for dApps (CIP-103 client) |
| `core/signing-lib` | Signing driver interfaces |
| `core/signing-internal` | Internal Ed25519 signing (same as our extension) |
| `core/signing-participant` | Canton participant-managed signing |
| `core/signing-fireblocks` | Fireblocks integration |
| `core/signing-blockdaemon` | Blockdaemon integration |
| `core/ledger-client` | TypeScript Canton Ledger API client (OpenAPI-generated) |
| `core/wallet-store-sql` | SQLite / PostgreSQL persistence (Kysely ORM) |
| `core/wallet-auth` | JWT + OAuth authentication middleware |
| `core/token-standard` | Canton Token Standard implementation |

### Capabilities

- Multi-network support via JSON config (local, devnet, testnet, mainnet in one deployment)
- Pluggable signing providers (Participant, Internal Ed25519, Fireblocks, Blockdaemon)
- Full interactive submission lifecycle (prepare → sign → execute)
- Party allocation with external keypairs
- DevNet tap/faucet via `TokenStandardController.createTap()`
- dApp API (CIP-103) — JSON-RPC 2.0 standard for dApp ↔ wallet communication
- SQLite or PostgreSQL persistence
- Health checks (`/healthz`, `/readyz`)

### Configuration

Single JSON config file — example for localnet:

```json
{
  "kernel": { "id": "my-gateway", "clientType": "remote" },
  "server": { "port": 3030 },
  "store": { "connection": { "type": "sqlite", "database": "store.sqlite" } },
  "signingStore": { "connection": { "type": "sqlite", "database": "signingStore.sqlite" } },
  "bootstrap": {
    "idps": [{
      "id": "idp-self-signed",
      "type": "self_signed",
      "issuer": "self-signed"
    }],
    "networks": [{
      "id": "canton:localnet",
      "name": "LocalNet",
      "identityProviderId": "idp-self-signed",
      "auth": {
        "method": "self_signed",
        "clientId": "ledger-api-user",
        "clientSecret": "unsafe",
        "audience": "https://canton.network.global",
        "scope": "openid daml_ledger_api offline_access"
      },
      "ledgerApi": { "baseUrl": "http://localhost:2975" }
    }]
  }
}
```

---

## Overlap with Our Backend

| Capability | Our Backend (`canton-exchange-backend`) | Wallet Gateway |
|---|---|---|
| Canton Ledger API | Hand-rolled `CantonClientService` (~500 LOC) | `LedgerClient` (OpenAPI-generated) |
| Interactive submission | Manual in `TopologyService` | Built-in prepare → sign → execute |
| Party allocation | Custom onboarding flow | `PartyAllocationService` |
| Auth to Canton | Manual JWT creation (share-secret, oauth2) | Pluggable (self-signed, OAuth, client_credentials) |
| Signing | External only (wallet extension signs) | Pluggable drivers (4 providers) |
| Multi-network | Single network per `.env` deployment | Multi-network in one config, runtime switching |

## What Our Backend Has That the Gateway Doesn't

- Swap engine (token quotes, swap execution, price feeds)
- Offer management (incoming/outgoing transfer requests, approve/reject)
- Transaction history (paginated activity feed)
- User management (Google OAuth sign-up, email/password, profiles)
- Token balances (aggregated with locked/unlocked breakdown)
- Business-specific DTOs and API contracts

---

## Adaptation Paths

### Path A: Deploy Gateway as Sidecar

Deploy the Wallet Gateway alongside our NestJS backend. Our backend delegates all Canton ledger interactions to the Gateway's User API.

**Architecture:**
```
Extension / Frontend
  │
  ├─ Business logic ──► Our NestJS Backend ──► Wallet Gateway ──► Canton Participant
  │                     (swap, offers, etc.)   (ledger, signing)
  │
  └─ (future) dApp API ──► Wallet Gateway directly
```

**Changes:**
- Replace `CantonClientService` calls with HTTP calls to Gateway's User API
- Configure Gateway with same network/auth as our `.env`
- Run both services (our backend + Gateway)

**Pros:**
- Clean separation of concerns
- Get all Gateway features (multi-network, pluggable signing) for free
- Future-proof: can expose dApp API (CIP-103) for third-party dApps

**Cons:**
- Two services to deploy and maintain
- Extra network hop for Canton operations
- Need to sync auth state between the two services

### Path B: Embed wallet-sdk in Our NestJS Backend

Use `@canton-network/wallet-sdk` as a library inside our NestJS backend. Replace our hand-rolled Canton code with SDK controllers.

**Changes:**
- `yarn add @canton-network/wallet-sdk` in backend (Node.js — no polyfill issues)
- Replace `CantonClientService` + `TopologyService` with `LedgerController` + `TokenStandardController`
- Get `createTap()` for DevNet faucet for free
- Keep all business logic (swap, offers, balances) unchanged

**Pros:**
- Minimal architectural change — swap out the Canton layer, keep everything above it
- Single service deployment
- wallet-sdk is designed for exactly this use case
- No polyfill/stub issues (Node.js native)

**Cons:**
- Still maintaining our own auth, signing flow, and network config
- Don't get Gateway's pluggable signing drivers or multi-network config
- Must track wallet-sdk version updates manually

### Path C: Replace Backend with Gateway + Business Logic Layer

Use the Wallet Gateway as the primary Canton backend. Add our business logic as a separate NestJS service or Express middleware on top.

**Architecture:**
```
Extension / Frontend
  │
  ├─ Canton ops ──────► Wallet Gateway (dApp API / User API)
  │                     └── Canton Participant
  │
  └─ Business logic ──► Our Business API (NestJS)
                        └── Database (swap, offers, history)
```

**Changes:**
- Extension uses `@canton-network/dapp-sdk` for standard Canton operations
- Our backend becomes a pure business logic service (no Canton calls)
- Wallet Gateway handles auth, signing, network management

**Pros:**
- Most "correct" architecture long-term
- Clean separation: Canton plumbing vs. business logic
- Get CIP-103 dApp API standard for free
- Pluggable signing drivers (Fireblocks, Blockdaemon for institutional wallets)
- Multi-network runtime switching

**Cons:**
- Significant restructuring
- Two services + database migration
- Extension needs to talk to two backends
- Gateway's browser extension is NOT IMPLEMENTED YET

---

## Recommendation

**Short-term (now):** Use **Path B** — embed wallet-sdk in the NestJS backend for DevNet tap and to modernize Canton interactions. Minimal risk, immediate value.

**Medium-term:** Evaluate **Path A** — run the Wallet Gateway as a sidecar when we need multi-network support or pluggable signing beyond Ed25519.

**Long-term:** Consider **Path C** when the Gateway matures (especially the browser extension implementation) and when we need CIP-103 dApp API support for third-party integrations.

## Key Files in splice-wallet-kernel

| File | Purpose |
|------|---------|
| `wallet-gateway/remote/src/init.ts` | Gateway server initialization with all signing drivers |
| `wallet-gateway/remote/src/config/Config.ts` | Zod configuration schema |
| `wallet-gateway/remote/src/user-api/controller.ts` | User API: createWallet, sign, execute, sessions |
| `wallet-gateway/remote/src/dapp-api/controller.ts` | dApp API: connect, prepareExecute, ledgerApi proxy |
| `wallet-gateway/test/config.json` | Full example config with local, devnet, localnet networks |
| `sdk/wallet-sdk/src/tokenStandardController.ts` | Token transfers + `createTap()` (faucet) |
| `sdk/wallet-sdk/src/ledgerController.ts` | Core ledger operations (prepare/sign/execute) |
| `sdk/wallet-sdk/src/topologyController.ts` | External party allocation |
| `core/signing-internal/` | Internal Ed25519 signing driver |
| `core/ledger-client/` | TypeScript Canton Ledger API client |
| `docs/dapp-building/wallet-gateway/configuration/` | Detailed configuration documentation |

## References

- Repo: `https://github.com/hyperledger-labs/splice-wallet-kernel`
- CIP-103 spec: `https://github.com/canton-foundation/cips/blob/main/cip-0103/cip-0103.md`
- wallet-sdk README: `splice-wallet-kernel/sdk/wallet-sdk/README.md`
- Gateway config docs: `splice-wallet-kernel/docs/dapp-building/wallet-gateway/configuration/index.md`
