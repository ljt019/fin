mod llama;

use tauri::Emitter;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn prompt_model(window: tauri::Window, prompt: &str) -> Result<(), String> {
    // Clone the string data so the thread owns it
    let model_path =
        "C:\\Users\\lucie\\Desktop\\Projects\\personal\\fin\\model\\fin-r1.gguf".to_string();
    let prompt = prompt.to_string();

    // Create a clone of the window that we can move into the callback
    let window_clone = window.clone();

    // Call the llama prompt function with a callback that emits events to the frontend
    std::thread::spawn(move || {
        // Format the prompt with the necessary tags
        let formatted_prompt = format!(
            "<|im_start|>system\n{}\n<|im_end|>\n<|im_start|>user\n{}\n<|im_end|>\n<|im_start|>assistant\n",
            "You are a helpful AI Assistant that provides well-reasoned but concise responses with redundant overthinking, primarily related to financial questions. You first think about the reasoning process as an internal monologue within <think>...</think> xml tags, and then provide the user with the answer.",
            prompt
        );

        llama::prompt(
            &model_path,
            &formatted_prompt,
            |token| {
                // Emit an event to the frontend with the token
                let _ = window_clone.emit("model-token", token);
            },
            Some(100000), // Max tokens
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
