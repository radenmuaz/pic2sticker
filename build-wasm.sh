#!/bin/bash
set -e

echo "=========================================="
echo "Building OpenCV Custom WASM Module..."
echo "This may take 20-30 minutes depending on your machine."
echo "=========================================="

# 1. Setup Emscripten locally if not exists
if [ ! -d "emsdk" ]; then
    echo "Cloning Emscripten SDK..."
    git clone https://github.com/emscripten-core/emsdk.git
    cd emsdk
    ./emsdk install latest
    ./emsdk activate latest
    cd ..
fi

source ./emsdk/emsdk_env.sh

# 2. Clone OpenCV
if [ ! -d "opencv" ]; then
    echo "Cloning OpenCV 4.x..."
    git clone --branch 4.x --depth 1 https://github.com/opencv/opencv.git
fi

# 3. Build OpenCV for WebAssembly (Disabling everything except core and imgproc to keep the size < 1MB)
echo "Compiling OpenCV into static WASM libraries..."
cd opencv
mkdir -p build_wasm
cd build_wasm
emcmake cmake -DCMAKE_BUILD_TYPE=Release \
    -DBUILD_SHARED_LIBS=OFF \
    -DCMAKE_CXX_FLAGS="-O3" \
    -DCMAKE_C_FLAGS="-O3" \
    -DCV_ENABLE_INTRINSICS=OFF \
    -DBUILD_DOCS=OFF \
    -DBUILD_EXAMPLES=OFF \
    -DBUILD_TESTS=OFF \
    -DBUILD_PERF_TESTS=OFF \
    -DBUILD_ZLIB=ON \
    -DBUILD_opencv_apps=OFF \
    -DBUILD_opencv_calib3d=OFF \
    -DBUILD_opencv_dnn=OFF \
    -DBUILD_opencv_features2d=OFF \
    -DBUILD_opencv_flann=OFF \
    -DBUILD_opencv_gapi=OFF \
    -DBUILD_opencv_highgui=OFF \
    -DBUILD_opencv_ml=OFF \
    -DBUILD_opencv_objdetect=OFF \
    -DBUILD_opencv_photo=OFF \
    -DBUILD_opencv_stitching=OFF \
    -DBUILD_opencv_video=OFF \
    -DBUILD_opencv_videoio=OFF \
    -DBUILD_opencv_js=OFF \
    -DWITH_IPP=OFF \
    -DWITH_PTHREADS_PF=OFF \
    -DWITH_QUIRC=OFF \
    ..

emmake make -j8
cd ../..

# 4. Build our custom postprocess.cpp
echo "Compiling postprocess.wasm..."
mkdir -p build_module
cd build_module

emcmake cmake -DOpenCV_DIR=../opencv/build_wasm ..
emmake make

# 5. Move the WASM output to the public/models directory
echo "Copying to public/models..."
cp postprocess.js ../public/models/postprocess.js
cp postprocess.wasm ../public/models/postprocess.wasm

echo "=========================================="
echo "Success! Custom OpenCV WASM build compiled to public/models/postprocess.wasm"
echo "=========================================="
