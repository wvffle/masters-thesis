# Efficiency of WASM+Rust Compared to JavaScript in the Context of Web Applications
This repository contains work that contributes to my master's thesis (written in Polish), accessible at the [thesis.pdf](public/thesis.pdf) file.

The source code of Rust implementation is contained within the [rust/](./rust) directory, while the source code for JavaScript implementation and the testing framework reside in [src/](./src) directory.


## Results
Results can be viewed at [https://wvffle.github.io/masters-thesis/](https://wvffle.github.io/masters-thesis/) and are available for download in JSON format at [public/results-apple-m1-16gb.json](public/results-apple-m1-16gb.json).

## Tests description

### String re-encoding
This test aims to examine how much time it takes to transfer strings from JavaScript to the WebAssembly context and back.
This process requires re-encoding data between UTF-16 (JavaScript) and UTF-8 (Rust), which generates additional overhead when executing functions exported from WASM modules.
This test consisted of only one implementation that was invoked for three different data sizes: 1KB, 512KB, and 1MB.
All implementations were called $n$ times, for $n \in {100, 1000, 10000}$, to investigate the impact of the JIT compiler on the function execution time.

| Algorithm | Description |
| --- | --- |
| `reencode_strings` | Function that returns the input data. Accepts and returns a `String`. |


### Base64 encoding
This test aims to examine how much time it takes to encode a string to Base64 for different data sizes.
All implementations were invoked for three different data sizes: 1KB, 512KB, and 1MB.
All implementations were called $n$ times, for $n \in {100, 1000, 10000}$, to investigate the impact of the JIT compiler on the function execution time.

| Algorithm | Description |
| --- | --- |
| `btoa` | Native Base64 encoding available only in browser JavaScript. |
| `base64` | Base64 encoding algorithm implemented in both Rust and JavaScript. |
| `base64_simd` | Base64 encoding using the `base64-simd` crate, which utilizes SIMD operations. |


### $k$-th Fibonacci number
This test aims to examine the performance of recursion in both technologies.
Contrary to other tests, the input data **was not generated randomly for this test**.
All implementations were invoked for three different $k$ values, where $k \in {20, 30, 40}$.
All implementations were called $n$ times, for $n \in {100, 500, 1000}$, to investigate the impact of the JIT compiler on the function execution time.

| Algorithm | Description |
| --- | --- |
| `fib` | Recursive algorithm for finding $k$-th Fibonacci number implemented in both Rust and JavaScript. |


### $4 \times 4$ matrix multiplication
This test aims to examine how much time it takes to multiply two $4 \times 4$ matrices together.
Contrary to other tests, **this test was not divided into three subtests** as $4 \times 4$ matrices can hold only one size of input data, which is 16 values.
All implementations were called $n$ times, for $n \in {100, 1000, 10000}$, to investigate the impact of the JIT compiler on the function execution time.

| Algorithm | Description |
| --- | --- |
| `multiplyMatrices` and `matrix_mult` | Iterative matrix multiplication implemented in both JavaScript and Rust respectively. |
| `matrix_mult_simd` | Matrix multiplication using `glam` crate, which utilizes SIMD operations. |

### CRC-32
This test aims to evaluate the performance of calculating the CRC-32 checksum for different data sizes.
Contrary to other tests that use strings as input data, all algorithms examined in this test operate on byte arrays which are passed directly into WASM memory.
All implementations were invoked for three different data sizes: 1KB, 512KB, and 1MB.
All implementations were called $n$ times, for $n \in {100, 1000, 10000}$, to investigate the impact of the JIT compiler on the function execution time.

| Algorithm | Description |
| --- | --- |
| `crc32` | CRC-32 checksum calculation without LUT. Implemented in both Rust and JavaScript. |

### CRC-64
This test aims to evaluate the performance of the JavaScript's `bigint` type compared to Rust's 128-bit integers.
Similar to the CRC-32 test, all algorithms examined in this test operate on byte arrays which are passed directly into WASM memory.
All implementations were invoked for three different data sizes: 1KB, 512KB, and 1MB.
All implementations were called $n$ times, for $n \in {100, 1000, 10000}$, to investigate the impact of the JIT compiler on the function execution time.

| Algorithm | Description |
| --- | --- |
| `crc64` | CRC-64-ECMA. Implemented in both Rust and JavaScript. |
| `crc64_simd` | CRC-64-ECMA using `crc64fast` crate, which utilizes SIMD operations. |


### Creation of DOM elements
This test aims to examine the performance of dynamically creating elements and adding them to the document.
All implementations were invoked for three different numbers of elements $k$, where $k \in {100, 1000, 10000}$.
All implementations were called $n$ times, for $n \in {10, 100, 500}$, to investigate the impact of the JIT compiler on the function execution time.

| Algorithm | Description |
| --- | --- |
| `createElements` and `create_elements` | Creates and appends $k$ divs into document. Implemented in both JavaScript and Rust respectively. |


### Update of every 2nd DOM element
This test aims to examine the performance of updating the document.
This test is run directly after [Creation of DOM elements](#creation-of-dom-elements), effectively being invoked for three different numbers of elements $k$, where $k \in {100, 1000, 10000}$.
Although all implementations were called $n$ times, for $n \in {10, 100, 500}$, the test itself has been called twice resulting in doubled $n$ values.

| Algorithm | Description |
| --- | --- |
| `updateEvery2ndElement` and `update_every_2nd_element` | Sets `textContent` of every 2nd element to it's index or to an empty string.  |


### Removal of DOM elements
This test aims to examine the performance of removing DOM elements by clearing the container element.
All implementations were invoked for three different numbers of elements $k$, where $k \in {100, 1000, 10000}$.
This test is run after [Creation of DOM elements](#creation-of-dom-elements), effectively removing three different numbers of elements $k$, where $k \in {100, 1000, 10000}$.
All implementations were called $n$ times, for $n \in {10, 100, 500}$, to investigate the impact of the JIT compiler on the function execution time.

| Algorithm | Description |
| --- | --- |
| `clearElements` and `clear_elements` | Sets the `innerHTML` of the elements' container to an empty string. Implemented in both JavaScript and Rust respectively. |



## Hardware
I conducted the tests using the Google Chrome browser version 136.0.7103.93. The browser was running on 2020 M1 MacBook Air with 16 GB of RAM running macOS Sequoia 15.3.2.

## Testing Procedure
Comparing the performance of JavaScript and Rust compiled to WebAssembly requires executing both technologies in the same environment.
While it is possible to deploy both technologies on the server side using platforms such as Node.js or Wasmer, the objective of my thesis was to evaluate performance within the context of web applications.
Hence, I conducted all tests in the web browser.

- I utilized the Performance API to perform precise time measurements during the execution of both JavaScript and Rust functions.
- Each test was composed of zero or more JavaScript functions and one or more functions written in Rust.
- I divided each test into three subtests, which varied in the input data (unless otherwise specified in the [Tests description](#tests-description) section).
- Input data was randomly generated before the start of the function execution time measurement (unless otherwise specified in the [Tests description](#tests-description) section).
- I averaged the performance of each function over three different numbers of repetitions, denoted by the symbol $n$.
- The functions analyzed in each test were executed sequentially, and prior to the first invocation of each function (for each implementation and each $n$), the browser tab was refreshed to clean JIT optimizations.
- All functions in Rust were evaluated on three compiler optimization profiles, which are detailed in the table below.

### Description of Rust Compiler Optimization Levels

| Designation | Profile Configuration | Configuration Description |
|-------------|-----------------------|---------------------------|
| $RS_3$      | `lto = true`, `opt_level = 3` | LTO + optimizations focusing on the speed of the compiled code |
| $RS_s$      | `lto = true`, `opt_level = 's'` | LTO + optimizations focusing on the size of the compiled code |
| $RS_z$      | `lto = true`, `opt_level = 'z'` | LTO + optimizations focusing on the size of the compiled code (without loop vectorization) |

## Measurements
Measuring the execution time of functions presented challenges.
JavaScript function performance was easily measured by recording the time before and after the function invocation.

In contrast, for Rust functions, these measurements were not sufficient because they included both the algorithm's execution time and the glue code's execution time.
This means that the time taken for data serialization and deserialization would be also counted into the overall function execution time.

### Measurements for JavaScript


| Measurement | Description |
|-------------|-------------|
| $`T_{JS_1}`$ | Before invoking the tested function |
| $`T_{JS_2}`$ | After completing the invocation of the tested function |

Both measurements allowed me to derive the algorithm execution time metric, which is equal to the difference between these two measurements:

| Metric | Description |
|-------------|-------------|
| $`T_{A_{JS}}`$ = $`T_{JS_2} - T_{JS_1}`$ | JavaScript algorithm execution time |


### Measurements for Rust

| Measurement | Description |
|-------------|-------------|
| $`T_{RS_1}`$ | Before invoking the tested function; from the JavaScript level |
| $`T_{RS_2}`$ | At the beginning of the invoked function; from the Rust level |
| $`T_{RS_3}`$ | Just before returning the result from the function; from the Rust level |
| $`T_{RS_4}`$ | After completing the invocation of the tested function; from the JavaScript level |

These measurements allowed me to derive the data deserialization time, algorithm execution time, and data serialization time metrics, denoted as $T_{D}$, $T_{A}$, and $T_{S}$ respectively:


| Metric | Description |
|-------------|---------|
| $T_{D_{RS}}$ = $T_{RS_2} - T_{RS_1}$ | Rust deserialization time<sup>*</sup> |
| $T_{A_{RS}}$ = $T_{RS_3} - T_{RS_2}$ | Rust algorithm execution time |
| $T_{S_{RS}}$ = $T_{RS_4} - T_{RS_3}$ | Rust serialization time<sup>*</sup> |


&ast; Serialization and deserialization times are defined from the perspective of the WebAssembly context, i.e., the deserialization time $`T_{D_{RS}}`$ is measured from the point immediately preceding the invocation of the glue code function to the point of entry into the Rust function or the completion of manual deserialization of arguments within this function. This interval encompasses data serialization on the JavaScript side and data deserialization on the WASM module side.
