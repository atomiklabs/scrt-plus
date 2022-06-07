FROM gitpod/workspace-full:latest

RUN sudo apt-get update \
    && sudo apt-get install -y jq \
    && sudo rm -rf /var/lib/apt/lists/*

RUN rustup target add wasm32-unknown-unknown

RUN bash -cl "rustup toolchain install nightly"
RUN bash -cl "rustup target add wasm32-unknown-unknown --toolchain nightly"
