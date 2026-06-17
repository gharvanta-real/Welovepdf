use crate::{capabilities::find_binary, command::run_command, EngineConfig};
use std::{ffi::OsString, path::Path};
use thiserror::Error;

#[derive(Debug, Error)]
pub enum CompressError {
    #[error("qpdf binary was not found")]
    MissingQpdf,
    #[error("qpdf failed: {0}")]
    Command(#[from] crate::command::CommandError),
}

pub fn optimize_with_qpdf(
    config: &EngineConfig,
    input: impl AsRef<Path>,
    output: impl AsRef<Path>,
) -> Result<(), CompressError> {
    let qpdf = find_binary(&["qpdf"]).ok_or(CompressError::MissingQpdf)?;
    let args = vec![
        OsString::from("--stream-data=compress"),
        OsString::from("--object-streams=generate"),
        input.as_ref().as_os_str().to_owned(),
        output.as_ref().as_os_str().to_owned(),
    ];

    run_command(&qpdf, args, config.command_timeout)?;
    Ok(())
}
