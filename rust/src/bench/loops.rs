use crate::utils::*;
use serde_wasm_bindgen::{from_value, to_value};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn matrix_mult(matrix_a: JsValue, matrix_b: JsValue) -> Result<JsValue, JsValue> {
    let window = web_sys::window().ok_or("WASM is not running in browser")?;
    let performance = window.performance().ok_or("Could not get performance")?;

    let a: Vec<Vec<i32>> = from_value(matrix_a)?;
    let b: Vec<Vec<i32>> = from_value(matrix_b)?;

    initialized(&performance)?;

    start_algorithm(&performance)?;

    let rows_a = a.len();
    let cols_a = a[0].len();
    let cols_b = b[0].len();

    let mut result = vec![vec![0; cols_b]; rows_a];

    for i in 0..rows_a {
        for j in 0..cols_b {
            for k in 0..cols_a {
                result[i][j] += a[i][k] * b[k][j];
            }
        }
    }

    stop_algorithm(&performance)?;
    Ok(to_value(&result)?)
}
