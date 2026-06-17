use crate::{capabilities::find_binary, command::run_command, EngineConfig};
use std::{ffi::OsString, path::Path};
use thiserror::Error;

#[derive(Debug, Error)]
pub enum VerifyError {
    #[error("qpdf binary was not found")]
    MissingQpdf,
    #[error("PDF verification failed: {0}")]
    Command(#[from] crate::command::CommandError),
}

pub fn verify_pdf(config: &EngineConfig, input: impl AsRef<Path>) -> Result<(), VerifyError> {
    let qpdf = find_binary(&["qpdf"]).ok_or(VerifyError::MissingQpdf)?;
    let args = vec![
        OsString::from("--check"),
        input.as_ref().as_os_str().to_owned(),
    ];

    run_command(&qpdf, args, config.command_timeout)?;
    Ok(())
}
