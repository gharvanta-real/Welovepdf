use crate::{capabilities::find_binary, command::run_command, EngineConfig};
use serde::Serialize;
use std::path::Path;
use thiserror::Error;

#[derive(Debug, Clone, Serialize)]
pub struct PdfMetadata {
    pub pages: Option<u32>,
    pub pdf_version: Option<String>,
    pub encrypted: Option<bool>,
}

#[derive(Debug, Error)]
pub enum MetadataError {
    #[error("pdfinfo binary was not found")]
    MissingPdfInfo,
    #[error("pdfinfo failed: {0}")]
    Command(#[from] crate::command::CommandError),
}

pub fn inspect_pdf(
    config: &EngineConfig,
    input: impl AsRef<Path>,
) -> Result<PdfMetadata, MetadataError> {
    let pdfinfo = find_binary(&["pdfinfo"]).ok_or(MetadataError::MissingPdfInfo)?;
    let args = vec![input.as_ref().as_os_str().to_owned()];
    let output = run_command(&pdfinfo, args, config.command_timeout)?;
    Ok(parse_pdfinfo(&output.stdout))
}

fn parse_pdfinfo(text: &str) -> PdfMetadata {
    let mut metadata = PdfMetadata {
        pages: None,
        pdf_version: None,
        encrypted: None,
    };

    for line in text.lines() {
        if let Some(value) = line.strip_prefix("Pages:") {
            metadata.pages = value.trim().parse().ok();
        }
        if let Some(value) = line.strip_prefix("PDF version:") {
            metadata.pdf_version = Some(value.trim().to_string());
        }
        if let Some(value) = line.strip_prefix("Encrypted:") {
            metadata.encrypted = Some(value.trim().eq_ignore_ascii_case("yes"));
        }
    }

    metadata
}
