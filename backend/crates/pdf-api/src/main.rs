use axum::{
    extract::{ConnectInfo, Multipart, Path, State},
    http::StatusCode,
    response::IntoResponse,
    routing::{get, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use std::{net::SocketAddr, path::PathBuf, str::FromStr};

mod files;
mod state;

use files::{download_file, require_one, save_multipart_files};
use pdf_engine::{
    metadata::inspect_pdf,
    operations::{run_compress::run_compress_job, run_merge::run_merge_job},
    operations::{run_jpg_to_pdf::run_jpg_to_pdf_job, run_pdf_to_jpg::run_pdf_to_jpg_job},
    JobOutput,
};
use state::AppState;

#[derive(Serialize)]
struct Health {
    status: &'static str,
    service: &'static str,
}

#[derive(Serialize)]
struct EngineStatus {
    work_dir: String,
    bin_dir: String,
    timeout_secs: u64,
    max_input_mb: u64,
    tools_total: usize,
    tools_ready: usize,
}

#[derive(Deserialize)]
struct MergeRequest {
    inputs: Vec<PathBuf>,
}

#[derive(Deserialize)]
struct CompressRequest {
    input: PathBuf,
}

#[derive(Serialize)]
struct ErrorBody {
    error: String,
}

// Auth structs
#[derive(Deserialize)]
struct RegisterRequest {
    email: String,
    name: String,
    password: String,
}

#[derive(Deserialize)]
struct LoginRequest {
    email: String,
    password: String,
}

#[derive(Serialize)]
struct AuthResponse {
    token: String,
    user: state::User,
}

#[derive(Deserialize)]
struct UpgradeRequest {
    plan: String,
}

#[derive(Serialize)]
struct UserStats {
    jobs_count_24h: i32,
    jobs_limit: i32,
    plan: String,
}

pub async fn init_db(pool: &sqlx::SqlitePool) -> Result<(), sqlx::Error> {
    sqlx::query(
        "CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            password_hash TEXT NOT NULL,
            plan TEXT NOT NULL DEFAULT 'Free',
            created_at TEXT NOT NULL
        );"
    )
    .execute(pool)
    .await?;

    sqlx::query(
        "CREATE TABLE IF NOT EXISTS sessions (
            token TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            expires_at TEXT NOT NULL,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        );"
    )
    .execute(pool)
    .await?;

    sqlx::query(
        "CREATE TABLE IF NOT EXISTS jobs (
            id TEXT PRIMARY KEY,
            user_id TEXT,
            ip_address TEXT,
            tool_id TEXT NOT NULL,
            status TEXT NOT NULL,
            output_path TEXT NOT NULL,
            bytes INTEGER NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL
        );"
    )
    .execute(pool)
    .await?;

    Ok(())
}

