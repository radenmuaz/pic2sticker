# Pic2Sticker

A fully client-side (edge-only) background removal React application built with Vite and Tailwind CSS.
This project is a browser-only port of the `delbg` UI combined with the incredible `rembg` U2Net background removal model.

![Demo Application Screenshot](./public/demo-images/original/calico.png)

## Features

- **100% Client-Side Private Processing**: No images are ever uploaded to a server. All AI inference happens securely on your local device using WebAssembly.
- **WASM Neural Network**: Powered by `onnxruntime-web` running the U2Net model architecture.
- **Configurable Processing Modes**: 
  - **Basic (Fast)**: Utilizes native HTML5 Canvas operations for instant alpha compositing.
  - **Best (Precise)**: A strict 1:1 C++ port of the original Python `rembg` library's post-processing stack (Morphological Opening, Gaussian Blurring, and Alpha Matting via Trimaps) compiled using Emscripten and a stripped-down OpenCV.
- **Drag & Drop UI**: Paste, click, or drop images effortlessly.

## Development Setup

### 1. Install Dependencies
Ensure you have Node.js and `pnpm` installed. From the `pic2sticker/` directory, run:
```bash
pnpm install
```

### 2. Run the Development Server
```bash
pnpm run dev
```
Open `http://localhost:5173` to view the app!

By default, the application will successfully run in **Basic (Fast)** mode. If you attempt to switch to **Best (Precise)** without compiling the C++ WebAssembly module first, the app will gracefully log a warning and fall back to Basic mode.

---

## Compiling the C++ "Best" Mode WASM Module

To achieve true parity with the original Python `rembg` script, this project includes custom C++ source code (`src/wasm/postprocess.cpp`) that utilizes OpenCV for heavy-duty image morphology and Alpha Matting.

Because compiling OpenCV to WebAssembly takes 20-30 minutes, it is not included by default.

To compile it yourself, first download the required dependencies:
```bash
./setup-deps.sh
```

Then run the build script:
```bash
./build-wasm.sh
```

**What the scripts do:**
1. `setup-deps.sh` downloads and activates the Emscripten SDK (`emsdk`) and clones OpenCV 4.x.
2. `build-wasm.sh` compiles a highly stripped-down version of OpenCV (`core` and `imgproc` modules only) to static WASM libraries.
3. Compiles `src/wasm/postprocess.cpp` alongside the OpenCV static libraries into a tiny ~1MB `postprocess.wasm` file.
4. Copies the resulting `.wasm` and `.js` loader to the `public/models/` directory.

Once the script finishes, reload your browser and select the **Best (Precise)** processing mode in the Advanced Settings tab!

## Project Structure
- `src/App.tsx`: Main React application layout and Advanced Settings state manager.
- `src/components/`: Reusable Tailwind CSS UI components (ported from `delbg`).
- `src/lib/rembg.ts`: The core background removal logic handling ONNX session management, image pre-processing (tensor normalization), and dynamic WASM dispatch.
- `src/wasm/postprocess.cpp`: C++ source for Alpha Matting and Morphology.
- `public/models/`: Holds the U2Net ONNX models, `onnxruntime-web` WASM execution providers, and the custom compiled `postprocess.wasm`.
- `public/demo-images/`: Sample cat images for rapid testing.