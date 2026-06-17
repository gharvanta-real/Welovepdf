use serde::Serialize;

#[derive(Debug, Clone, Serialize)]
pub struct PipelineStep {
    pub name: String,
    pub engine: String,
    pub purpose: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct PipelinePlan {
    pub tool_id: String,
    pub steps: Vec<PipelineStep>,
    pub verification: Vec<String>,
}

impl PipelinePlan {
    pub fn new(tool_id: impl Into<String>) -> Self {
        Self {
            tool_id: tool_id.into(),
            steps: Vec::new(),
            verification: Vec::new(),
        }
    }

    pub fn step(mut self, name: &str, engine: &str, purpose: &str) -> Self {
        self.steps.push(PipelineStep {
            name: name.to_string(),
            engine: engine.to_string(),
            purpose: purpose.to_string(),
        });
        self
    }

    pub fn verify(mut self, check: &str) -> Self {
        self.verification.push(check.to_string());
        self
    }
}
