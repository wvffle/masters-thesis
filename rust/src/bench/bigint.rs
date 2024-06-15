use crate::utils::*;
use wasm_bindgen::prelude::*;

const CRC64_POLY: u64 = 0xC96C5795D7870F42;
const CRC32_POLY: u32 = 0xEDB88320;

#[wasm_bindgen]
pub fn crc32(data: &[u8]) -> Result<i32, JsValue> {
    let window = web_sys::window().ok_or("WASM is not running in browser")?;
    let performance = window.performance().ok_or("Could not get performance")?;

    start_algorithm(&performance)?;

    let mut crc = 0xFFFFFFFF;

    for byte in data {
        crc ^= *byte as u32;
        for _ in 0..8 {
            let mask = -(crc as i32 & 1) as u32;
            crc = (crc >> 1) ^ (CRC32_POLY & mask);
        }
    }

    stop_algorithm(&performance)?;

    Ok((crc ^ 0xFFFFFFFF) as i32)
}

#[wasm_bindgen]
pub fn crc64(data: &[u8]) -> Result<u64, JsValue> {
    let window = web_sys::window().ok_or("WASM is not running in browser")?;
    let performance = window.performance().ok_or("Could not get performance")?;

    start_algorithm(&performance)?;

    let mut crc = 0xFFFFFFFFFFFFFFFF;

    for byte in data {
        crc ^= *byte as u64;
        for _ in 0..8 {
            let mask = -(crc as i64 & 1) as u64;
            crc = (crc >> 1) ^ (CRC64_POLY & mask);
        }
    }

    stop_algorithm(&performance)?;

    Ok(crc ^ 0xFFFFFFFFFFFFFFFF)
}

#[wasm_bindgen]
pub fn crc64_simd(data: &[u8]) -> Result<u64, JsValue> {
    let window = web_sys::window().ok_or("WASM is not running in browser")?;
    let performance = window.performance().ok_or("Could not get performance")?;

    start_algorithm(&performance)?;
    let mut digest = crc64fast::Digest::new();
    digest.write(data);
    let result = digest.sum64();
    stop_algorithm(&performance)?;

    Ok(result)
}
