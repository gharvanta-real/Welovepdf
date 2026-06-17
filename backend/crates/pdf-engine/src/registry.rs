use crate::{
    tools::{CompressPdf, JpgToPdf, MergePdf, PdfToJpg, SplitPdf},
    CapabilityReport, PipelinePlan, Tool, ToolSpec,
};
use std::sync::Arc;

#[derive(Clone)]
pub struct ToolRegistry {
    tools: Vec<Arc<dyn Tool>>,
}

impl ToolRegistry {
    pub fn production_default() -> Self {
        Self {
            tools: vec![
                Arc::new(MergePdf),
                Arc::new(SplitPdf),
                Arc::new(CompressPdf),
                Arc::new(JpgToPdf),
                Arc::new(PdfToJpg),
            ],
        }
    }

    pub fn specs(&self) -> Vec<ToolSpec> {
        self.tools.iter().map(|tool| tool.spec()).collect()
    }

    pub fn capabilities(&self) -> Vec<CapabilityReport> {
        self.tools.iter().map(|tool| tool.capabilities()).collect()
    }

    pub fn plan(&self, tool_id: &str) -> Option<PipelinePlan> {
        self.tools
            .iter()
            .find(|tool| tool.spec().id == tool_id)
            .map(|tool| tool.plan())
    }
}

impl Default for ToolRegistry {
    fn default() -> Self {
        Self::production_default()
    }
}
