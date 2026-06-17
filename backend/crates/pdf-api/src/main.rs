use axum::{
    extract::{Multipart, Path, State},
    http::StatusCode,
    response::IntoResponse,
    routing::{get, post},
    Json, Router,
};
mod files;
mod state;
use files::{download_file, require_one, save_multipart_files};
use pdf_engine::{
    metadata::inspect_pdf,
    operations::{run_compress::run_compress_job, run_merge::run_merge_job},
    operations::{run_jpg_to_pdf::run_jpg_to_pdf_job, run_pdf_to_jpg::run_pdf_to_jpg_job},
    JobOutput,
};
use serde::{Deserialize, Serialize};
use state::AppState;
use std::{net::SocketAddr, path::PathBuf};

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

#[tokio::main]
async fn main() {
    let state = AppState::new();

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
        .route("/upload/compress", post(upload_compress))
        .route("/upload/jpg-to-pdf", post(upload_jpg_to_pdf))
        .route("/upload/pdf-to-jpg", post(upload_pdf_to_jpg))
        .route("/upload/{tool_id}", post(upload_generic))
        .route("/download/{job_id}/{file_name}", get(download_file))
        .with_state(state);

    let addr = SocketAddr::from(([127, 0, 0, 1], 8080));
    let listener = tokio::net::TcpListener::bind(addr)
        .await
        .expect("bind pdf api");

    println!("pdf-api listening on http://{addr}");
    axum::serve(listener, app).await.expect("serve pdf api");
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
    job_response(&state, run_merge_job(&state.config, payload.inputs))
}

async fn run_compress(
    State(state): State<AppState>,
    Json(payload): Json<CompressRequest>,
) -> impl IntoResponse {
    job_response(&state, run_compress_job(&state.config, payload.input))
}

async fn run_jpg_to_pdf(
    State(state): State<AppState>,
    Json(payload): Json<MergeRequest>,
) -> impl IntoResponse {
    job_response(&state, run_jpg_to_pdf_job(&state.config, payload.inputs))
}

async fn run_pdf_to_jpg(
    State(state): State<AppState>,
    Json(payload): Json<CompressRequest>,
) -> impl IntoResponse {
    job_response(&state, run_pdf_to_jpg_job(&state.config, payload.input))
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
    match state.get_job(&job_id) {
        Some(record) => Json(record).into_response(),
        None => StatusCode::NOT_FOUND.into_response(),
    }
}

fn job_response(
    state: &AppState,
    result: Result<JobOutput, pdf_engine::JobError>,
) -> axum::response::Response {
    match result {
        Ok(output) => Json(state.record_output(&output)).into_response(),
        Err(error) => (
            StatusCode::BAD_REQUEST,
            Json(ErrorBody {
                error: error.to_string(),
            }),
        )
            .into_response(),
    }
}

async fn upload_merge(State(state): State<AppState>, multipart: Multipart) -> impl IntoResponse {
    match save_multipart_files(&state, multipart).await {
        Ok(inputs) => job_response(&state, run_merge_job(&state.config, inputs)),
        Err(error) => bad_request(error),
    }
}

async fn upload_compress(State(state): State<AppState>, multipart: Multipart) -> impl IntoResponse {
    match save_multipart_files(&state, multipart).await {
        Ok(inputs) => match require_one(inputs, "compress") {
            Ok(input) => job_response(&state, run_compress_job(&state.config, input)),
            Err(response) => response,
        },
        Err(error) => bad_request(error),
    }
}

async fn upload_jpg_to_pdf(
    State(state): State<AppState>,
    multipart: Multipart,
) -> impl IntoResponse {
    match save_multipart_files(&state, multipart).await {
        Ok(inputs) => job_response(&state, run_jpg_to_pdf_job(&state.config, inputs)),
        Err(error) => bad_request(error),
    }
}

async fn upload_pdf_to_jpg(
    State(state): State<AppState>,
    multipart: Multipart,
) -> impl IntoResponse {
    match save_multipart_files(&state, multipart).await {
        Ok(inputs) => match require_one(inputs, "pdf-to-jpg") {
            Ok(input) => job_response(&state, run_pdf_to_jpg_job(&state.config, input)),
            Err(response) => response,
        },
        Err(error) => bad_request(error),
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
        return Err(format!("Python processor script does not exist at {}", script.display()));
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

    let output_res = cmd.output().map_err(|e| format!("Failed to launch Python: {}", e))?;

    if !output_res.status.success() {
        let err_str = String::from_utf8_lossy(&output_res.stderr).to_string();
        let stdout_str = String::from_utf8_lossy(&output_res.stdout).to_string();
        return Err(format!("Python processing failed: {}\nStdout: {}", err_str, stdout_str));
    }

    Ok(())
}

async fn upload_generic(
    State(state): State<AppState>,
    Path(tool_id): Path<String>,
    headers: axum::http::HeaderMap,
    multipart: Multipart,
) -> impl IntoResponse {
    match save_multipart_files(&state, multipart).await {
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
                if let Err(err) = pdf_engine::operations::verify::verify_pdf(&state.config, &output) {
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

            job_response(&state, Ok(result_output))
        }
        Err(error) => bad_request(error),
    }
}

fn bad_request(error: String) -> axum::response::Response {
    (StatusCode::BAD_REQUEST, Json(ErrorBody { error })).into_response()
}
