use crate::{
    capabilities::{check_binary, check_optional_binary},
    CapabilityReport, PipelinePlan, Tool, ToolGroup, ToolSpec,
};

pub struct JpgToPdf;

impl Tool for JpgToPdf {
    fn spec(&self) -> ToolSpec {
        ToolSpec {
            id: "jpg_to_pdf".into(),
            name: "JPG to PDF".into(),
            group: ToolGroup::Convert,
            description: "Create PDFs from images with page sizing rules.".into(),
        }
    }

    fn capabilities(&self) -> CapabilityReport {
        let binaries = vec![
            check_binary("img2pdf", &["img2pdf"]),
            check_optional_binary("mutool", &["mutool"]),
        ];
        CapabilityReport {
            tool_id: self.spec().id,
            ready: binaries.iter().all(|binary| binary.found),
            binaries,
        }
    }

    fn plan(&self) -> PipelinePlan {
        PipelinePlan::new("jpg_to_pdf")
            .step(
                "validate images",
                "rust",
                "reject unsupported or oversized image inputs",
            )
            .step("normalize order", "rust", "apply user-defined page order")
            .step(
                "package PDF",
                "img2pdf",
                "preserve image quality with correct page boxes",
            )
            .verify("output opens as PDF")
            .verify("page count equals accepted image count")
    }
}