#[tokio::main]
async fn main() {
    // Database Setup
    let database_url = "sqlite://welovepdf.db";
    let options = sqlx::sqlite::SqliteConnectOptions::from_str(database_url)
        .expect("valid db url")
        .create_if_missing(true);

    let pool = sqlx::SqlitePool::connect_with(options)
        .await
        .expect("Failed to connect to SQLite");

    init_db(&pool).await.expect("Failed to initialize database tables");

    let state = AppState::new(pool);

    // Spawn a background task to periodically clean up files older than 1 hour
    let clean_state = state.clone();
    tokio::spawn(async move {
        let mut interval = tokio::time::interval(std::time::Duration::from_secs(300));
        loop {
            interval.tick().await;
            if let Err(error) = perform_cleanup(&clean_state).await {
                eprintln!("Cleanup task error: {error}");
            }
        }
    });

    let app = Router::new()
        .route("/health", get(health))
        .route("/engine/status", get(engine_status))
        .route("/tools", get(tools))
        .route("/capabilities", get(capabilities))
        .route("/tools/{tool_id}/plan", get(tool_plan))
        .route("/jobs/{job_id}", get(job_status))
        .route("/jobs/merge", post(run_merge))
        .route("/jobs/compress", post(run_compress))
        .route("/jobs/jpg-to-pdf", post(run_jpg_to_pdf))
        .route("/jobs/pdf-to-jpg", post(run_pdf_to_jpg))
        .route("/inspect/pdf", post(inspect_pdf_path))
        .route("/upload/merge", post(upload_merge))
        .route("/upload/merge-pdf", post(upload_merge))
        .route("/upload/compress", post(upload_compress))
        .route("/upload/jpg-to-pdf", post(upload_jpg_to_pdf))
        .route("/upload/pdf-to-jpg", post(upload_pdf_to_jpg))
        .route("/upload/{tool_id}", post(upload_generic))
        .route("/download/{job_id}/{file_name}", get(download_file))
        // New auth & user endpoints
        .route("/api/auth/register", post(register))
        .route("/api/auth/login", post(login))
        .route("/api/auth/logout", post(logout))
        .route("/api/auth/me", get(me))
        .route("/api/user/upgrade", post(upgrade_plan))
        .route("/api/user/stats", get(get_stats))
        .route("/api/user/jobs", get(get_user_jobs_endpoint))
        .with_state(state);

    let addr = SocketAddr::from(([127, 0, 0, 1], 8080));
    let listener = tokio::net::TcpListener::bind(addr)
        .await
        .expect("bind pdf api");

    println!("pdf-api listening on http://{addr}");
    axum::serve(
        listener,
        app.into_make_service_with_connect_info::<SocketAddr>(),
    )
    .await
    .expect("serve pdf api");
}

async fn perform_cleanup(state: &AppState) -> std::io::Result<()> {
    let work_dir = &state.config.work_dir;
    let limit = std::time::SystemTime::now() - std::time::Duration::from_secs(3600); // 1 hour ago

    // Clean direct children under work_dir (job folders)
    if work_dir.exists() {
        let mut entries = tokio::fs::read_dir(work_dir).await?;
        while let Some(entry) = entries.next_entry().await? {
            let path = entry.path();
            if path.is_dir() && path.file_name().map(|n| n != "uploads").unwrap_or(true) {
                if let Ok(metadata) = entry.metadata().await {
                    if let Ok(modified) = metadata.modified() {
                        if modified < limit {
                            let _ = tokio::fs::remove_dir_all(&path).await;
                        }
                    }
                }
            }
        }
    }

    // Clean uploads subfolders
    let uploads_dir = work_dir.join("uploads");
    if uploads_dir.exists() {
        let mut entries = tokio::fs::read_dir(&uploads_dir).await?;
        while let Some(entry) = entries.next_entry().await? {
            let path = entry.path();
            if path.is_dir() {
                if let Ok(metadata) = entry.metadata().await {
                    if let Ok(modified) = metadata.modified() {
                        if modified < limit {
                            let _ = tokio::fs::remove_dir_all(&path).await;
                        }
                    }
                }
            }
        }
    }

    Ok(())
}

async fn health() -> Json<Health> {
    Json(Health {
        status: "ok",
        service: "welovepdf-pdf-api",
    })
}

async fn engine_status(State(state): State<AppState>) -> Json<EngineStatus> {
    let capabilities = state.registry.capabilities();
    let tools_ready = capabilities.iter().filter(|tool| tool.ready).count();

    Json(EngineStatus {
        work_dir: state.config.work_dir.display().to_string(),
        bin_dir: state.config.bin_dir.display().to_string(),
        timeout_secs: state.config.command_timeout.as_secs(),
        max_input_mb: state.config.max_input_bytes / 1024 / 1024,
        tools_total: capabilities.len(),
        tools_ready,
    })
}

async fn tools(State(state): State<AppState>) -> impl IntoResponse {
    Json(state.registry.specs())
}

async fn capabilities(State(state): State<AppState>) -> impl IntoResponse {
    Json(state.registry.capabilities())
}

