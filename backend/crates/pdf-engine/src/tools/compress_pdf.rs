use crate::{
    capabilities::{check_binary, check_optional_binary},
    CapabilityReport, PipelinePlan, Tool, ToolGroup, ToolSpec,
};

pub struct CompressPdf;

impl Tool for CompressPdf {
    fn spec(&self) -> ToolSpec {
        ToolSpec {
            id: "compress_pdf".into(),
            name: "Compress PDF".into(),
            group: ToolGroup::Popular,
            description: "Optimize PDFs with target-size strategy support.".into(),
        }
    }

    fn capabilities(&self) -> CapabilityReport {
        let binaries = vec![
            check_binary("qpdf", &["qpdf"]),
            check_optional_binary("ghostscript", &["gswin64c", "gswin32c", "gs"]),
            check_optional_binary("mutool", &["mutool"]),
        ];
        CapabilityReport {
            tool_id: self.spec().id,
            ready: binaries
                .iter()
                .all(|binary| !binary.required || binary.found),
            binaries,
        }
    }

    fn plan(&self) -> PipelinePlan {
        PipelinePlan::new("compress_pdf")
            .step(
                "inspect document",
                "rust",
                "detect pages, size, and likely scanned content",
            )
            .step(
                "baseline optimization",
                "qpdf",
                "compress streams and generate object streams",
            )
            .step(
                "advanced image optimization",
                "ghostscript optional",
                "apply target-size retry when available",
            )
            .verify("output opens as PDF")
            .verify("page count is unchanged")
            .verify("output is smaller unless user selected lossless-only")
    }
}
