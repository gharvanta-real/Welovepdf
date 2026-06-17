use pdf_engine::ToolRegistry;

#[test]
fn registry_exposes_initial_tools() {
    let registry = ToolRegistry::production_default();
    let specs = registry.specs();

    assert!(specs.iter().any(|tool| tool.id == "merge_pdf"));
    assert!(specs.iter().any(|tool| tool.id == "compress_pdf"));
    assert!(specs.len() >= 5);
}

#[test]
fn registry_returns_tool_plan() {
    let registry = ToolRegistry::production_default();
    let plan = registry.plan("compress_pdf").expect("compress plan");

    assert_eq!(plan.tool_id, "compress_pdf");
    assert!(plan.steps.iter().any(|step| step.engine == "qpdf"));
    assert!(plan
        .steps
        .iter()
        .any(|step| step.engine.contains("ghostscript")));
    assert!(!plan.verification.is_empty());
}

