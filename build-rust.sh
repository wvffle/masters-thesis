#!/usr/bin/env bash

rm -rf src/rust
mkdir -p src/rust

OPT_LEVELS=(3 's' 'z')

cd rust
for level in "${OPT_LEVELS[@]}"; do
  opt_level="$level"
  if ! [[ "$level" -eq 3 ]]; then
    opt_level="'$level'"
  fi
  sed -i "s/opt-level = .*/opt-level = $opt_level/" Cargo.toml
  wasm-pack build --release || exit $?
  mv pkg "../src/rust/opt-$level"
done
