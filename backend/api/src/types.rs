use serde::{Deserialize, Serialize};
use serde_json::Value;
use utoipa::ToSchema;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, ToSchema)]
#[serde(rename_all = "camelCase")]
#[aliases(
    ApiResponseUserResponse = ApiResponse<UserResponse>,
    ApiResponseStatisticsResponse = ApiResponse<StatisticsResponse>,
    ApiResponseMapStringString = ApiResponse<serde_json::Value>
)]
pub struct ApiResponse<T> {
    pub success: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub data: Option<T>,
    #[serde(default, skip_serializing_if = "String::is_empty")]
    pub message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct CreateUserRequest {
    pub auth0_id: String,
    pub email: String,
}

#[derive(Debug, Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "camelCase")]
pub struct UserResponse {
    pub id: String,
    pub auth0_id: String,
    pub email: String,
    pub created_at: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub last_login: Option<String>,
    pub preferences: Value,
}

#[derive(Debug, Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "camelCase")]
pub struct WillCountResponse {
    pub id: String,
    pub user_id: String,
    pub date: String,
    pub count: i32,
    pub timestamps: Vec<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "camelCase")]
pub struct StatisticsResponse {
    pub total_count: i32,
    pub today_count: i32,
    pub weekly_average: f64,
    pub daily_counts: Vec<DailyStat>,
}

#[derive(Debug, Serialize, Deserialize, ToSchema, Clone)]
#[serde(rename_all = "camelCase")]
pub struct DailyStat {
    pub date: String,
    pub count: i32,
    pub sessions: usize,
}

// Internal Supabase models (snake_case)
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SupabaseUser {
    pub id: Uuid,
    pub auth0_id: String,
    pub email: String,
    pub created_at: String,
    pub last_login: Option<String>,
    pub preferences: Value,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SupabaseWillCount {
    pub id: Uuid,
    pub user_id: Uuid,
    pub date: String,
    pub count: i32,
    pub timestamps: Vec<String>,
    pub created_at: String,
    pub updated_at: String,
}
