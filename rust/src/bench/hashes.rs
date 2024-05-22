use crate::utils::*;
use crabcrypt::{Algorithms, Hash};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn sha256(data: &[u8]) -> Result<String, JsValue> {
    let window = web_sys::window().ok_or("WASM is not running in browser")?;
    let performance = window.performance().ok_or("Could not get performance")?;
    initialized(&performance)?;
    let mut hash = Hash::create(Algorithms::Sha256);
    start_algorithm(&performance)?;
    let hash = hash
        .update(data)
        .digest(crabcrypt::BinaryToTextEncoding::Hex);
    stop_algorithm(&performance)?;

    Ok(hash)
}

#[wasm_bindgen]
pub fn sha512(data: &[u8]) -> Result<String, JsValue> {
    let window = web_sys::window().ok_or("WASM is not running in browser")?;
    let performance = window.performance().ok_or("Could not get performance")?;
    initialized(&performance)?;
    let mut hash = Hash::create(Algorithms::Sha512);
    start_algorithm(&performance)?;
    let hash = hash
        .update(data)
        .digest(crabcrypt::BinaryToTextEncoding::Hex);
    stop_algorithm(&performance)?;

    Ok(hash)
}

#[wasm_bindgen]
pub fn argon2() -> Result<String, JsValue> {
    let window = web_sys::window().ok_or("WASM is not running in browser")?;
    let performance = window.performance().ok_or("Could not get performance")?;
    initialized(&performance)?;
    let password = b"password";
    let salt = b"saltsalt";
    start_algorithm(&performance)?;
    let hash = argon2::hash_encoded(password, salt, &argon2::Config::default()).unwrap();
    stop_algorithm(&performance)?;

    Ok(hash)
}
