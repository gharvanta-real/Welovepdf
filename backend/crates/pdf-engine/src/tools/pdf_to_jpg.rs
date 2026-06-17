use crate::{
    capabilities::check_binary, CapabilityReport, PipelinePlan, Tool, ToolGroup, ToolSpec,
};

pub struct PdfToJpg;

impl Tool for PdfToJpg {
    fn spec(&self) -> ToolSpec {
        ToolSpec {
            id: "pdf_to_jpg".into(),
            name: "PDF to JPG".into(),
            group: ToolGroup::Convert,
            description: "Render pages to images with DPI control.".into(),
        }
    }

    fn capabilities(&self) -> CapabilityReport {
        let binaries = vec![check_binary("poppler", &["pdftoppm"])];
        CapabilityReport {
            tool_id: self.spec().id,
            ready: binaries.iter().all(|binary| binary.found),
            binaries,
        }
    }

    fn plan(&self) -> PipelinePlan {
        PipelinePlan::new("pdf_to_jpg")
            .step(
                "validate PDF",
                "rust",
                "check size, password state, and page limits",
            )
            .step(
                "render pages",
                "poppler",
                "convert selected pages to JPG at requested DPI",
            )
            .verify("image count equals selected page count")
            .verify("images are non-empty and readable")
    }
}
