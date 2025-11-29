use std::env;

#[derive(Clone, Debug)]
pub struct Config {
    pub port: u16,
    pub supabase_url: String,
    pub supabase_service_role_key: String,
    pub auth0_domain: String,
    pub auth0_audience: String,
}

impl Config {
    pub fn from_env() -> anyhow::Result<Self> {
        let port = env::var("PORT").ok().and_then(|v| v.parse().ok()).unwrap_or(8080);
        let supabase_url = env::var("SUPABASE_URL")?;
        let supabase_service_role_key = env::var("SUPABASE_SERVICE_ROLE_KEY")?;
        let auth0_domain = env::var("AUTH0_DOMAIN")?;
        let auth0_audience = env::var("AUTH0_AUDIENCE")?;

        Ok(Self {
            port,
            supabase_url: supabase_url.trim_end_matches('/').to_string(),
            supabase_service_role_key,
            auth0_domain: auth0_domain.trim_end_matches('/').to_string(),
            auth0_audience,
        })
    }
}
