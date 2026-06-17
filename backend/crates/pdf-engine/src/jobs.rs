use serde::Serialize;
use std::path::PathBuf;
use thiserror::Error;

#[derive(Debug, Clone, Serialize)]
pub struct JobOutput {
    pub job_id: String,
    pub tool_id: String,
    pub output_path: PathBuf,
    pub bytes: u64,
}

#[derive(Debug, Error)]
pub enum JobError {
    #[error("input file does not exist: {0}")]
    MissingInput(PathBuf),
    #[error("too many bytes: max {max}, got {actual}")]
    InputTooLarge { max: u64, actual: u64 },
    #[error("operation failed: {0}")]
    Operation(String),
    #[error("io error: {0}")]
    Io(#[from] std::io::Error),
}

pub fn ensure_input(path: impl Into<PathBuf>, max_bytes: u64) -> Result<PathBuf, JobError> {
    let path = path.into();
    let metadata = std::fs::metadata(&path).map_err(|_| JobError::MissingInput(path.clone()))?;

    if metadata.len() > max_bytes {
        return Err(JobError::InputTooLarge {
            max: max_bytes,
            actual: metadata.len(),
        });
    }

    Ok(path)
}
