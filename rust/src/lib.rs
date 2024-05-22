use wasm_bindgen::prelude::*;

pub mod bench;
mod utils;

#[wasm_bindgen(start)]
pub fn run() {
    utils::set_panic_hook();
}
