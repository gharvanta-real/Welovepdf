use crate::{capabilities::find_binary, command::run_command, EngineConfig};
use std::{ffi::OsString, path::Path};
use thiserror::Error;

#[derive(Debug, Error)]
pub enum PdfToJpgError {
    #[error("pdftoppm binary was not found")]
    MissingPoppler,
    #[error("pdftoppm failed: {0}")]
    Command(#[from] crate::command::CommandError),
}

pub fn pdf_to_jpg(
    config: &EngineConfig,
    input: impl AsRef<Path>,
    output_prefix: impl AsRef<Path>,
) -> Result<(), PdfToJpgError> {
    let pdftoppm = find_binary(&["pdftoppm"]).ok_or(PdfToJpgError::MissingPoppler)?;
    let args = vec![
        OsString::from("-jpeg"),
        OsString::from("-r"),
        OsString::from("144"),
        input.as_ref().as_os_str().to_owned(),
        output_prefix.as_ref().as_os_str().to_owned(),
    ];

    run_command(&pdftoppm, args, config.command_timeout)?;
    Ok(())
}