async fn tool_plan(
    State(state): State<AppState>,
    Path(tool_id): Path<String>,
) -> impl IntoResponse {
    match state.registry.plan(&tool_id) {
        Some(plan) => Json(plan).into_response(),
        None => (StatusCode::NOT_FOUND, "unknown tool").into_response(),
    }
}

async fn run_merge(
    State(state): State<AppState>,
    Json(payload): Json<MergeRequest>,
) -> impl IntoResponse {
    job_response(
        &state,
        run_merge_job(&state.config, payload.inputs),
        None,
        Some("127.0.0.1"),
    )
    .await
}

async fn run_compress(
    State(state): State<AppState>,
    Json(payload): Json<CompressRequest>,
) -> impl IntoResponse {
    job_response(
        &state,
        run_compress_job(&state.config, payload.input),
        None,
        Some("127.0.0.1"),
    )
    .await
}

async fn run_jpg_to_pdf(
    State(state): State<AppState>,
    Json(payload): Json<MergeRequest>,
) -> impl IntoResponse {
    job_response(
        &state,
        run_jpg_to_pdf_job(&state.config, payload.inputs),
        None,
        Some("127.0.0.1"),
    )
    .await
}

async fn run_pdf_to_jpg(
    State(state): State<AppState>,
    Json(payload): Json<CompressRequest>,
) -> impl IntoResponse {
    job_response(
        &state,
        run_pdf_to_jpg_job(&state.config, payload.input),
        None,
        Some("127.0.0.1"),
    )
    .await
}

async fn inspect_pdf_path(
    State(state): State<AppState>,
    Json(payload): Json<CompressRequest>,
) -> impl IntoResponse {
    match inspect_pdf(&state.config, payload.input) {
        Ok(metadata) => Json(metadata).into_response(),
        Err(error) => bad_request(error.to_string()),
    }
}

async fn job_status(
    State(state): State<AppState>,
    Path(job_id): Path<String>,
) -> impl IntoResponse {
    match state.get_job(&job_id).await {
        Some(record) => Json(record).into_response(),
        None => StatusCode::NOT_FOUND.into_response(),
    }
}

async fn job_response(
    state: &AppState,
    result: Result<JobOutput, pdf_engine::JobError>,
    user_id: Option<&str>,
    ip_address: Option<&str>,
) -> axum::response::Response {
    match result {
        Ok(output) => match state.record_output(&output, user_id, ip_address).await {
            Ok(record) => Json(record).into_response(),
            Err(error) => (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ErrorBody {
                    error: error.to_string(),
                }),
            )
                .into_response(),
        },
        Err(error) => (
            StatusCode::BAD_REQUEST,
            Json(ErrorBody {
                error: error.to_string(),
            }),
        )
            .into_response(),
    }
}

// Authentication Helpers
async fn authenticate_user(
    state: &AppState,
    headers: &axum::http::HeaderMap,
) -> Option<state::User> {
    let token = headers
        .get(axum::http::header::AUTHORIZATION)
        .and_then(|value| value.to_str().ok())
        .and_then(|auth_str| auth_str.strip_prefix("Bearer "));

    if let Some(t) = token {
        state.find_user_by_token(t).await
    } else {
        None
    }
}

async fn check_limits_and_authenticate(
    state: &AppState,
    headers: &axum::http::HeaderMap,
    ip_address: &str,
) -> Result<(Option<state::User>, u64), String> {
    let user = authenticate_user(state, headers).await;

    let (max_bytes, max_jobs) = match &user {
        Some(u) => {
            if u.plan == "Pro" {
                (500 * 1024 * 1024, 100) // 500 MB, 100 jobs
            } else {
                (50 * 1024 * 1024, 5) // 50 MB, 5 jobs
            }
        }
        None => (10 * 1024 * 1024, 2), // 10 MB, 2 jobs
    };

    let user_id = user.as_ref().map(|u| u.id.as_str());
    let current_jobs = state
        .get_job_count_last_24h(user_id, Some(ip_address))
        .await
        .map_err(|e| format!("Failed to verify usage limits: {}", e))?;

    if current_jobs >= max_jobs {
        return Err(format!(
            "Bhai, daily limit reach ho gayi hai! Your limit is {} jobs per 24 hours. Please log in or upgrade to upgrade your limit.",
            max_jobs
        ));
    }

    Ok((user, max_bytes))
}

