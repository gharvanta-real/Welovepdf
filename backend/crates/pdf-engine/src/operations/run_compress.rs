use crate::{
    jobs::{ensure_input, JobError, JobOutput},
    operations::{compress_pdf::{compress_with_level, optimize_with_qpdf}, verify::verify_pdf},
    EngineConfig, JobWorkspace,
};
use std::{fs, path::PathBuf};

/// Run a compress job. The `level` parameter controls the trade-off between
/// file size and image quality:
/// - "extreme"     → Ghostscript /screen (maximum compression, smaller images)
/// - "recommended" → Ghostscript /ebook  (good balance, 150 dpi images)
/// - "less"        → qpdf lossless repack (zero pixel quality loss)
pub fn run_compress_job(
    config: &EngineConfig,
    input: PathBuf,
    level: &str,
) -> Result<JobOutput, JobError> {
    let workspace = JobWorkspace::create(config)?;
    let job_id = workspace.id().to_string();
    let input = ensure_input(input, config.max_input_bytes)?;
    let staged = workspace.input_dir().join("input.pdf");
    let output = workspace.output_dir().join("compressed.pdf");

    fs::copy(input, &staged)?;

    let compress_result = compress_with_level(config, &staged, &output, level);

    // Fallback: if Ghostscript fails for any reason, fall back to lossless qpdf
    if let Err(e) = compress_result {
        eprintln!("[compress] level={} gs failed ({:?}), falling back to qpdf", level, e);
        optimize_with_qpdf(config, &staged, &output)
            .map_err(|err| JobError::Operation(err.to_string()))?;
    }

    verify_pdf(config, &output).map_err(|err| JobError::Operation(err.to_string()))?;

    let bytes = fs::metadata(&output)?.len();
    Ok(JobOutput {
        job_id,
        tool_id: "compress_pdf".into(),
        output_path: output,
        bytes,
    })
}
