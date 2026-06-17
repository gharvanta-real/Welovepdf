use crate::{
    jobs::{ensure_input, JobError, JobOutput},
    operations::{merge_pdf::merge_pdfs, verify::verify_pdf},
    EngineConfig, JobWorkspace,
};
use std::{fs, path::PathBuf};

pub fn run_merge_job(config: &EngineConfig, inputs: Vec<PathBuf>) -> Result<JobOutput, JobError> {
    let workspace = JobWorkspace::create(config)?;
    let job_id = workspace.id().to_string();
    let mut staged = Vec::new();

    for (index, input) in inputs.into_iter().enumerate() {
        let input = ensure_input(input, config.max_input_bytes)?;
        let staged_path = workspace.input_dir().join(format!("input-{index}.pdf"));
        fs::copy(input, &staged_path)?;
        staged.push(staged_path);
    }

    let output = workspace.output_dir().join("merged.pdf");
    merge_pdfs(config, &staged, &output).map_err(|err| JobError::Operation(err.to_string()))?;
    verify_pdf(config, &output).map_err(|err| JobError::Operation(err.to_string()))?;

    let bytes = fs::metadata(&output)?.len();
    Ok(JobOutput {
        job_id,
        tool_id: "merge_pdf".into(),
        output_path: output,
        bytes,
    })
}
