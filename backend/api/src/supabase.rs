use std::{
    collections::HashMap,
    sync::Arc,
    time::Duration,
};

use chrono::{Duration as ChronoDuration, Utc};
use parking_lot::RwLock;
use reqwest::{header::CONTENT_TYPE, Client, StatusCode};
use serde_json::json;
use uuid::Uuid;

use crate::types::{SupabaseUser, SupabaseWillCount};

#[derive(Clone)]
pub struct SupabaseClient {
    base_url: String,
    service_role_key: String,
    client: Client,
    fallback_counts: Arc<RwLock<HashMap<String, SupabaseWillCount>>>,
    fallback_users: Arc<RwLock<HashMap<String, SupabaseUser>>>,
}

impl SupabaseClient {
    pub fn new(base_url: String, service_role_key: String) -> anyhow::Result<Self> {
        let client = Client::builder()
            .timeout(Duration::from_secs(5))
            .build()?;

        Ok(Self {
            base_url: base_url.trim_end_matches('/').to_string(),
            service_role_key,
            client,
            fallback_counts: Arc::new(RwLock::new(HashMap::new())),
            fallback_users: Arc::new(RwLock::new(HashMap::new())),
        })
    }

    fn headers(&self) -> Vec<(reqwest::header::HeaderName, String)> {
        vec![
            (reqwest::header::HeaderName::from_static("apikey"), self.service_role_key.clone()),
            (reqwest::header::AUTHORIZATION, format!("Bearer {}", self.service_role_key)),
            (CONTENT_TYPE, "application/json".to_string()),
        ]
    }

    pub async fn health_check(&self) -> bool {
        let url = format!("{}/rest/v1/", self.base_url);
        let request = self.client.get(url);
        let request = self.headers().into_iter().fold(request, |r, (k, v)| r.header(k, v));
        match request.send().await {
            Ok(resp) => resp.status() == StatusCode::OK || resp.status() == StatusCode::NOT_FOUND,
            Err(_) => false,
        }
    }

    pub async fn get_user_by_auth0(&self, auth0_id: &str) -> anyhow::Result<Option<SupabaseUser>> {
        let url = format!("{}/rest/v1/users", self.base_url);
        let request = self
            .client
            .get(url)
            .query(&[("auth0_id", format!("eq.{}", auth0_id)), ("select", "*".to_string())]);
        let request = self.headers().into_iter().fold(request, |r, (k, v)| r.header(k, v));
        let resp = request.send().await?;
        if resp.status() != StatusCode::OK {
            return Ok(None);
        }
        let users: Vec<SupabaseUser> = resp.json().await?;
        Ok(users.into_iter().next())
    }

    pub async fn ensure_user_exists(&self, auth0_id: &str, email: &str) -> anyhow::Result<SupabaseUser> {
        if let Some(user) = self.get_user_by_auth0(auth0_id).await? {
            return Ok(user);
        }

        let url = format!("{}/rest/v1/users", self.base_url);
        let payload = json!({ "auth0_id": auth0_id, "email": email });
        let request = self.client.post(url).json(&payload).header("Prefer", "return=representation");
        let request = self.headers().into_iter().fold(request, |r, (k, v)| r.header(k, v));
        let resp = request.send().await;
        match resp {
            Ok(resp) if resp.status() == StatusCode::CREATED => {
                let created: Vec<SupabaseUser> = resp.json().await?;
                if let Some(user) = created.into_iter().next() {
                    return Ok(user);
                }
            }
            Ok(resp) if resp.status() == StatusCode::CONFLICT => {
                if let Some(user) = self.get_user_by_auth0(auth0_id).await? {
                    return Ok(user);
                }
            }
            Ok(_) => {}
            Err(_) => {}
        }

        // Fallback user
        Ok(self.fallback_user(auth0_id, email))
    }

