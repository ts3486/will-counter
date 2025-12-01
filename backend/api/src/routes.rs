use std::sync::Arc;

use axum::{
    extract::{Path, Query, State},
    http::{HeaderValue, Method, StatusCode},
    middleware,
    response::{IntoResponse, Response},
    routing::{get, post},
    Extension, Json, Router,
};
use serde::Deserialize;
use serde_json::json;
use tower_http::cors::{AllowOrigin, CorsLayer};
use utoipa::OpenApi;
use utoipa_swagger_ui::SwaggerUi;

use crate::{
    auth::{require_auth, AuthState, AuthUser},
    config::Config,
    supabase::SupabaseClient,
    types::{ApiResponse, CreateUserRequest, DailyStat, StatisticsResponse, SupabaseUser, UserResponse, WillCountResponse},
};

#[derive(Clone)]
pub struct AppState {
    pub supabase: SupabaseClient,
    pub cfg: Config,
    pub auth: AuthState,
}

type SharedState = Arc<AppState>;

fn map_user(user: SupabaseUser) -> UserResponse {
    UserResponse {
        id: user.id.to_string(),
        auth0_id: user.auth0_id,
        email: user.email,
        created_at: user.created_at,
        last_login: user.last_login,
        preferences: user.preferences,
    }
}

pub fn user_routes(state: SharedState) -> Router<SharedState> {
    let auth_layer = middleware::from_fn_with_state(state.auth.clone(), require_auth);

    let authed = Router::new()
        .route("/", post(create_user))
        .route("/me", get(me))
        .layer(auth_layer.clone());

    Router::new()
        .merge(authed)
        .route("/:auth0Id", get(get_user_by_auth0))
        .route("/:userId/login", post(update_login))
        .with_state(state)
        .layer(cors_layer())
}

pub fn secure_routes(state: SharedState) -> Router<SharedState> {
    let auth_layer = middleware::from_fn_with_state(state.auth.clone(), require_auth);
    Router::new()
        .route("/users/ensure", post(ensure_user))
        .route("/today", get(today))
        .route("/increment", post(increment))
        .route("/reset", post(reset_today))
        .route("/statistics", get(statistics))
        .layer(auth_layer)
        .with_state(state)
        .layer(cors_layer())
}

pub fn docs_router<S: Clone + Send + Sync + 'static>() -> Router<S> {
    let openapi = ApiDoc::openapi();
    SwaggerUi::new("/docs").url("/docs/openapi.json", openapi).into()
}

pub async fn root() -> impl IntoResponse {
    Json(ApiResponse::<serde_json::Value> {
        success: true,
        data: Some(json!({"message": "Will Counter API", "version": "1.0.0"})),
        message: "Welcome to Will Counter API".to_string(),
        error: None,
    })
}

pub async fn health(State(state): State<SharedState>) -> impl IntoResponse {
    let supabase_healthy = state.supabase.health_check().await;
    let db_healthy = supabase_healthy; // mirror Kotlin behavior treating DB optional

    if supabase_healthy {
        (
            StatusCode::OK,
            Json(json!({
                "status": "ok",
                "supabase": "healthy",
                "sqlDatabase": if db_healthy { "healthy" } else { "unavailable" }
            })),
        )
    } else {
        (
            StatusCode::SERVICE_UNAVAILABLE,
            Json(json!({
                "status": "degraded",
                "supabase": "unavailable",
                "sqlDatabase": if db_healthy { "healthy" } else { "unavailable" }
            })),
        )
    }
}

