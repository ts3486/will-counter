# Backend Architecture

Rust Axum service that fronts Supabase and Auth0 for the Will Counter mobile app. The binary is built from `backend/api` and exposes REST endpoints plus Swagger UI.

## Stack and entrypoint
- Runtime: `axum` + `tokio`, compiled via `backend/Dockerfile` into a distroless image.
- Entrypoint: `backend/api/src/main.rs` wires config, Supabase client, Auth0 auth state, routes, and tracing.
- Observability: `tower_http::trace::TraceLayer` logs requests; `tracing-subscriber` is configured with `info` level by default.

## Configuration
- Source: `backend/api/src/config.rs` loads env vars with sane defaults.
- Required vars: `PORT` (default 8080), `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `AUTH0_DOMAIN`, `AUTH0_AUDIENCE`.
- `.env` is loaded if present (via `dotenvy`), so local runs can export the same values used by the frontend.

## AuthN/Z
- Middleware: `require_auth` in `backend/api/src/auth.rs` validates JWTs from Auth0 using JWKS fetched from `https://{AUTH0_DOMAIN}/.well-known/jwks.json`.
- Audience/issuer are enforced; user claims are injected as `AuthUser` into request extensions.
- All `/api/will-counts/*` and authenticated `/api/users` routes are behind this middleware; public routes are limited to `/`, `/health`, `/docs`.

## Supabase integration
- Abstraction: `SupabaseService` trait (`backend/api/src/supabase.rs`) with `SupabaseClient` implementation using Supabase REST endpoints (`/rest/v1/*`) plus an RPC call for atomic increments.
- Operations: ensure/get user by Auth0 ID, update last login, fetch/create today’s count, increment, reset, and get statistics.
- Resilience: in-memory fallbacks (`parking_lot::RwLock`) keep minimal functionality (counts and users) when Supabase is unavailable.
- Data models: internal Supabase shapes live in `backend/api/src/types.rs` (`SupabaseUser`, `SupabaseWillCount`); responses are mapped to camelCase API DTOs for the client.

## Routing layout
- Router assembly: `backend/api/src/routes.rs`.
- Public:
  - `GET /` – service banner.
  - `GET /health` – checks Supabase health and reports degraded/ok.
  - `GET /docs` – Swagger UI (UTOIPA) with OpenAPI at `/docs/openapi.json`.
- Authenticated (bearer JWT):
  - `POST /api/users` – create user (idempotent, returns existing if present).
  - `GET /api/users/:auth0Id` – fetch user by Auth0 ID.
  - `POST /api/users/:userId/login` – update last login timestamp.
  - `GET /api/users/me` – fetch current user (via token subject).
  - `POST /api/will-counts/users/ensure` – ensure Supabase user exists for the caller.
  - `GET /api/will-counts/today` – get or create today’s count for the caller.
  - `POST /api/will-counts/increment` – increment today’s count atomically (RPC fallback to patch).
  - `POST /api/will-counts/reset` – reset today’s count.
  - `GET /api/will-counts/statistics?days=30` – aggregates totals/weekly average/daily breakdown.
- CORS: `cors_layer()` allows localhost origins/standard headers for RN dev (`http://localhost:3000`, `http://localhost:8081`).

## Request flow (happy path)
1. Client sends bearer token from Auth0; middleware validates and injects `AuthUser`.
2. Route handlers call `SupabaseService`, first ensuring the user exists, then performing reads/writes against Supabase REST/RPC.
3. Responses are wrapped in `ApiResponse<T>` with `success`, `data`, `message`, and optional `error`.

## Testing
- Unit and handler tests live in `backend/api/src/routes.rs` and exercise statistics math and increment error cases using mock `SupabaseService` implementations.
- `AuthState::for_tests()` provides a lightweight stub of auth state for handler tests.

## Deploy/build
- Container build: `backend/Dockerfile` performs a two-stage build (Rust -> distroless). Binary name: `will-counter-api`.
- Fly.io config: `backend/fly.toml` (if used) sets runtime settings; service listens on `${PORT}`.
