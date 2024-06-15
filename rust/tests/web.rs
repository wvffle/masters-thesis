//! Test suite for the Web and headless browsers.

#![cfg(target_arch = "wasm32")]

extern crate wasm_bindgen_test;
use rust::bench::loops::{matrix_mult, matrix_mult_simd};
use serde_wasm_bindgen::{from_value, to_value};
use wasm_bindgen::JsValue;
use wasm_bindgen_test::*;

wasm_bindgen_test_configure!(run_in_browser);

#[wasm_bindgen_test]
fn pass() {
    assert_eq!(1 + 1, 2);
}

#[wasm_bindgen_test]
fn test_matrix_mult_simd() -> Result<(), JsValue> {
    let matrix1 = [
        [1.0, 2.0, 3.0, 4.0],
        [5.0, 6.0, 7.0, 8.0],
        [9.0, 10.0, 11.0, 12.0],
        [13.0, 14.0, 15.0, 16.0],
    ];

    let matrix2 = [
        [17.0, 18.0, 19.0, 20.0],
        [21.0, 22.0, 23.0, 24.0],
        [25.0, 26.0, 27.0, 28.0],
        [29.0, 30.0, 31.0, 32.0],
    ];

    let matrix1 = to_value(&matrix1)?;
    dbg!(&matrix1);

    let matrix2 = to_value(&matrix2)?;
    dbg!(&matrix2);

    let result = matrix_mult(matrix1.clone(), matrix2.clone())?;
    dbg!(&result);

    let result_simd = matrix_mult_simd(matrix1.clone(), matrix2.clone())?;
    dbg!(&result_simd);

    let result_simd: [[f32; 4]; 4] = from_value(result_simd)?;
    let result: [[f32; 4]; 4] = from_value(result)?;

    assert_eq!(result_simd, result);
    Ok(())
}
