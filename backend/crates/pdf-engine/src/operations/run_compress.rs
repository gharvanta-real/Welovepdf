use crate::{
    jobs::{ensure_input, JobError, JobOutput},
    operations::{compress_pdf::optimize_with_qpdf, verify::verify_pdf},
    EngineConfig, JobWorkspace,
};
use std::{fs, path::PathBuf};

pub fn run_compress_job(config: &EngineConfig, input: PathBuf) -> Result<JobOutput, JobError> {
    let workspace = JobWorkspace::create(config)?;
    let job_id = workspace.id().to_string();
    let input = ensure_input(input, config.max_input_bytes)?;
    let staged = workspace.input_dir().join("input.pdf");
    let output = workspace.output_dir().join("compressed.pdf");

    fs::copy(input, &staged)?;
    optimize_with_qpdf(config, &staged, &output)
        .map_err(|err| JobError::Operation(err.to_string()))?;
    verify_pdf(config, &output).map_err(|err| JobError::Operation(err.to_string()))?;

    let bytes = fs::metadata(&output)?.len();
    Ok(JobOutput {
        job_id,
        tool_id: "compress_pdf".into(),
        output_path: output,
        bytes,
    })
}
