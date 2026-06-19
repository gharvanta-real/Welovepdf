use crate::{capabilities::find_binary, command::run_command, EngineConfig};
use std::{ffi::OsString, path::Path};
use thiserror::Error;

#[derive(Debug, Error)]
pub enum CompressError {
    #[error("qpdf binary was not found")]
    MissingQpdf,
    #[error("ghostscript binary was not found")]
    MissingGs,
    #[error("compression command failed: {0}")]
    Command(#[from] crate::command::CommandError),
}

/// Compress using Ghostscript with a given quality setting.
/// - "extreme"     → /screen   (72 dpi images, maximum file reduction, visible quality loss)
/// - "recommended" → /ebook    (150 dpi images, good balance of quality and size)  
/// - "less"        → qpdf only (lossless stream recompression, zero pixel loss)
pub fn compress_with_level(
    config: &EngineConfig,
    input: impl AsRef<Path>,
    output: impl AsRef<Path>,
    level: &str,
) -> Result<(), CompressError> {
    match level {
        "extreme" => compress_with_gs(config, input, output, "/screen"),
        "recommended" => compress_with_gs(config, input, output, "/ebook"),
        // "less" or anything else → use lossless qpdf repack
        _ => optimize_with_qpdf(config, input, output),
    }
}

fn compress_with_gs(
    config: &EngineConfig,
    input: impl AsRef<Path>,
    output: impl AsRef<Path>,
    pdf_settings: &str,
) -> Result<(), CompressError> {
    let gs = find_binary(&["gs", "ghostscript"]).ok_or(CompressError::MissingGs)?;
    let args = vec![
        OsString::from("-sDEVICE=pdfwrite"),
        OsString::from("-dCompatibilityLevel=1.4"),
        OsString::from(format!("-dPDFSETTINGS={}", pdf_settings)),
        OsString::from("-dNOPAUSE"),
        OsString::from("-dQUIET"),
        OsString::from("-dBATCH"),
        OsString::from("-dDetectDuplicateImages=true"),
        OsString::from("-dCompressFonts=true"),
        OsString::from(format!("-sOutputFile={}", output.as_ref().display())),
        input.as_ref().as_os_str().to_owned(),
    ];
    run_command(&gs, args, config.command_timeout)?;
    Ok(())
}

/// Lossless-only repack using qpdf — zero pixel quality loss.
/// Only reorganizes streams and object tables, does not downsample images.
pub fn optimize_with_qpdf(
    config: &EngineConfig,
    input: impl AsRef<Path>,
    output: impl AsRef<Path>,
) -> Result<(), CompressError> {
    let qpdf = find_binary(&["qpdf"]).ok_or(CompressError::MissingQpdf)?;
    let args = vec![
        OsString::from("--stream-data=compress"),
        OsString::from("--object-streams=generate"),
        OsString::from("--compress-streams=y"),
        input.as_ref().as_os_str().to_owned(),
        output.as_ref().as_os_str().to_owned(),
    ];
    run_command(&qpdf, args, config.command_timeout)?;
    Ok(())
}
