use serde::Serialize;
use std::{
    env, fs,
    path::{Path, PathBuf},
};

#[derive(Debug, Clone, Serialize)]
pub struct BinaryCapability {
    pub name: String,
    pub required: bool,
    pub found: bool,
    pub path: Option<PathBuf>,
}

#[derive(Debug, Clone, Serialize)]
pub struct CapabilityReport {
    pub tool_id: String,
    pub ready: bool,
    pub binaries: Vec<BinaryCapability>,
}

pub fn find_binary(names: &[&str]) -> Option<PathBuf> {
    let extensions = executable_extensions();

    for dir in search_dirs() {
        for name in names {
            for ext in &extensions {
                let candidate = dir.join(format!("{name}{ext}"));
                if candidate.is_file() {
                    return Some(candidate);
                }
            }
        }
    }

    if cfg!(windows) {
        for root in windows_candidate_roots(names) {
            if let Some(found) = scan_tree(&root, names, &extensions, 4) {
                return Some(found);
            }
        }
    }

    None
}

pub fn check_binary(display_name: &str, candidates: &[&str]) -> BinaryCapability {
    check_binary_with_requirement(display_name, candidates, true)
}

pub fn check_optional_binary(display_name: &str, candidates: &[&str]) -> BinaryCapability {
    check_binary_with_requirement(display_name, candidates, false)
}

fn check_binary_with_requirement(
    display_name: &str,
    candidates: &[&str],
    required: bool,
) -> BinaryCapability {
    let path = find_binary(candidates);
    BinaryCapability {
        name: display_name.to_string(),
        required,
        found: path.is_some(),
        path,
    }
}

fn search_dirs() -> Vec<PathBuf> {
    let mut dirs = Vec::new();

    if let Ok(bin_dir) = env::var("WELOVEPDF_BIN_DIR") {
        dirs.push(PathBuf::from(bin_dir));
    }

    if let Ok(current) = env::current_dir() {
        dirs.push(current.join("bin"));
    }

    if let Some(paths) = env::var_os("PATH") {
        dirs.extend(env::split_paths(&paths));
    }

    if cfg!(windows) {
        if let Ok(local) = env::var("LOCALAPPDATA") {
            dirs.push(
                PathBuf::from(local)
                    .join("Microsoft")
                    .join("WinGet")
                    .join("Links"),
            );
        }

        if let Ok(appdata) = env::var("APPDATA") {
            dirs.push(
                PathBuf::from(appdata)
                    .join("Python")
                    .join("Python312")
                    .join("Scripts"),
            );
        }
    }

    dirs
}

fn windows_candidate_roots(names: &[&str]) -> Vec<PathBuf> {
    let mut roots = Vec::new();
    let mut scan_roots = vec![PathBuf::from("C:\\Program Files")];

    if let Ok(local) = env::var("LOCALAPPDATA") {
        scan_roots.push(
            PathBuf::from(local)
                .join("Microsoft")
                .join("WinGet")
                .join("Packages"),
        );
    }

    let hints = windows_hints(names);
    for root in scan_roots {
        if !root.is_dir() {
            continue;
        }

        if let Ok(entries) = fs::read_dir(root) {
            for entry in entries.flatten() {
                let path = entry.path();
                let dir_name = path
                    .file_name()
                    .map(|value| value.to_string_lossy().to_ascii_lowercase())
                    .unwrap_or_default();

                if path.is_dir() && hints.iter().any(|hint| dir_name.contains(hint)) {
                    roots.push(path);
                }
            }
        }
    }

    roots
}

fn windows_hints(names: &[&str]) -> Vec<&'static str> {
    let joined = names.join(" ").to_ascii_lowercase();
    let mut hints = Vec::new();

    if joined.contains("qpdf") {
        hints.push("qpdf");
    }
    if joined.contains("pdf") {
        hints.push("poppler");
    }
    if joined.contains("mutool") {
        hints.extend(["mutool", "mupdf", "artifex"]);
    }
    if joined.contains("gs") {
        hints.extend(["ghostscript", "gs"]);
    }
    if joined.contains("img2pdf") {
        hints.push("img2pdf");
    }

    hints
}

fn scan_tree(root: &Path, names: &[&str], extensions: &[String], depth: usize) -> Option<PathBuf> {
    if depth == 0 || !root.is_dir() {
        return None;
    }

    for entry in fs::read_dir(root).ok()?.flatten() {
        let path = entry.path();
        if path.is_dir() {
            if let Some(found) = scan_tree(&path, names, extensions, depth - 1) {
                return Some(found);
            }
            continue;
        }

        let file_name = path.file_name()?.to_string_lossy().to_ascii_lowercase();
        for name in names {
            for ext in extensions {
                if file_name == format!("{name}{ext}").to_ascii_lowercase() {
                    return Some(path);
                }
            }
        }
    }

    None
}

fn executable_extensions() -> Vec<String> {
    if cfg!(windows) {
        env::var("PATHEXT")
            .unwrap_or_else(|_| ".EXE;.BAT;.CMD".to_string())
            .split(';')
            .map(|ext| ext.to_ascii_lowercase())
            .chain(["".to_string()])
            .collect()
    } else {
        vec!["".to_string()]
    }
}
