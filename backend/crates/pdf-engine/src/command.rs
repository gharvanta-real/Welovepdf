use std::{
    ffi::OsStr,
    io,
    path::Path,
    process::{Command, ExitStatus},
    thread,
    time::{Duration, Instant},
};
use thiserror::Error;

#[derive(Debug, Error)]
pub enum CommandError {
    #[error("failed to spawn command: {0}")]
    Spawn(io::Error),
    #[error("command timed out after {0:?}")]
    Timeout(Duration),
    #[error("command failed with status {status}: {stderr}")]
    Failed { status: ExitStatus, stderr: String },
}

#[derive(Debug)]
pub struct CommandOutput {
    pub stdout: String,
    pub stderr: String,
}

pub fn run_command<I, S>(
    program: &Path,
    args: I,
    timeout: Duration,
) -> Result<CommandOutput, CommandError>
where
    I: IntoIterator<Item = S>,
    S: AsRef<OsStr>,
{
    let mut child = Command::new(program)
        .args(args)
        .stdout(std::process::Stdio::piped())
        .stderr(std::process::Stdio::piped())
        .spawn()
        .map_err(CommandError::Spawn)?;

    let start = Instant::now();
    loop {
        if let Some(status) = child.try_wait().map_err(CommandError::Spawn)? {
            let output = child.wait_with_output().map_err(CommandError::Spawn)?;
            let stdout = String::from_utf8_lossy(&output.stdout).to_string();
            let stderr = String::from_utf8_lossy(&output.stderr).to_string();

            if status.success() {
                return Ok(CommandOutput { stdout, stderr });
            }

            return Err(CommandError::Failed { status, stderr });
        }

        if start.elapsed() >= timeout {
            let _ = child.kill();
            return Err(CommandError::Timeout(timeout));
        }

        thread::sleep(Duration::from_millis(25));
    }
}
