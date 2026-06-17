use crate::{bad_request, state::AppState};
use axum::{
    extract::{Multipart, Path, State},
    http::StatusCode,
    response::IntoResponse,
};
use std::path::PathBuf;
use tokio::{fs, io::AsyncWriteExt};

pub async fn save_multipart_files(
    state: &AppState,
    mut multipart: Multipart,
    max_bytes: u64,
) -> Result<Vec<PathBuf>, String> {
    let upload_dir = state.config.work_dir.join("uploads").join(uuid_like());
    fs::create_dir_all(&upload_dir)
        .await
        .map_err(|error| error.to_string())?;

    let mut saved = Vec::new();
    while let Some(field) = multipart
        .next_field()
        .await
        .map_err(|error| error.to_string())?
    {
        let safe_name = safe_file_name(field.file_name().unwrap_or("upload.pdf"));
        let path = upload_dir.join(format!("{}-{safe_name}", saved.len()));
        
        let mut file = fs::File::create(&path)
            .await
            .map_err(|error| error.to_string())?;

        let mut total_bytes = 0u64;
        let mut field = field;
        while let Some(chunk) = field.chunk().await.map_err(|error| error.to_string())? {
            total_bytes += chunk.len() as u64;
            if total_bytes > max_bytes {
                let _ = fs::remove_file(&path).await;
                return Err("uploaded file exceeds max size".into());
            }
            file.write_all(&chunk)
                .await
                .map_err(|error| error.to_string())?;
        }
        saved.push(path);
    }

    Ok(saved)
}

pub async fn download_file(
    State(state): State<AppState>,
    Path((job_id, file_name)): Path<(String, String)>,
) -> impl IntoResponse {
    if !is_safe_segment(&job_id) || !is_safe_segment(&file_name) {
        return StatusCode::BAD_REQUEST.into_response();
    }

    let path = state
        .config
        .work_dir
        .join(job_id)
        .join("output")
        .join(file_name);
    match fs::read(path).await {
        Ok(bytes) => bytes.into_response(),
        Err(_) => StatusCode::NOT_FOUND.into_response(),
    }
}

pub fn require_one(
    mut inputs: Vec<PathBuf>,
    label: &str,
) -> Result<PathBuf, axum::response::Response> {
    if inputs.len() == 1 {
        return Ok(inputs.remove(0));
    }

    Err(bad_request(format!("{label} needs exactly one file")))
}

fn safe_file_name(name: &str) -> String {
    name.chars()
        .filter(|ch| ch.is_ascii_alphanumeric() || matches!(ch, '.' | '-' | '_'))
        .collect::<String>()
        .chars()
        .take(80)
        .collect()
}

fn is_safe_segment(value: &str) -> bool {
    !value.is_empty()
        && value != "."
        && value != ".."
        && !value.contains("..")
        && value
            .chars()
            .all(|ch| ch.is_ascii_alphanumeric() || matches!(ch, '-' | '_' | '.'))
}

fn uuid_like() -> String {
    uuid::Uuid::new_v4().to_string()
}