#[utoipa::path(
    post,
    path = "/api/users",
    request_body = CreateUserRequest,
    responses(
        (status = 201, description = "User created", body = ApiResponseUserResponse),
        (status = 200, description = "User already exists", body = ApiResponseUserResponse),
        (status = 401, description = "Unauthorized"),
    ),
    security(("bearerAuth" = []))
)]
async fn create_user(
    State(state): State<SharedState>,
    Extension(user): Extension<AuthUser>,
    Json(req): Json<CreateUserRequest>,
) -> Response {
    if req.auth0_id != user.sub {
        return (
            StatusCode::FORBIDDEN,
            Json(ApiResponse::<UserResponse> {
                success: false,
                data: None,
                message: "".to_string(),
                error: Some("Cannot create user for different auth0_id".to_string()),
            }),
        )
            .into_response();
    }

    match state.supabase.get_user_by_auth0(&req.auth0_id).await {
        Ok(Some(existing)) => (
            StatusCode::OK,
            Json(ApiResponse {
                success: true,
                data: Some(map_user(existing)),
                message: "User already exists".to_string(),
                error: None,
            }),
        )
            .into_response(),
        _ => match state.supabase.ensure_user_exists(&req.auth0_id, &req.email).await {
            Ok(user) => (
                StatusCode::CREATED,
                Json(ApiResponse {
                    success: true,
                    data: Some(map_user(user)),
                    message: "User created successfully".to_string(),
                    error: None,
                }),
            )
                .into_response(),
            Err(_) => (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::<UserResponse> {
                    success: false,
                    data: None,
                    message: "".to_string(),
                    error: Some("Failed to create user".to_string()),
                }),
            )
                .into_response(),
        },
    }
}

async fn me(State(state): State<SharedState>, Extension(user): Extension<AuthUser>) -> Response {
    match state.supabase.get_user_by_auth0(&user.sub).await {
        Ok(Some(user)) => (
            StatusCode::OK,
            Json(ApiResponse {
                success: true,
                data: Some(map_user(user)),
                message: "".to_string(),
                error: None,
            }),
        )
            .into_response(),
        Ok(None) => (
            StatusCode::NOT_FOUND,
            Json(ApiResponse::<UserResponse> {
                success: false,
                data: None,
                message: "".to_string(),
                error: Some("User not found".to_string()),
            }),
        )
            .into_response(),
        Err(_) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse::<UserResponse> {
                success: false,
                data: None,
                message: "".to_string(),
                error: Some("Failed to get user".to_string()),
            }),
        )
            .into_response(),
    }
}

async fn get_user_by_auth0(State(state): State<SharedState>, Path(auth0_id): Path<String>) -> Response {
    if auth0_id.is_empty() {
        return (
            StatusCode::BAD_REQUEST,
            Json(ApiResponse::<UserResponse> {
                success: false,
                data: None,
                message: "".to_string(),
                error: Some("Auth0 ID is required".to_string()),
            }),
        )
            .into_response();
    }
    match state.supabase.get_user_by_auth0(&auth0_id).await {
        Ok(Some(user)) => (
            StatusCode::OK,
            Json(ApiResponse {
                success: true,
                data: Some(map_user(user)),
                message: "".to_string(),
                error: None,
            }),
        )
            .into_response(),
        Ok(None) => (
            StatusCode::NOT_FOUND,
            Json(ApiResponse::<UserResponse> {
                success: false,
                data: None,
                message: "".to_string(),
                error: Some("User not found".to_string()),
            }),
        )
            .into_response(),
        Err(err) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse::<UserResponse> {
                success: false,
                data: None,
                message: "".to_string(),
                error: Some(format!("Failed to get user: {}", err)),
            }),
        )
            .into_response(),
    }
}

async fn update_login(State(state): State<SharedState>, Path(user_id): Path<String>) -> impl IntoResponse {
    if user_id.is_empty() {
        return (
            StatusCode::BAD_REQUEST,
            Json(ApiResponse::<serde_json::Value> {
                success: false,
                data: None,
                message: "".to_string(),
                error: Some("User ID is required".to_string()),
            }),
        );
    }
    match state.supabase.update_last_login(&user_id).await {
        Ok(true) => (
            StatusCode::OK,
            Json(ApiResponse::<serde_json::Value> {
                success: true,
                data: None,
                message: "Last login updated".to_string(),
                error: None,
            }),
        ),
        Ok(false) => (
            StatusCode::NOT_FOUND,
            Json(ApiResponse::<serde_json::Value> {
                success: false,
                data: None,
                message: "".to_string(),
                error: Some("User not found".to_string()),
            }),
        ),
        Err(_) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse::<serde_json::Value> {
                success: false,
                data: None,
                message: "".to_string(),
                error: Some("Failed to update login".to_string()),
            }),
        ),
    }
}

