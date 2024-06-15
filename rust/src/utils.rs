use wasm_bindgen::{closure::Closure, JsCast, JsValue};
use web_sys::Performance;

pub fn set_panic_hook() {
    // When the `console_error_panic_hook` feature is enabled, we can call the
    // `set_panic_hook` function at least once during initialization, and then
    // we will get better error messages if our code ever panics.
    //
    // For more details see
    // https://github.com/rustwasm/console_error_panic_hook#readme
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();
}

pub fn stop_algorithm(performance: &Performance) -> Result<(), JsValue> {
    performance.mark("rs-alg-end")?;
    Ok(())
}

pub fn start_algorithm(performance: &Performance) -> Result<(), JsValue> {
    performance.mark("rs-alg-start")?;
    Ok(())
}

pub fn request_animation_frame(f: &Closure<dyn FnMut()>) {
    web_sys::window()
        .expect("WASM is not running in browser")
        .request_animation_frame(f.as_ref().unchecked_ref())
        .expect("should register `requestAnimationFrame` OK");
}

pub fn random_f32(min: f32, max: f32) -> f32 {
    lazyrand::rand_f64() as f32 * (max - min) + min
}

pub fn random_f64(min: f64, max: f64) -> f64 {
    lazyrand::rand_f64() as f64 * (max - min) + min
}
