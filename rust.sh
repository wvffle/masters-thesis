#!/usr/bin/env bash

PROFILES=('optimize-speed' 'optimize-size' 'optimize-size-no-loop-vec')

cd rust
for profile in ${PROFILES[@]}; do
    wasm-pack build --profile $profile
done
