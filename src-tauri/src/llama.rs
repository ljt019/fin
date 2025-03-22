use llama_cpp::standard_sampler::StandardSampler;
use llama_cpp::LlamaModel;
use llama_cpp::LlamaParams;
use llama_cpp::SessionParams;

const DEFAULT_MAX_TOKENS: usize = 100000;

pub fn prompt<F>(
    model_file_path: &str,
    system_prompt: &str,
    prompt: &str,
    mut token_callback: F,
    max_tokens: Option<usize>,
) where
    F: FnMut(String),
{
    let model_params = LlamaParams::default();

    let model =
        LlamaModel::load_from_file(model_file_path, model_params).expect("Could not load model");

    // Create a session
    let mut session_params = SessionParams::default();
    // Increase context size to handle longer outputs
    session_params.n_ctx = max_tokens.unwrap_or(DEFAULT_MAX_TOKENS) as u32;

    let mut ctx = model
        .create_session(session_params)
        .expect("Failed to create session");

    // Feed the entire formatted prompt at once
    // The prompt should already contain the system message, user message, and assistant prefix
    ctx.advance_context(prompt).expect("Failed to add prompt");

    // Use provided max_tokens or fall back to default
    let max_tokens = max_tokens.unwrap_or(DEFAULT_MAX_TOKENS);

    // Create a sampler with specific settings using SamplerStage
    let stages = vec![
        llama_cpp::standard_sampler::SamplerStage::Temperature(0.7),
        llama_cpp::standard_sampler::SamplerStage::TopP(0.9), // Increased from 0.8
        llama_cpp::standard_sampler::SamplerStage::RepetitionPenalty {
            repetition_penalty: 1.1, // Slightly increased
            frequency_penalty: 0.0,
            presence_penalty: 0.0,
            last_n: 128, // Increased from 64
        },
    ];
    let sampler = StandardSampler::new_softmax(stages, 1);

    // Handle the Result from start_completing_with
    let completion_handle = ctx
        .start_completing_with(sampler, max_tokens)
        .expect("Failed to start completion");

    // For building up complete UTF-8 sequences
    let mut buffer = Vec::new();
    let mut decoded_tokens = 0;

    // Process tokens and pass them to the callback
    for token in completion_handle {
        // Instead of detokenizing each token individually, accumulate them
        buffer.extend_from_slice(&model.detokenize(token));

        // Try to extract valid UTF-8 sequences from the buffer
        if let Ok(utf8_str) = String::from_utf8(buffer.clone()) {
            // Clear the buffer since we've consumed all valid UTF-8
            buffer.clear();

            // Apply replacements
            let filtered_str = utf8_str
                .replace('Ġ', " ") // Space character
                .replace("ĊĊ", "\n") // Double newline
                .replace('Ċ', "\n") // Single newline
                .replace('Ĉ', "\t") // Tab character
                .replace("â€™", "'") // Apostrophe (common encoding issue)
                .replace("â€œ", "\"") // Left double quote
                .replace("â€", "\""); // Right double quote

            // Send to callback
            if !filtered_str.is_empty() {
                token_callback(filtered_str);
            }
        }

        decoded_tokens += 1;
        if decoded_tokens >= max_tokens {
            // If we have any remaining bytes in the buffer, try to process them
            if !buffer.is_empty() {
                if let Ok(remaining) = String::from_utf8(buffer.clone()) {
                    let filtered = remaining
                        .replace('Ġ', " ") // Space character
                        .replace("ĊĊ", "\n") // Double newline
                        .replace('Ċ', "\n") // Single newline
                        .replace('Ĉ', "\t") // Tab character
                        .replace("â€™", "'") // Apostrophe (common encoding issue)
                        .replace("â€œ", "\"") // Left double quote
                        .replace("â€", "\""); // Right double quote

                    if !filtered.is_empty() {
                        token_callback(filtered);
                    }
                }
            }
            break;
        }
    }

    // Process any remaining bytes in the buffer
    if !buffer.is_empty() {
        if let Ok(remaining) = String::from_utf8(buffer) {
            let filtered = remaining
                .replace('Ġ', " ") // Space character
                .replace("ĊĊ", "\n") // Double newline
                .replace('Ċ', "\n") // Single newline
                .replace('Ĉ', "\t") // Tab character
                .replace("â€™", "'") // Apostrophe (common encoding issue)
                .replace("â€œ", "\"") // Left double quote
                .replace("â€", "\""); // Right double quote

            if !filtered.is_empty() {
                token_callback(filtered);
            }
        }
    }
}
