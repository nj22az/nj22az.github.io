#!/bin/sh
# Builds camera/pocket-algo.wasm from this crate (needs Rust and its wasm32-unknown-unknown target:
# rustup target add wasm32-unknown-unknown). Run from anywhere.
set -eu
here=$(cd "$(dirname "$0")" && pwd)
cd "$here"
cargo build --release --target wasm32-unknown-unknown
cp target/wasm32-unknown-unknown/release/pocket_algo.wasm ../../camera/pocket-algo.wasm
ls -l ../../camera/pocket-algo.wasm
