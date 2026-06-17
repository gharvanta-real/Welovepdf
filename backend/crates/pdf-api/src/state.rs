use pdf_engine::{EngineConfig, JobOutput, ToolRegistry};
use serde::Serialize;
use std::{
    collections::HashMap,
    sync::{Arc, Mutex},
};

#[derive(Clone)]
pub struct AppState {
    pub registry: ToolRegistry,
    pub config: EngineConfig,
    jobs: Arc<Mutex<HashMap<String, JobRecord>>>,
}

#[derive(Debug, Clone, Serialize)]
pub struct JobRecord {
    pub job_id: String,
    pub tool_id: String,
    pub status: String,
    pub output_path: String,
    pub bytes: u64,
    pub progress: u8,
}

impl AppState {
    pub fn new() -> Self {
        Self {
            registry: ToolRegistry::production_default(),
            config: EngineConfig::from_env(),
            jobs: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    pub fn record_output(&self, output: &JobOutput) -> JobRecord {
        let record = JobRecord {
            job_id: output.job_id.clone(),
            tool_id: output.tool_id.clone(),
            status: "completed".into(),
            output_path: output.output_path.display().to_string(),
            bytes: output.bytes,
            progress: 100,
        };

        self.jobs
            .lock()
            .expect("job store")
            .insert(record.job_id.clone(), record.clone());
        record
    }

    pub fn get_job(&self, job_id: &str) -> Option<JobRecord> {
        self.jobs.lock().expect("job store").get(job_id).cloned()
    }
}