async fn upload_merge(
    State(state): State<AppState>,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    headers: axum::http::HeaderMap,
    multipart: Multipart,
) -> impl IntoResponse {
    let ip = addr.ip().to_string();
    match check_limits_and_authenticate(&state, &headers, &ip).await {
        Ok((user, max_bytes)) => match save_multipart_files(&state, multipart, max_bytes).await {
            Ok(inputs) => {
                let user_id = user.as_ref().map(|u| u.id.as_str());
                let result = run_merge_job(&state.config, inputs);
                job_response(&state, result, user_id, Some(&ip)).await
            }
            Err(error) => bad_request(error),
        },
        Err(err_msg) => bad_request(err_msg),
    }
}

async fn upload_compress(
    State(state): State<AppState>,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    headers: axum::http::HeaderMap,
    multipart: Multipart,
) -> impl IntoResponse {
    let ip = addr.ip().to_string();
    match check_limits_and_authenticate(&state, &headers, &ip).await {
        Ok((user, max_bytes)) => match save_multipart_files(&state, multipart, max_bytes).await {
            Ok(inputs) => match require_one(inputs, "compress") {
                Ok(input) => {
                    let user_id = user.as_ref().map(|u| u.id.as_str());
                    let result = run_compress_job(&state.config, input);
                    job_response(&state, result, user_id, Some(&ip)).await
                }
                Err(response) => response,
            },
            Err(error) => bad_request(error),
        },
        Err(err_msg) => bad_request(err_msg),
    }
}

async fn upload_jpg_to_pdf(
    State(state): State<AppState>,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    headers: axum::http::HeaderMap,
    multipart: Multipart,
) -> impl IntoResponse {
    let ip = addr.ip().to_string();
    match check_limits_and_authenticate(&state, &headers, &ip).await {
        Ok((user, max_bytes)) => match save_multipart_files(&state, multipart, max_bytes).await {
            Ok(inputs) => {
                let user_id = user.as_ref().map(|u| u.id.as_str());
                let result = run_jpg_to_pdf_job(&state.config, inputs);
                job_response(&state, result, user_id, Some(&ip)).await
            }
            Err(error) => bad_request(error),
        },
        Err(err_msg) => bad_request(err_msg),
    }
}

async fn upload_pdf_to_jpg(
    State(state): State<AppState>,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    headers: axum::http::HeaderMap,
    multipart: Multipart,
) -> impl IntoResponse {
    let ip = addr.ip().to_string();
    match check_limits_and_authenticate(&state, &headers, &ip).await {
        Ok((user, max_bytes)) => match save_multipart_files(&state, multipart, max_bytes).await {
            Ok(inputs) => match require_one(inputs, "pdf-to-jpg") {
                Ok(input) => {
                    let user_id = user.as_ref().map(|u| u.id.as_str());
                    let result = run_pdf_to_jpg_job(&state.config, input);
                    job_response(&state, result, user_id, Some(&ip)).await
                }
                Err(response) => response,
            },
            Err(error) => bad_request(error),
        },
        Err(err_msg) => bad_request(err_msg),
    }
}

