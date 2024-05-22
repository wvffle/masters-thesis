use crate::utils::*;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn reencode_strings(data: String) -> Result<String, JsValue> {
    let window = web_sys::window().ok_or("WASM is not running in browser")?;
    let performance = window.performance().ok_or("Could not get performance")?;
    initialized(&performance)?;

    start_algorithm(&performance)?;
    stop_algorithm(&performance)?;

    Ok(data)
}

const BASE64_ALPHABET: [char; 64] = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S',
    'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l',
    'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '0', '1', '2', '3', '4',
    '5', '6', '7', '8', '9', '+', '/',
];

#[wasm_bindgen]
pub fn base64(data: String) -> Result<String, JsValue> {
    let window = web_sys::window().ok_or("WASM is not running in browser")?;
    let performance = window.performance().ok_or("Could not get performance")?;
    initialized(&performance)?;

    start_algorithm(&performance)?;

    let mut result = String::with_capacity(data.len().div_ceil(3) * 4);

    let mut buffer = 0u32;
    let mut bits = 0;
    for byte in data.bytes() {
        buffer = (buffer << 8) | byte as u32;
        bits += 8;

        while bits >= 6 {
            bits -= 6;
            let index = (buffer >> bits) & 0b111111;
            result.push(BASE64_ALPHABET[index as usize]);
        }
    }

    if bits > 0 {
        buffer <<= 6 - bits;
        result.push(BASE64_ALPHABET[(buffer & 0b111111) as usize]);
    }

    for _ in 0..(4 - result.len() % 4) {
        result.push('=');
    }

    stop_algorithm(&performance)?;

    Ok(result)
}

#[wasm_bindgen]
pub fn base64_simd(data: String) -> Result<String, JsValue> {
    let window = web_sys::window().ok_or("WASM is not running in browser")?;
    let performance = window.performance().ok_or("Could not get performance")?;
    initialized(&performance)?;

    start_algorithm(&performance)?;

    let result = base64_simd::STANDARD.encode_to_string(data);

    stop_algorithm(&performance)?;

    Ok(result)
}
