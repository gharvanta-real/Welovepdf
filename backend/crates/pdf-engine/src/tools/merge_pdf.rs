use crate::{
    capabilities::check_binary, CapabilityReport, PipelinePlan, Tool, ToolGroup, ToolSpec,
};

pub struct MergePdf;

impl Tool for MergePdf {
    fn spec(&self) -> ToolSpec {
        ToolSpec {
            id: "merge_pdf".into(),
            name: "Merge PDF".into(),
            group: ToolGroup::Popular,
            description: "Combine multiple PDFs with structural validation.".into(),
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
        PipelinePlan::new("merge_pdf")
            .step(
                "validate inputs",
                "rust",
                "check size, extension, file count, and page metadata",
            )
            .step(
                "merge structure",
                "qpdf",
                "preserve vector content without rasterizing pages",
            )
            .verify("output opens as PDF")
            .verify("page count equals sum of accepted inputs")
    }
}
