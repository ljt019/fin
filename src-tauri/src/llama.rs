use crate::SHOULD_CANCEL;
use llama_cpp::standard_sampler::StandardSampler;
use llama_cpp::LlamaModel;
use llama_cpp::LlamaParams;
use llama_cpp::SessionParams;
use regex::Regex;
use std::sync::atomic::Ordering;
use tokenizers::Tokenizer;

const MODEL_FILE_PATH: &str =
    "C:\\Users\\lucie\\Desktop\\Projects\\personal\\fin\\model\\fin-r1.gguf";
const TOKENIZER_FILE_PATH: &str =
    "C:\\Users\\lucie\\Desktop\\Projects\\personal\\fin\\model\\tokenizer.json";
const DEFAULT_MAX_TOKENS: usize = 100000;

struct Message {
    role: String,
    content: String,
}

fn format_message(message: &Message) -> String {
    format!(
        "<|im_start|>{}\n{}\n<|im_end|>",
        message.role, message.content
    )
}

fn format_messages(messages: Vec<Message>) -> String {
    let formatted = messages
        .iter()
        .map(format_message)
        .collect::<Vec<String>>()
        .join("\n");

    format!("{}\n<|im_start|>assistant\n", formatted)
}

pub fn prompt<FA, FT>(
    system_prompt: &str,
    prompt: &str,
    mut answer_token_callback: FA,
    mut thought_token_callback: FT,
) where
    FA: FnMut(String),
    FT: FnMut(String),
{
    let tokenizer = Tokenizer::from_file(TOKENIZER_FILE_PATH).expect("Failed to load tokenizer");
    let model_params = LlamaParams::default();

    let model =
        LlamaModel::load_from_file(MODEL_FILE_PATH, model_params).expect("Could not load model");

    let mut session_params = SessionParams::default();
    session_params.n_ctx = DEFAULT_MAX_TOKENS as u32;

    let mut ctx = model
        .create_session(session_params)
        .expect("Failed to create session");

    let messages = vec![
        Message {
            role: "system".to_string(),
            content: system_prompt.to_string(),
        },
        Message {
            role: "user".to_string(),
            content: prompt.to_string(),
        },
    ];

    let formatted_prompt = format_messages(messages);

    ctx.advance_context(formatted_prompt)
        .expect("Failed to add prompt");

    let max_tokens = DEFAULT_MAX_TOKENS as u32;

    let stages = vec![
        llama_cpp::standard_sampler::SamplerStage::Temperature(0.7),
        llama_cpp::standard_sampler::SamplerStage::TopP(0.8),
        llama_cpp::standard_sampler::SamplerStage::RepetitionPenalty {
            repetition_penalty: 1.05,
            frequency_penalty: 0.0,
            presence_penalty: 0.0,
            last_n: 128,
        },
    ];
    let sampler = StandardSampler::new_softmax(stages, 1);

    let completion_handle = ctx
        .start_completing_with(sampler, max_tokens as usize)
        .expect("Failed to start completion");

    let mut buffer = String::new();
    let tag_regex = Regex::new(r"<(/?think|/?answer|\|im_end\|)>").unwrap();

    enum ParseState {
        Idle,
        Think,
        Answer,
    }

    let mut state = ParseState::Idle;

    for token in completion_handle {
        // Check for cancellation
        if SHOULD_CANCEL.load(Ordering::SeqCst) {
            break;
        }

        let token_id = token.0 as u32;

        let decoded_text = tokenizer
            .decode(&[token_id], false)
            .expect("Failed to decode token");

        buffer.push_str(&decoded_text);

        while let Some(mat) = tag_regex.find(&buffer) {
            let (before_tag, tag) = buffer.split_at(mat.start());

            if !before_tag.is_empty() {
                match state {
                    ParseState::Think => thought_token_callback(before_tag.to_string()),
                    ParseState::Answer => answer_token_callback(before_tag.to_string()),
                    ParseState::Idle => {}
                }
            }

            state = match &tag[..mat.end() - mat.start()] {
                "<think>" => ParseState::Think,
                "</think>" => ParseState::Idle,
                "<answer>" => ParseState::Answer,
                "</answer>" => ParseState::Idle,
                "<|im_end|>" => ParseState::Idle,
                _ => state,
            };

            buffer = tag[mat.end() - mat.start()..].to_string();
        }

        // Check if buffer ends with potential incomplete tag
        let partial_tag = buffer.rfind('<').map(|idx| &buffer[idx..]);
        if let Some(tag) = partial_tag {
            if !tag_regex.is_match(tag) && tag.len() < 10 {
                let emit_up_to = buffer.len() - tag.len();
                let emit_content = buffer[..emit_up_to].to_string();
                buffer = buffer[emit_up_to..].to_string();

                if !emit_content.is_empty() {
                    match state {
                        ParseState::Think => thought_token_callback(emit_content),
                        ParseState::Answer => answer_token_callback(emit_content),
                        ParseState::Idle => {}
                    }
                }
            }
        } else if !buffer.is_empty() {
            match state {
                ParseState::Think => thought_token_callback(buffer.clone()),
                ParseState::Answer => answer_token_callback(buffer.clone()),
                ParseState::Idle => {}
            }
            buffer.clear();
        }
    }
}