    pub async fn update_last_login(&self, user_id: &str) -> anyhow::Result<bool> {
        let url = format!("{}/rest/v1/users", self.base_url);
        let now = Utc::now().to_rfc3339();
        let payload = json!({ "last_login": now });
        let request = self
            .client
            .patch(url)
            .query(&[("id", format!("eq.{}", user_id))])
            .json(&payload)
            .header("Prefer", "return=representation");
        let request = self.headers().into_iter().fold(request, |r, (k, v)| r.header(k, v));
        let resp = request.send().await?;
        Ok(resp.status() == StatusCode::OK)
    }

    pub async fn get_today_count(&self, user_id: &str) -> anyhow::Result<SupabaseWillCount> {
        let today = Utc::now().date_naive().to_string();
        let url = format!("{}/rest/v1/will_counts", self.base_url);
        let request = self
            .client
            .get(url.clone())
            .query(&[
                ("user_id", format!("eq.{}", user_id)),
                ("date", format!("eq.{}", today)),
                ("select", "*".to_string()),
            ]);
        let request = self.headers().into_iter().fold(request, |r, (k, v)| r.header(k, v));

        match request.send().await {
            Ok(resp) if resp.status() == StatusCode::OK => {
                let counts: Vec<SupabaseWillCount> = resp.json().await?;
                if let Some(count) = counts.into_iter().next() {
                    return Ok(count);
                }
            }
            _ => {}
        }

        // Create new record
        let now = Utc::now().to_rfc3339();
        let payload = json!({
            "user_id": user_id,
            "date": today,
            "count": 0,
            "timestamps": Vec::<String>::new(),
            "created_at": now,
            "updated_at": now
        });
        let request = self
            .client
            .post(url)
            .json(&payload)
            .header("Prefer", "return=representation");
        let request = self.headers().into_iter().fold(request, |r, (k, v)| r.header(k, v));
        match request.send().await {
            Ok(resp) if resp.status() == StatusCode::CREATED => {
                let counts: Vec<SupabaseWillCount> = resp.json().await?;
                if let Some(count) = counts.into_iter().next() {
                    return Ok(count);
                }
            }
            _ => {}
        }

        Ok(self.fallback_today(user_id))
    }

    pub async fn increment_count(&self, user_id: &str) -> anyhow::Result<SupabaseWillCount> {
        // Try RPC first
        let rpc_url = format!("{}/rest/v1/rpc/increment_will_count", self.base_url);
        let payload = json!({ "p_user_id": user_id });
        let request = self.client.post(rpc_url).json(&payload);
        let request = self.headers().into_iter().fold(request, |r, (k, v)| r.header(k, v));
        if let Ok(resp) = request.send().await {
            if resp.status() == StatusCode::OK {
                if let Ok(updated) = resp.json::<SupabaseWillCount>().await {
                    return Ok(updated);
                }
            }
        }

        // Manual patch
        let current = self.get_today_count(user_id).await.unwrap_or_else(|_| self.fallback_today(user_id));
        let now = Utc::now().to_rfc3339();
        let mut new_timestamps = current.timestamps.clone();
        new_timestamps.push(now.clone());
        let payload = json!({
            "count": current.count + 1,
            "timestamps": new_timestamps,
            "updated_at": now
        });
        let url = format!("{}/rest/v1/will_counts", self.base_url);
        let request = self
            .client
            .patch(url)
            .query(&[("id", format!("eq.{}", current.id))])
            .json(&payload)
            .header("Prefer", "return=representation");
        let request = self.headers().into_iter().fold(request, |r, (k, v)| r.header(k, v));
        if let Ok(resp) = request.send().await {
            if resp.status() == StatusCode::OK {
                if let Ok(updated) = resp.json::<Vec<SupabaseWillCount>>().await {
                    if let Some(item) = updated.into_iter().next() {
                        return Ok(item);
                    }
                }
            }
        }

        Ok(self.increment_fallback(user_id))
    }

