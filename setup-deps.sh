#!/bin/bash
set -e

echo "=========================================="
echo "Cloning required dependencies..."
echo "=========================================="

# 1. Setup Emscripten locally if not exists
if [ ! -d "emsdk" ]; then
    echo "Cloning Emscripten SDK..."
    git clone https://github.com/emscripten-core/emsdk.git
    cd emsdk
    ./emsdk install latest
    ./emsdk activate latest
    cd ..
else
    echo "Emscripten SDK already exists."
fi

# 2. Clone OpenCV
if [ ! -d "opencv" ]; then
    echo "Cloning OpenCV 4.x..."
    git clone --branch 4.x --depth 1 https://github.com/opencv/opencv.git
else
    echo "OpenCV already exists."
fi

echo "=========================================="
echo "Dependencies cloned successfully."
echo "You can now run ./build-wasm.sh"
echo "=========================================="
