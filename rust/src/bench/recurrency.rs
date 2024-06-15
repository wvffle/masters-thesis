use std::collections::{BTreeMap, HashMap};

use crate::utils::*;
use wasm_bindgen::prelude::*;

fn recurrent_fib(n: usize) -> i32 {
    if n < 2 {
        return 1;
    }

    recurrent_fib(n - 1) + recurrent_fib(n - 2)
}

fn recurrent_hashmap_fib(n: usize, cache: &mut HashMap<usize, i32>) -> i32 {
    if let Some(&result) = cache.get(&n) {
        return result;
    }

    let result = if n < 2 {
        n as i32
    } else {
        recurrent_hashmap_fib(n - 1, cache) + recurrent_hashmap_fib(n - 2, cache)
    };

    cache.insert(n, result);
    result
}

fn recurrent_btreemap_fib(n: usize, cache: &mut BTreeMap<usize, i32>) -> i32 {
    if let Some(&result) = cache.get(&n) {
        return result;
    }

    let result = if n < 2 {
        n as i32
    } else {
        recurrent_btreemap_fib(n - 1, cache) + recurrent_btreemap_fib(n - 2, cache)
    };

    cache.insert(n, result);
    result
}

#[wasm_bindgen]
pub fn fib(n: usize) -> Result<i32, JsValue> {
    let window = web_sys::window().ok_or("WASM is not running in browser")?;
    let performance = window.performance().ok_or("Could not get performance")?;

    start_algorithm(&performance)?;

    let result = recurrent_fib(n);

    stop_algorithm(&performance)?;
    Ok(result)
}

#[wasm_bindgen]
pub fn fib_hashmap(n: usize) -> Result<i32, JsValue> {
    let window = web_sys::window().ok_or("WASM is not running in browser")?;
    let performance = window.performance().ok_or("Could not get performance")?;

    let mut cache = HashMap::new();

    start_algorithm(&performance)?;

    let result = recurrent_hashmap_fib(n, &mut cache);

    stop_algorithm(&performance)?;
    Ok(result)
}

#[wasm_bindgen]
pub fn fib_btreemap(n: usize) -> Result<i32, JsValue> {
    let window = web_sys::window().ok_or("WASM is not running in browser")?;
    let performance = window.performance().ok_or("Could not get performance")?;

    let mut cache = BTreeMap::new();

    start_algorithm(&performance)?;

    let result = recurrent_btreemap_fib(n, &mut cache);

    stop_algorithm(&performance)?;
    Ok(result)
}
