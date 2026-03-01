cmake_minimum_required(VERSION 3.10)
project(pic2sticker_wasm)

# Path to the compiled OpenCV for WebAssembly
# Make sure OpenCV is configured with -DCMAKE_TOOLCHAIN_FILE=.../upstream/emscripten/cmake/Modules/Platform/Emscripten.cmake
find_package(OpenCV REQUIRED)

include_directories(${OpenCV_INCLUDE_DIRS})

# Create the WebAssembly target
add_executable(postprocess src/wasm/postprocess.cpp)

# Link OpenCV
target_link_libraries(postprocess ${OpenCV_LIBS})

# WebAssembly Compiler & Linker Flags
target_compile_options(postprocess PRIVATE -O3)

# Emscripten linker flags
set_target_properties(postprocess PROPERTIES LINK_FLAGS "\
  -s WASM=1 \
  -s EXPORTED_RUNTIME_METHODS='[\"cwrap\",\"getValue\",\"setValue\",\"HEAPU8\"]' \
  -s EXPORTED_FUNCTIONS='[\"_malloc\",\"_free\",\"_process_mask\",\"_alpha_matting_cutout\"]' \
  -s ALLOW_MEMORY_GROWTH=1 \
  -s MODULARIZE=1 \
  -s EXPORT_NAME='createPostProcessModule' \
  -s ENVIRONMENT=web \
  -O3 \
")
