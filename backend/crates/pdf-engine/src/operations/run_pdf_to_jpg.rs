use crate::{
    jobs::{ensure_input, JobError, JobOutput},
    operations::pdf_to_jpg::pdf_to_jpg,
    EngineConfig, JobWorkspace,
};
use std::{fs, path::PathBuf};

pub fn run_pdf_to_jpg_job(config: &EngineConfig, input: PathBuf) -> Result<JobOutput, JobError> {
    let workspace = JobWorkspace::create(config)?;
    let job_id = workspace.id().to_string();
    let input = ensure_input(input, config.max_input_bytes)?;
    let staged = workspace.input_dir().join("input.pdf");
    let prefix = workspace.output_dir().join("page");

    fs::copy(input, &staged)?;
    pdf_to_jpg(config, &staged, &prefix).map_err(|err| JobError::Operation(err.to_string()))?;

    let first = workspace.output_dir().join("page-1.jpg");
    let bytes = fs::metadata(&first)?.len();
    Ok(JobOutput {
        job_id,
        tool_id: "pdf_to_jpg".into(),
        output_path: first,
        bytes,
    })
}
