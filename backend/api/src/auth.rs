use std::{
    sync::Arc,
    time::{Duration, Instant},
};

use axum::{
    body::Body,
    extract::State,
    http::{Request, StatusCode},
    middleware::Next,
    response::{IntoResponse, Response},
};
use parking_lot::RwLock;
use reqwest::Client;
use serde::Deserialize;
use serde_json::Value;
use crate::types::ApiResponse;

#[derive(Clone)]
pub struct AuthState {
    domain: String,
    audience: String,
    client: Client,
    jwks: Arc<RwLock<CachedJwks>>,
}

#[derive(Clone, Debug)]
pub struct AuthUser {
    pub sub: String,
    pub email: Option<String>,
    pub _raw_claims: Value,
}

#[derive(Debug, Deserialize)]
struct JwkSet {
    keys: Vec<Jwk>,
}

#[derive(Debug, Deserialize, Clone)]
struct Jwk {
    _kty: String,
    kid: String,
    n: String,
    e: String,
    _alg: String,
}

#[derive(Default)]
struct CachedJwks {
    keys: Vec<Jwk>,
    fetched_at: Option<Instant>,
}

impl AuthState {
    pub async fn new(domain: String, audience: String) -> anyhow::Result<Self> {
        let client = Client::builder().build()?;
        let jwks = Arc::new(RwLock::new(CachedJwks::default()));
        let state = Self {
            domain,
            audience,
            client,
            jwks,
        };
        // Warm JWKS cache.
        state.refresh_jwks().await.ok();
        Ok(state)
    }

    async fn refresh_jwks(&self) -> anyhow::Result<()> {
        let url = format!("https://{}/.well-known/jwks.json", self.domain.trim_end_matches('/'));
        let set: JwkSet = self.client.get(url).send().await?.json().await?;
        let mut cache = self.jwks.write();
        cache.keys = set.keys;
        cache.fetched_at = Some(Instant::now());
        Ok(())
    }

    async fn get_key(&self, kid: &str) -> Option<Jwk> {
        {
            let cache = self.jwks.read();
            if cache.keys.iter().any(|k| k.kid == kid)
                && cache
                    .fetched_at
                    .map(|t| t.elapsed() < Duration::from_secs(60 * 60 * 12))
                    .unwrap_or(false)
            {
                return cache.keys.iter().find(|k| k.kid == kid).cloned();
            }
        }
        // Refresh if stale or missing.
        if self.refresh_jwks().await.is_ok() {
            let cache = self.jwks.read();
            return cache.keys.iter().find(|k| k.kid == kid).cloned();
        }
        None
    }
}

pub async fn require_auth(State(state): State<AuthState>, mut req: Request<Body>, next: Next) -> Response {
    let Some(auth_header) = req.headers().get(axum::http::header::AUTHORIZATION) else {
        return unauthorized("Authentication required");
    };
    let auth_str = match auth_header.to_str() {
        Ok(v) => v,
        Err(_) => return unauthorized("Invalid Authorization header"),
    };
    if !auth_str.to_lowercase().starts_with("bearer ") {
        return unauthorized("Authentication required");
    }
    let token = auth_str.trim_start_matches(|c| c == 'B' || c == 'b').trim_start_matches("earer").trim();
    if token.is_empty() {
        return unauthorized("Authentication required");
    }

    let header = match jsonwebtoken::decode_header(token) {
        Ok(h) => h,
        Err(_) => return unauthorized("Invalid token header"),
    };
    let kid = match header.kid {
        Some(k) => k,
        None => return unauthorized("Invalid token kid"),
    };
    let jwk = match state.get_key(&kid).await {
        Some(k) => k,
        None => return unauthorized("Unable to fetch signing key"),
    };

    let decoding_key = match build_decoding_key(&jwk) {
        Ok(k) => k,
        Err(_) => return unauthorized("Invalid signing key"),
    };

    let mut validation = jsonwebtoken::Validation::new(jsonwebtoken::Algorithm::RS256);
    validation.set_issuer(&[format!("https://{}/", state.domain.trim_end_matches('/'))]);
    validation.set_audience(&[state.audience.clone()]);

    let token_data: jsonwebtoken::TokenData<Value> = match jsonwebtoken::decode(token, &decoding_key, &validation) {
        Ok(t) => t,
        Err(_) => return unauthorized("Invalid or expired token"),
    };

    let claims = token_data.claims;
    let sub = claims.get("sub").and_then(|v| v.as_str()).unwrap_or("").to_string();
    if sub.is_empty() {
        return unauthorized("Invalid token subject");
    }
    let email = claims.get("email").and_then(|v| v.as_str()).map(|s| s.to_string());

    req.extensions_mut().insert(AuthUser {
        sub,
        email,
        _raw_claims: claims,
    });

    next.run(req).await
}

fn build_decoding_key(jwk: &Jwk) -> anyhow::Result<jsonwebtoken::DecodingKey> {
    Ok(jsonwebtoken::DecodingKey::from_rsa_components(&jwk.n, &jwk.e)?)
}

fn unauthorized(msg: &str) -> Response {
    (
        StatusCode::UNAUTHORIZED,
        axum::Json(ApiResponse::<serde_json::Value> {
            success: false,
            data: None,
            message: "".to_string(),
            error: Some(msg.to_string()),
        }),
    )
        .into_response()
}
