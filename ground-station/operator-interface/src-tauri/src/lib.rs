use tauri_plugin_shell::ShellExt;
use tauri_plugin_shell::process::CommandEvent;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
async fn check_and_start_backend(app_handle: tauri::AppHandle) -> Result<String, String> {
    // Attempt to run `docker compose up -d` in the background
    let shell = app_handle.shell();
    
    // We assume the docker-compose.yml is in the same directory or accessible via path.
    // For a real production app, you might bundle the compose file into the app resources.
    // Here we'll just run a generic docker command assuming the context is right, 
    // or just run `docker version` as a proof of concept for the sidecar architecture.
    let command = shell.command("docker").args(["compose", "up", "-d"]);
    
    match command.output().await {
        Ok(output) => {
            if output.status.success() {
                Ok("Backend started successfully".to_string())
            } else {
                let err = String::from_utf8_lossy(&output.stderr);
                Err(format!("Docker compose failed: {}", err))
            }
        }
        Err(e) => Err(format!("Failed to execute docker: {}. Is Docker installed?", e)),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![check_and_start_backend])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
