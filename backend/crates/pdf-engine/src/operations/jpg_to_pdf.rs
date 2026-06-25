use crate::{capabilities::find_binary, command::run_command, EngineConfig};
use std::{ffi::OsString, path::Path};
use thiserror::Error;

#[derive(Debug, Error)]
pub enum JpgToPdfError {
    #[error("img2pdf binary was not found")]
    MissingImg2Pdf,
    #[error("img2pdf failed: {0}")]
    Command(#[from] crate::command::CommandError),
}

fn is_jpeg(path: &Path) -> bool {
    if let Ok(mut file) = std::fs::File::open(path) {
        use std::io::Read;
        let mut buf = [0u8; 2];
        if file.read_exact(&mut buf).is_ok() {
            return buf == [0xFF, 0xD8];
        }
    }
    false
}

pub fn images_to_pdf(
    config: &EngineConfig,
    inputs: &[impl AsRef<Path>],
    output: impl AsRef<Path>,
) -> Result<(), JpgToPdfError> {
    let img2pdf = find_binary(&["img2pdf"]).ok_or(JpgToPdfError::MissingImg2Pdf)?;
    let magick = find_binary(&["magick", "convert"]);

    let mut preprocessed_inputs = Vec::new();
    let mut temp_files_to_clean = Vec::new();

    for input in inputs {
        let input_path = input.as_ref();
        
        if is_jpeg(input_path) {
            preprocessed_inputs.push(input_path.to_path_buf());
        } else if let Some(ref magick_bin) = magick {
            let is_system_convert = cfg!(windows) && 
                magick_bin.to_string_lossy().to_lowercase().contains("system32");

            if is_system_convert {
                preprocessed_inputs.push(input_path.to_path_buf());
            } else {
                let flat_path = input_path.with_extension("flat.jpg");
                
                let mut magick_args = Vec::new();
                magick_args.push(input_path.as_os_str().to_owned());
                magick_args.push(OsString::from("-background"));
                magick_args.push(OsString::from("white"));
                magick_args.push(OsString::from("-alpha"));
                magick_args.push(OsString::from("remove"));
                magick_args.push(OsString::from("-alpha"));
                magick_args.push(OsString::from("off"));
                magick_args.push(flat_path.as_os_str().to_owned());

                match run_command(magick_bin, magick_args, config.command_timeout) {
                    Ok(_) => {
                        preprocessed_inputs.push(flat_path.clone());
                        temp_files_to_clean.push(flat_path);
                    }
                    Err(err) => {
                        eprintln!("Warning: ImageMagick flattening failed: {:?}", err);
                        preprocessed_inputs.push(input_path.to_path_buf());
                    }
                }
            }
        } else {
            preprocessed_inputs.push(input_path.to_path_buf());
        }
    }

    let mut args: Vec<OsString> = preprocessed_inputs
        .iter()
        .map(|input| input.as_os_str().to_owned())
        .collect();

    args.push(OsString::from("-o"));
    args.push(output.as_ref().as_os_str().to_owned());
    
    let result = run_command(&img2pdf, args, config.command_timeout);

    for temp_file in temp_files_to_clean {
        let _ = std::fs::remove_file(temp_file);
    }

    result?;
    Ok(())
}
