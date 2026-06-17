use crate::{capabilities::find_binary, command::run_command, EngineConfig};
use std::{ffi::OsString, path::Path};
use thiserror::Error;

#[derive(Debug, Error)]
pub enum MergeError {
    #[error("qpdf binary was not found")]
    MissingQpdf,
    #[error("merge needs at least two input PDFs")]
    NotEnoughInputs,
    #[error("qpdf failed: {0}")]
    Command(#[from] crate::command::CommandError),
}

pub fn merge_pdfs(
    config: &EngineConfig,
    inputs: &[impl AsRef<Path>],
    output: impl AsRef<Path>,
) -> Result<(), MergeError> {
    if inputs.len() < 2 {
        return Err(MergeError::NotEnoughInputs);
    }

    let qpdf = find_binary(&["qpdf"]).ok_or(MergeError::MissingQpdf)?;
    let mut args = vec![OsString::from("--empty"), OsString::from("--pages")];

    for input in inputs {
        args.push(input.as_ref().as_os_str().to_owned());
        args.push(OsString::from("1-z"));
    }

    args.push(OsString::from("--"));
    args.push(output.as_ref().as_os_str().to_owned());
    run_command(&qpdf, args, config.command_timeout)?;
    Ok(())
}
