mod auth;
mod config;
mod routes;
mod supabase;
mod types;

use axum::{
    routing::get,
    Router,
};
use routes::{docs_router, health, root, secure_routes, user_routes};
use std::{net::SocketAddr, sync::Arc};
use tower_http::trace::TraceLayer;
use tracing_subscriber::fmt;

use crate::{auth::AuthState, config::Config, supabase::SupabaseClient};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Load environment variables from .env if present
    let _ = dotenvy::dotenv();

    fmt()
        .with_env_filter("info")
        .with_target(false)
        .init();

    let cfg = Config::from_env()?;

    let supabase = SupabaseClient::new(cfg.supabase_url.clone(), cfg.supabase_service_role_key.clone())?;
    let auth_state = AuthState::new(cfg.auth0_domain.clone(), cfg.auth0_audience.clone()).await?;
    let shared = Arc::new(routes::AppState { supabase, _cfg: cfg.clone(), auth: auth_state.clone() });

    let app = Router::new()
        .route("/", get(root))
        .route("/health", get(health))
        .nest("/api/users", user_routes(shared.clone()))
        .nest("/api/will-counts", secure_routes(shared.clone()))
        .merge(docs_router())
        .layer(TraceLayer::new_for_http())
        .with_state(shared);

    let addr: SocketAddr = format!("0.0.0.0:{}", cfg.port).parse()?;
    tracing::info!("Starting server on {}", addr);
    axum::serve(tokio::net::TcpListener::bind(addr).await?, app).await?;
    Ok(())
}