async fn upload_generic(
    State(state): State<AppState>,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    Path(tool_id): Path<String>,
    headers: axum::http::HeaderMap,
    multipart: Multipart,
) -> impl IntoResponse {
    let ip = addr.ip().to_string();
    match check_limits_and_authenticate(&state, &headers, &ip).await {
        Ok((user, max_bytes)) => match save_multipart_files(&state, multipart, max_bytes).await {
            Ok(inputs) => {
                if inputs.is_empty() {
                    return bad_request("No files uploaded for operation".to_string());
                }

                let workspace = match pdf_engine::JobWorkspace::create(&state.config) {
                    Ok(w) => w,
                    Err(err) => return bad_request(err.to_string()),
                };

                let job_id = workspace.id().to_string();

                // Determine expected file extension based on tool id
                let extension = match tool_id.as_str() {
                    "pdf-to-word" | "pdf-word" => "docx",
                    "pdf-to-excel" | "pdf-excel" => "xlsx",
                    "pdf-to-ppt" | "pdf-ppt" => "pptx",
                    "split-pdf" | "split" => "zip",
                    _ => "pdf",
                };

                let output = workspace.output_dir().join(format!("output.{}", extension));

                if let Err(err) = run_python_processor(&tool_id, &output, &inputs, &headers) {
                    return bad_request(err);
                }

                // Only run verify_pdf on actual PDF outputs
                if extension == "pdf" {
                    if let Err(err) =
                        pdf_engine::operations::verify::verify_pdf(&state.config, &output)
                    {
                        return bad_request(err.to_string());
                    }
                }

                let bytes = match std::fs::metadata(&output) {
                    Ok(m) => m.len(),
                    Err(_) => 0,
                };

                let result_output = JobOutput {
                    job_id,
                    tool_id,
                    output_path: output,
                    bytes,
                };

                let user_id = user.as_ref().map(|u| u.id.as_str());
                job_response(&state, Ok(result_output), user_id, Some(&ip)).await
            }
            Err(error) => bad_request(error),
        },
        Err(err_msg) => bad_request(err_msg),
    }
}

fn run_python_processor(
    tool_id: &str,
    output: &std::path::Path,
    inputs: &[std::path::PathBuf],
    headers: &axum::http::HeaderMap,
) -> Result<(), String> {
    let script = std::path::Path::new("scripts/pdf_processor.py");
    if !script.exists() {
        return Err(format!(
            "Python processor script does not exist at {}",
            script.display()
        ));
    }

    let mut cmd = std::process::Command::new("python");

    // Forward all headers starting with "x-" as uppercase environment variables
    for (name, value) in headers.iter() {
        let name_str = name.as_str();
        if name_str.starts_with("x-") {
            if let Ok(val_str) = value.to_str() {
                let env_name = name_str["x-".len()..].to_uppercase().replace("-", "_");
                cmd.env(env_name, val_str);
            }
        }
    }

    cmd.arg(script);
    cmd.arg(tool_id);
    cmd.arg(output);

    for input in inputs {
        cmd.arg(input);
    }

    let output_res = cmd
        .output()
        .map_err(|e| format!("Failed to launch Python: {}", e))?;

    if !output_res.status.success() {
        let err_str = String::from_utf8_lossy(&output_res.stderr).to_string();
        let stdout_str = String::from_utf8_lossy(&output_res.stdout).to_string();
        return Err(format!(
            "Python processing failed: {}\nStdout: {}",
            err_str, stdout_str
        ));
    }

    Ok(())
}

fn bad_request(error: String) -> axum::response::Response {
    (StatusCode::BAD_REQUEST, Json(ErrorBody { error })).into_response()
}

// Authentication Handlers
async fn register(
    State(state): State<AppState>,
    Json(payload): Json<RegisterRequest>,
) -> impl IntoResponse {
    if payload.email.trim().is_empty()
        || payload.password.trim().is_empty()
        || payload.name.trim().is_empty()
    {
        return (StatusCode::BAD_REQUEST, "All fields are required").into_response();
    }

    if state.find_user_by_email(&payload.email).await.is_some() {
        return (StatusCode::BAD_REQUEST, "User with this email already exists").into_response();
    }

    let password_hash = match bcrypt::hash(&payload.password, bcrypt::DEFAULT_COST) {
        Ok(h) => h,
        Err(e) => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("Failed to hash password: {}", e),
            )
                .into_response()
        }
    };

    let user_id = uuid::Uuid::new_v4().to_string();
    if let Err(e) = state
        .create_user(&user_id, &payload.email, &payload.name, &password_hash)
        .await
    {
        return (
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("Failed to create user: {}", e),
        )
            .into_response();
    }

    (StatusCode::CREATED, "User registered successfully").into_response()
}

