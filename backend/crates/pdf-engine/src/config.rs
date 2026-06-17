use std::{env, path::PathBuf, time::Duration};

#[derive(Debug, Clone)]
pub struct EngineConfig {
    pub work_dir: PathBuf,
    pub bin_dir: PathBuf,
    pub command_timeout: Duration,
    pub max_input_bytes: u64,
}

impl EngineConfig {
    pub fn from_env() -> Self {
        let backend_dir = env::current_dir().unwrap_or_else(|_| PathBuf::from("."));
        let work_dir = env_path("WELOVEPDF_WORK_DIR").unwrap_or_else(|| backend_dir.join(".work"));
        let bin_dir = env_path("WELOVEPDF_BIN_DIR").unwrap_or_else(|| backend_dir.join("bin"));

        Self {
            work_dir,
            bin_dir,
            command_timeout: Duration::from_secs(env_u64("WELOVEPDF_TIMEOUT_SECS", 30)),
            max_input_bytes: env_u64("WELOVEPDF_MAX_INPUT_BYTES", 50 * 1024 * 1024),
        }
    }
}

impl Default for EngineConfig {
    fn default() -> Self {
        Self::from_env()
    }
}

fn env_path(key: &str) -> Option<PathBuf> {
    env::var_os(key).map(PathBuf::from)
}

fn env_u64(key: &str, fallback: u64) -> u64 {
    env::var(key)
        .ok()
        .and_then(|value| value.parse().ok())
        .unwrap_or(fallback)
}
