use crate::{CapabilityReport, PipelinePlan};
use serde::Serialize;

#[derive(Debug, Clone, Serialize)]
pub enum ToolGroup {
    Popular,
    Convert,
    Organize,
    Secure,
    Intelligence,
}

#[derive(Debug, Clone, Serialize)]
pub struct ToolSpec {
    pub id: String,
    pub name: String,
    pub group: ToolGroup,
    pub description: String,
}

pub trait Tool: Send + Sync {
    fn spec(&self) -> ToolSpec;
    fn capabilities(&self) -> CapabilityReport;
    fn plan(&self) -> PipelinePlan;
}
