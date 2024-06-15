use crate::utils::*;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
/// Create n div elements in the container
/// Don't populate text content as reencoding strings might be slow
pub fn create_elements(n: usize) -> Result<(), JsValue> {
    let window = web_sys::window().ok_or("WASM is not running in browser")?;
    let performance = window.performance().ok_or("Could not get performance")?;

    let document = window.document().ok_or("WASM is not running in browser")?;

    let container = document
        .query_selector(".container")?
        .ok_or("No container found")?;

    start_algorithm(&performance)?;

    for _ in 0..n {
        let div = document.create_element("div")?;
        container.append_child(&div)?;
    }

    stop_algorithm(&performance)?;

    Ok(())
}

#[wasm_bindgen]
pub fn update_every_2nd_element() -> Result<(), JsValue> {
    let window = web_sys::window().ok_or("WASM is not running in browser")?;
    let performance = window.performance().ok_or("Could not get performance")?;

    let document = window.document().ok_or("WASM is not running in browser")?;

    let container = document
        .query_selector(".container")?
        .ok_or("No container found")?;

    let children = container.children();

    start_algorithm(&performance)?;

    for i in (0..children.length()).step_by(2) {
        if let Some(child) = children.item(i) {
            if child.text_content().unwrap() == "" {
                child.set_text_content(Some(&i.to_string()));
            } else {
                child.set_text_content(None);
            }
        }
    }

    stop_algorithm(&performance)?;

    Ok(())
}

#[wasm_bindgen]
pub fn clear_elements() -> Result<(), JsValue> {
    let window = web_sys::window().ok_or("WASM is not running in browser")?;
    let performance = window.performance().ok_or("Could not get performance")?;

    let document = window.document().ok_or("WASM is not running in browser")?;

    let container = document
        .query_selector(".container")?
        .ok_or("No container found")?;

    start_algorithm(&performance)?;

    container.set_inner_html("");

    stop_algorithm(&performance)?;

    Ok(())
}
