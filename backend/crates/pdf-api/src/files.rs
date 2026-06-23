use crate::state::AppState;
use axum::{
    extract::{Multipart, Path, State},
    http::{StatusCode, HeaderMap, HeaderValue, header},
    response::IntoResponse,
};
use std::path::PathBuf;
use tokio::{fs, io::AsyncWriteExt};

pub async fn save_multipart_files(
    state: &AppState,
    mut multipart: Multipart,
    max_bytes: u64,
) -> Result<(Vec<PathBuf>, std::collections::HashMap<String, String>), String> {
    let upload_dir = state.config.work_dir.join("uploads").join(uuid_like());
    fs::create_dir_all(&upload_dir)
        .await
        .map_err(|error| error.to_string())?;

    let mut saved = Vec::new();
    let mut form_options = std::collections::HashMap::new();

    while let Some(field) = multipart
        .next_field()
        .await
        .map_err(|error| error.to_string())?
    {
        let name = field.name().unwrap_or("").to_string();
        if field.file_name().is_some() {
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
        } else {
            if !name.is_empty() {
                let value = field.text().await.map_err(|error| error.to_string())?;
                if name == "options" {
                    if let Ok(json_val) = serde_json::from_str::<serde_json::Value>(&value) {
                        if let Some(obj) = json_val.as_object() {
                            for (k, v) in obj {
                                let str_val = match v {
                                    serde_json::Value::String(s) => s.clone(),
                                    _ => v.to_string(),
                                };
                                form_options.insert(k.clone(), str_val);
                            }
                        }
                    }
                } else {
                    form_options.insert(name, value);
                }
            }
        }
    }

    Ok((saved, form_options))
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
        .join(&file_name);

    match fs::read(&path).await {
        Ok(bytes) => {
            let content_type = mime_for_extension(&file_name);
            let disposition = format!("attachment; filename=\"{}\"", file_name);

            let mut headers = HeaderMap::new();
            if let Ok(ct) = HeaderValue::from_str(content_type) {
                headers.insert(header::CONTENT_TYPE, ct);
            }
            if let Ok(cd) = HeaderValue::from_str(&disposition) {
                headers.insert(header::CONTENT_DISPOSITION, cd);
            }
            // Allow file to be downloaded (not blocked by frame options)
            headers.insert(
                header::CACHE_CONTROL,
                HeaderValue::from_static("private, no-store"),
            );

            (headers, bytes).into_response()
        }
        Err(_) => StatusCode::NOT_FOUND.into_response(),
    }
}

/// Returns the MIME type string for a given file name based on its extension.
fn mime_for_extension(file_name: &str) -> &'static str {
    let lower = file_name.to_lowercase();
    if lower.ends_with(".pdf") {
        "application/pdf"
    } else if lower.ends_with(".zip") {
        "application/zip"
    } else if lower.ends_with(".docx") {
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    } else if lower.ends_with(".xlsx") {
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    } else if lower.ends_with(".pptx") {
        "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    } else if lower.ends_with(".txt") {
        "text/plain; charset=utf-8"
    } else if lower.ends_with(".html") || lower.ends_with(".htm") {
        "text/html; charset=utf-8"
    } else if lower.ends_with(".png") {
        "image/png"
    } else if lower.ends_with(".jpg") || lower.ends_with(".jpeg") {
        "image/jpeg"
    } else if lower.ends_with(".gif") {
        "image/gif"
    } else if lower.ends_with(".webp") {
        "image/webp"
    } else {
        "application/octet-stream"
    }
}

pub fn require_one(
    mut inputs: Vec<PathBuf>,
    label: &str,
) -> Result<PathBuf, String> {
    if inputs.len() == 1 {
        return Ok(inputs.remove(0));
    }

    Err(format!("{label} needs exactly one file"))
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