#[utoipa::path(
    post,
    path = "/api/will-counts/users/ensure",
    responses((status = 200, body = ApiResponseMapStringString)),
    security(("bearerAuth" = []))
)]
async fn ensure_user(State(state): State<SharedState>, Extension(user): Extension<AuthUser>) -> Response {
    let email = user.email.clone().unwrap_or_else(|| "unknown@domain.com".to_string());
    match state.supabase.ensure_user_exists(&user.sub, &email).await {
        Ok(user) => (
            StatusCode::OK,
            Json(ApiResponse {
                success: true,
                data: Some(json!({ "user_id": user.id })),
                message: "User ensured successfully".to_string(),
                error: None,
            }),
        )
            .into_response(),
        Err(_) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse::<serde_json::Value> {
                success: false,
                data: None,
                message: "".to_string(),
                error: Some("Failed to ensure user exists".to_string()),
            }),
        )
            .into_response(),
    }
}

#[utoipa::path(
    get,
    path = "/api/will-counts/today",
    responses((status = 200, body = WillCountResponse)),
    security(("bearerAuth" = []))
)]
async fn today(State(state): State<SharedState>, Extension(user): Extension<AuthUser>) -> Response {
    let email = user.email.clone().unwrap_or_else(|| "unknown@domain.com".to_string());
    match state.supabase.ensure_user_exists(&user.sub, &email).await {
        Ok(user_data) => match state.supabase.get_today_count(&user_data.id.to_string()).await {
            Ok(count) => (
                StatusCode::OK,
                Json(WillCountResponse {
                    id: count.id.to_string(),
                    user_id: count.user_id.to_string(),
                    date: count.date,
                    count: count.count,
                    timestamps: count.timestamps,
                    created_at: count.created_at,
                    updated_at: count.updated_at,
                }),
            )
                .into_response(),
            Err(err) => (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::<serde_json::Value> {
                    success: false,
                    data: None,
                    message: "".to_string(),
                    error: Some(format!("Failed to get today's count: {}", err)),
                }),
            )
                .into_response(),
        },
        Err(_) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse::<serde_json::Value> {
                success: false,
                data: None,
                message: "".to_string(),
                error: Some("Failed to ensure user exists".to_string()),
            }),
        )
            .into_response(),
    }
}

#[utoipa::path(
    post,
    path = "/api/will-counts/increment",
    responses((status = 200, body = WillCountResponse)),
    security(("bearerAuth" = []))
)]
async fn increment(State(state): State<SharedState>, Extension(user): Extension<AuthUser>) -> Response {
    let email = user.email.clone().unwrap_or_else(|| "unknown@domain.com".to_string());
    match state.supabase.ensure_user_exists(&user.sub, &email).await {
        Ok(user_data) => match state.supabase.increment_count(&user_data.id.to_string()).await {
            Ok(count) => (
                StatusCode::OK,
                Json(WillCountResponse {
                    id: count.id.to_string(),
                    user_id: count.user_id.to_string(),
                    date: count.date,
                    count: count.count,
                    timestamps: count.timestamps,
                    created_at: count.created_at,
                    updated_at: count.updated_at,
                }),
            )
                .into_response(),
            Err(_) => (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::<serde_json::Value> {
                    success: false,
                    data: None,
                    message: "".to_string(),
                    error: Some("Failed to increment count".to_string()),
                }),
            )
                .into_response(),
        },
        Err(_) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse::<serde_json::Value> {
                success: false,
                data: None,
                message: "".to_string(),
                error: Some("Failed to ensure user exists".to_string()),
            }),
        )
            .into_response(),
    }
}

#[utoipa::path(
    post,
    path = "/api/will-counts/reset",
    responses((status = 200, body = WillCountResponse)),
    security(("bearerAuth" = []))
)]
async fn reset_today(State(state): State<SharedState>, Extension(user): Extension<AuthUser>) -> Response {
    let email = user.email.clone().unwrap_or_else(|| "unknown@domain.com".to_string());
    match state.supabase.ensure_user_exists(&user.sub, &email).await {
        Ok(user_data) => match state.supabase.reset_today(&user_data.id.to_string()).await {
            Ok(count) => (
                StatusCode::OK,
                Json(WillCountResponse {
                    id: count.id.to_string(),
                    user_id: count.user_id.to_string(),
                    date: count.date,
                    count: count.count,
                    timestamps: count.timestamps,
                    created_at: count.created_at,
                    updated_at: count.updated_at,
                }),
            )
                .into_response(),
            Err(_) => (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::<serde_json::Value> {
                    success: false,
                    data: None,
                    message: "".to_string(),
                    error: Some("Failed to reset count".to_string()),
                }),
            )
                .into_response(),
        },
        Err(_) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse::<serde_json::Value> {
                success: false,
                data: None,
                message: "".to_string(),
                error: Some("Failed to ensure user exists".to_string()),
            }),
        )
            .into_response(),
    }
}

