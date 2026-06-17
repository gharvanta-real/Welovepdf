use crate::{capabilities::find_binary, command::run_command, EngineConfig};
use std::{ffi::OsString, path::Path};
use thiserror::Error;

#[derive(Debug, Error)]
pub enum JpgToPdfError {
    #[error("img2pdf binary was not found")]
    MissingImg2Pdf,
    #[error("img2pdf failed: {0}")]
    Command(#[from] crate::command::CommandError),
}

pub fn images_to_pdf(
    config: &EngineConfig,
    inputs: &[impl AsRef<Path>],
    output: impl AsRef<Path>,
) -> Result<(), JpgToPdfError> {
    let img2pdf = find_binary(&["img2pdf"]).ok_or(JpgToPdfError::MissingImg2Pdf)?;
    let mut args: Vec<OsString> = inputs
        .iter()
        .map(|input| input.as_ref().as_os_str().to_owned())
        .collect();

    args.push(OsString::from("-o"));
    args.push(output.as_ref().as_os_str().to_owned());
    run_command(&img2pdf, args, config.command_timeout)?;
    Ok(())
}
