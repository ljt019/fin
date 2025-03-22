mod llama;

use tauri::Emitter;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn prompt_model(
    window: tauri::Window,
    model_path: &str,
    system_prompt: &str,
    prompt: &str,
    max_tokens: Option<usize>,
) -> Result<(), String> {
    // Clone the string data so the thread owns it
    let model_path = model_path.to_string();
    let system_prompt = system_prompt.to_string();
    let prompt = prompt.to_string();

    // Create a clone of the window that we can move into the callback
    let window_clone = window.clone();

    // Call the llama prompt function with a callback that emits events to the frontend
    std::thread::spawn(move || {
        llama::prompt(
            &model_path,
            &system_prompt,
            &prompt,
            |token| {
                // Emit an event to the frontend with the token
                let _ = window_clone.emit("model-token", token);
            },
            max_tokens,
        );

        // Signal that the generation is complete
        let _ = window_clone.emit("model-complete", ());
    });

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, prompt_model])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
