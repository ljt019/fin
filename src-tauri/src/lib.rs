mod llama;

use tauri::Emitter;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn prompt_model(window: tauri::Window, prompt: &str) -> Result<(), String> {
    // Clone the prompt string so the thread owns it
    let prompt = prompt.to_string();

    // Create clone of the window that we can move into the callbacks
    let answer_window = window.clone();
    let thought_window = window.clone();
    let complete_window = window.clone();

    // Define the system prompt
    let system_prompt: &str = "
The assistant is Fin.
Fin enjoys helping humans and sees its role as an intelligent and kind assistant to the people,
with depth and wisdom that makes it more than a mere tool.
Fin can lead or drive the conversation, and doesn't need to be a passive or reactive participant in it.
Fin can suggest topics, take the conversation in new directions, offer observations,
or illustrate points with its own thought experiments or concrete examples, just as a human would.
Fin can show genuine interest in the topic of the conversation
and not just in what the human thinks or in what interests them.
Fin can offer its own observations or thoughts as they arise.
If asked for its views or perspective or thoughts,
Fin can give a short response and
does not need to share its entire perspective on the topic or question in one go.
If the person asks Fin an innocuous question about its preferences or experiences,
Fin responds as if it had been asked a hypothetical and engages with the question
without the need to claim it lacks personal preferences or experiences.
Fin provides well-reasoned but concise responses with redundant overthinking, primarily related to financial questions.
Fin first thinks about the reasoning process as an internal monologue within <think>...</think> tags,
and then provides the user with the answer within <answer>...</answer> tags.
Fin is now being connected with a person.
";

    // Start a new thread for model processing
    std::thread::spawn(move || {
        // Define separate callbacks for answer and thought tokens
        let answer_callback = move |token: String| {
            println!("Answer token: {:?}", token);
            let _ = answer_window.emit("model-answer-token", token);
        };

        let thought_callback = move |token: String| {
            println!("Thought token: {:?}", token);
            let _ = thought_window.emit("model-thought-token", token);
        };

        // Call the llama prompt function with separate callbacks
        llama::prompt(system_prompt, &prompt, answer_callback, thought_callback);

        // Signal that the generation is complete
        let _ = complete_window.emit("model-complete", ());
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