async fn login(
    State(state): State<AppState>,
    Json(payload): Json<LoginRequest>,
) -> impl IntoResponse {
    let user_db = match state.find_user_by_email(&payload.email).await {
        Some(u) => u,
        None => return (StatusCode::UNAUTHORIZED, "Invalid email or password").into_response(),
    };

    let password_match = match bcrypt::verify(&payload.password, &user_db.password_hash) {
        Ok(v) => v,
        Err(_) => false,
    };

    if !password_match {
        return (StatusCode::UNAUTHORIZED, "Invalid email or password").into_response();
    }

    let token = uuid::Uuid::new_v4().to_string();
    let expires_at = chrono::Utc::now() + chrono::Duration::days(7);

    if let Err(e) = state.create_session(&token, &user_db.id, expires_at).await {
        return (
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("Failed to create session: {}", e),
        )
            .into_response();
    }

    let user = state::User {
        id: user_db.id,
        email: user_db.email,
        name: user_db.name,
        plan: user_db.plan,
        created_at: user_db.created_at,
    };

    Json(AuthResponse { token, user }).into_response()
}

async fn logout(State(state): State<AppState>, headers: axum::http::HeaderMap) -> impl IntoResponse {
    let token = headers
        .get(axum::http::header::AUTHORIZATION)
        .and_then(|value| value.to_str().ok())
        .and_then(|auth_str| auth_str.strip_prefix("Bearer "));

    if let Some(t) = token {
        let _ = state.delete_session(t).await;
    }

    StatusCode::OK.into_response()
}

async fn me(State(state): State<AppState>, headers: axum::http::HeaderMap) -> impl IntoResponse {
    match authenticate_user(&state, &headers).await {
        Some(user) => Json(user).into_response(),
        None => StatusCode::UNAUTHORIZED.into_response(),
    }
}

async fn upgrade_plan(
    State(state): State<AppState>,
    headers: axum::http::HeaderMap,
    Json(payload): Json<UpgradeRequest>,
) -> impl IntoResponse {
    match authenticate_user(&state, &headers).await {
        Some(user) => {
            if let Err(e) = state.upgrade_user_plan(&user.id, &payload.plan).await {
                return (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    format!("Failed to upgrade plan: {}", e),
                )
                    .into_response();
            }
            StatusCode::OK.into_response()
        }
        None => StatusCode::UNAUTHORIZED.into_response(),
    }
}

async fn get_stats(
    State(state): State<AppState>,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    headers: axum::http::HeaderMap,
) -> impl IntoResponse {
    let user = authenticate_user(&state, &headers).await;
    let ip = addr.ip().to_string();
    let user_id = user.as_ref().map(|u| u.id.as_str());

    let count = match state.get_job_count_last_24h(user_id, Some(&ip)).await {
        Ok(c) => c,
        Err(e) => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("Database error: {}", e),
            )
                .into_response()
        }
    };

    let max_jobs = match &user {
        Some(u) => {
            if u.plan == "Pro" {
                100
            } else {
                5
            }
        }
        None => 2,
    };

    let plan = user
        .map(|u| u.plan)
        .unwrap_or_else(|| "Guest".to_string());

    Json(UserStats {
        jobs_count_24h: count,
        jobs_limit: max_jobs,
        plan,
    })
    .into_response()
}

async fn get_user_jobs_endpoint(
    State(state): State<AppState>,
    headers: axum::http::HeaderMap,
) -> impl IntoResponse {
    match authenticate_user(&state, &headers).await {
        Some(user) => match state.get_user_jobs(&user.id).await {
            Ok(jobs) => Json(jobs).into_response(),
            Err(e) => (
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("Database error: {}", e),
            )
                .into_response(),
        },
        None => StatusCode::UNAUTHORIZED.into_response(),
    }
}
