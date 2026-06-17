use crate::EngineConfig;
use std::{
    fs, io,
    path::{Path, PathBuf},
};
use uuid::Uuid;

#[derive(Debug, Clone)]
pub struct JobWorkspace {
    id: String,
    root: PathBuf,
    input: PathBuf,
    output: PathBuf,
}

impl JobWorkspace {
    pub fn create(config: &EngineConfig) -> io::Result<Self> {
        let id = Uuid::new_v4().to_string();
        let root = config.work_dir.join(&id);
        let input = root.join("input");
        let output = root.join("output");

        fs::create_dir_all(&input)?;
        fs::create_dir_all(&output)?;

        Ok(Self {
            id,
            root,
            input,
            output,
        })
    }

    pub fn id(&self) -> &str {
        &self.id
    }

    pub fn root(&self) -> &Path {
        &self.root
    }

    pub fn input_dir(&self) -> &Path {
        &self.input
    }

    pub fn output_dir(&self) -> &Path {
        &self.output
    }

    pub fn cleanup(self) -> io::Result<()> {
        if self.root.exists() {
            fs::remove_dir_all(self.root)?;
        }
        Ok(())
    }
}