#[derive(Deserialize)]
struct StatsQuery {
    days: Option<i32>,
}

#[utoipa::path(
    get,
    path = "/api/will-counts/statistics",
    params(
        ("days" = Option<i32>, Query, description = "Number of days to include")
    ),
    responses((status = 200, body = ApiResponseStatisticsResponse)),
    security(("bearerAuth" = []))
)]
async fn statistics(
    State(state): State<SharedState>,
    Extension(user): Extension<AuthUser>,
    Query(query): Query<StatsQuery>,
) -> Response {
    let email = user.email.clone().unwrap_or_else(|| "unknown@domain.com".to_string());
    let days = query.days.unwrap_or(30).max(1);
    match state.supabase.ensure_user_exists(&user.sub, &email).await {
        Ok(user_data) => match state.supabase.get_statistics(&user_data.id.to_string(), days).await {
            Ok(counts) => {
                let total: i32 = counts.iter().map(|c| c.count).sum();
                let today_str = chrono::Utc::now().date_naive().to_string();
                let today_count = counts.iter().find(|c| c.date == today_str).map(|c| c.count).unwrap_or(0);
                let denom = days.min(7);
                let weekly_average = if denom > 0 { total as f64 / denom as f64 } else { 0.0 };
                let daily_counts: Vec<DailyStat> = counts
                    .into_iter()
                    .map(|c| DailyStat {
                        date: c.date,
                        count: c.count,
                        sessions: c.timestamps.len(),
                    })
                    .collect();
                (
                    StatusCode::OK,
                    Json(ApiResponse {
                        success: true,
                        data: Some(StatisticsResponse {
                            total_count: total,
                            today_count,
                            weekly_average,
                            daily_counts,
                        }),
                        message: "".to_string(),
                        error: None,
                    }),
                )
                    .into_response()
            }
            Err(_) => (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::<StatisticsResponse> {
                    success: false,
                    data: None,
                    message: "".to_string(),
                    error: Some("Failed to get statistics".to_string()),
                }),
            )
                .into_response(),
        },
        Err(_) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse::<StatisticsResponse> {
                success: false,
                data: None,
                message: "".to_string(),
                error: Some("Failed to ensure user exists".to_string()),
            }),
        )
            .into_response(),
    }
}

fn cors_layer() -> CorsLayer {
    let origins = [
        HeaderValue::from_static("http://localhost:3000"),
        HeaderValue::from_static("http://localhost:8081"),
        HeaderValue::from_static("http://127.0.0.1:3000"),
        HeaderValue::from_static("http://127.0.0.1:8081"),
    ];

    CorsLayer::new()
        .allow_methods([Method::GET, Method::POST, Method::PUT, Method::PATCH, Method::DELETE, Method::OPTIONS])
        .allow_headers([axum::http::header::AUTHORIZATION, axum::http::header::CONTENT_TYPE])
        .allow_credentials(true)
        .allow_origin(AllowOrigin::list(origins))
        .max_age(std::time::Duration::from_secs(60 * 60 * 12))
}

#[derive(OpenApi)]
#[openapi(
    paths(
        create_user,
        ensure_user,
        today,
        increment,
        reset_today,
        statistics,
    ),
    components(
        schemas(
            CreateUserRequest,
            UserResponse,
            WillCountResponse,
            StatisticsResponse,
            DailyStat
        )
    ),
    tags(
        (name = "Will Counter API", description = "Secure endpoints backed by Supabase")
    ),
    security(
        ("bearerAuth" = [])
    )
)]
struct ApiDoc;
