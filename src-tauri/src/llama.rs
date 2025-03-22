use llama_cpp::standard_sampler::StandardSampler;
use llama_cpp::LlamaModel;
use llama_cpp::LlamaParams;
use llama_cpp::SessionParams;

const DEFAULT_MAX_TOKENS: usize = 4096;

pub fn prompt<F>(
    model_file_path: &str,
    system_prompt: &str,
    prompt: &str,
    mut token_callback: F,
    max_tokens: Option<usize>,
) where
    F: FnMut(String),
{
    let model = LlamaModel::load_from_file(model_file_path, LlamaParams::default())
        .expect("Could not load model");

    // Create a session
    let mut ctx = model
        .create_session(SessionParams::default())
        .expect("Failed to create session");

    // Feed system prompt first
    ctx.advance_context(system_prompt)
        .expect("Failed to add system prompt");

    // Feed prompt to the model
    ctx.advance_context(prompt).unwrap();

    ctx.advance_context("<think>").unwrap();

    // Use provided max_tokens or fall back to default
    let max_tokens = max_tokens.unwrap_or(DEFAULT_MAX_TOKENS);
    let mut decoded_tokens = 0;

    // Create a sampler with specific settings using SamplerStage
    let stages = vec![
        llama_cpp::standard_sampler::SamplerStage::Temperature(0.7),
        llama_cpp::standard_sampler::SamplerStage::TopP(0.8),
        llama_cpp::standard_sampler::SamplerStage::RepetitionPenalty {
            repetition_penalty: 1.05,
            frequency_penalty: 0.0,
            presence_penalty: 0.0,
            last_n: 64,
        },
    ];
    let sampler = StandardSampler::new_softmax(stages, 1);

    // Handle the Result from start_completing_with
    let completion_handle = ctx
        .start_completing_with(sampler, max_tokens)
        .expect("Failed to start completion");

    // Process tokens and pass them to the callback
    for token in completion_handle {
        let token_str = String::from_utf8_lossy(&model.detokenize(token));
        let filtered_str = token_str.replace('Ġ', " ").replace("ĊĊ", "\n");

        token_callback(filtered_str.to_string());

        decoded_tokens += 1;
        if decoded_tokens >= max_tokens {
            break;
        }
    }
}
