use crate::{
    capabilities::check_binary, CapabilityReport, PipelinePlan, Tool, ToolGroup, ToolSpec,
};

pub struct SplitPdf;

impl Tool for SplitPdf {
    fn spec(&self) -> ToolSpec {
        ToolSpec {
            id: "split_pdf".into(),
            name: "Split PDF".into(),
            group: ToolGroup::Popular,
            description: "Extract ranges or single pages into separate PDFs.".into(),
        }
    }

    fn capabilities(&self) -> CapabilityReport {
        let binaries = vec![check_binary("qpdf", &["qpdf"])];
        CapabilityReport {
            tool_id: self.spec().id,
            ready: binaries.iter().all(|binary| binary.found),
            binaries,
        }
    }

    fn plan(&self) -> PipelinePlan {
        PipelinePlan::new("split_pdf")
            .step(
                "parse page ranges",
                "rust",
                "normalize page selections and reject invalid ranges",
            )
            .step(
                "extract pages",
                "qpdf",
                "write selected ranges without rasterizing",
            )
            .verify("each output opens as PDF")
            .verify("all requested pages are represented")
    }
}