    pub async fn reset_today(&self, user_id: &str) -> anyhow::Result<SupabaseWillCount> {
        let current = self.get_today_count(user_id).await.unwrap_or_else(|_| self.fallback_today(user_id));
        let now = Utc::now().to_rfc3339();
        let payload = json!({
            "count": 0,
            "timestamps": Vec::<String>::new(),
            "updated_at": now
        });
        let url = format!("{}/rest/v1/will_counts", self.base_url);
        let request = self
            .client
            .patch(url)
            .query(&[("id", format!("eq.{}", current.id))])
            .json(&payload)
            .header("Prefer", "return=representation");
        let request = self.headers().into_iter().fold(request, |r, (k, v)| r.header(k, v));
        if let Ok(resp) = request.send().await {
            if resp.status() == StatusCode::OK {
                if let Ok(updated) = resp.json::<Vec<SupabaseWillCount>>().await {
                    if let Some(item) = updated.into_iter().next() {
                        return Ok(item);
                    }
                }
            }
        }

        Ok(self.reset_fallback(user_id))
    }

    pub async fn get_statistics(&self, user_id: &str, days: i32) -> anyhow::Result<Vec<SupabaseWillCount>> {
        let start_date = (Utc::now().date_naive() - ChronoDuration::days(days as i64)).to_string();
        let url = format!("{}/rest/v1/will_counts", self.base_url);
        let request = self
            .client
            .get(url)
            .query(&[
                ("user_id", format!("eq.{}", user_id)),
                ("date", format!("gte.{}", start_date)),
                ("order", "date.desc".to_string()),
                ("select", "*".to_string()),
            ]);
        let request = self.headers().into_iter().fold(request, |r, (k, v)| r.header(k, v));
        let resp = request.send().await?;
        if resp.status() != StatusCode::OK {
            return Ok(vec![]);
        }
        let data: Vec<SupabaseWillCount> = resp.json().await?;
        Ok(data)
    }

    fn fallback_key(&self, user_id: &str) -> String {
        format!("{}-{}", user_id, Utc::now().date_naive())
    }

    fn fallback_today(&self, user_id: &str) -> SupabaseWillCount {
        let key = self.fallback_key(user_id);
        let mut store = self.fallback_counts.write();
        if let Some(existing) = store.get(&key) {
            return existing.clone();
        }
        let now = Utc::now();
        let record = SupabaseWillCount {
            id: Uuid::new_v4(),
            user_id: Uuid::parse_str(user_id).unwrap_or_else(|_| Uuid::new_v4()),
            date: now.date_naive().to_string(),
            count: 0,
            timestamps: vec![],
            created_at: now.to_rfc3339(),
            updated_at: now.to_rfc3339(),
        };
        store.insert(key, record.clone());
        record
    }

    fn increment_fallback(&self, user_id: &str) -> SupabaseWillCount {
        let key = self.fallback_key(user_id);
        let mut store = self.fallback_counts.write();
        let entry = store.entry(key.clone()).or_insert_with(|| self.fallback_today(user_id));
        entry.count += 1;
        entry.timestamps.push(Utc::now().to_rfc3339());
        entry.updated_at = Utc::now().to_rfc3339();
        entry.clone()
    }

    fn reset_fallback(&self, user_id: &str) -> SupabaseWillCount {
        let key = self.fallback_key(user_id);
        let mut store = self.fallback_counts.write();
        let entry = store.entry(key.clone()).or_insert_with(|| self.fallback_today(user_id));
        entry.count = 0;
        entry.timestamps.clear();
        entry.updated_at = Utc::now().to_rfc3339();
        entry.clone()
    }

    fn fallback_user(&self, auth0_id: &str, email: &str) -> SupabaseUser {
        let mut store = self.fallback_users.write();
        let key = format!("fallback-{}", auth0_id);
        if let Some(user) = store.get(&key) {
            return user.clone();
        }
        let now = Utc::now().to_rfc3339();
        let user = SupabaseUser {
            id: Uuid::new_v4(),
            auth0_id: auth0_id.to_string(),
            email: email.to_string(),
            created_at: now.clone(),
            last_login: None,
            preferences: json!({"soundEnabled": true, "notificationEnabled": true, "theme": "light"}),
        };
        store.insert(key, user.clone());
        user
    }
}
