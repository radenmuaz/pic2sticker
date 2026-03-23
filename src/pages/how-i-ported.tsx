import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css'

function PortingBlogPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col p-4 md:p-8">
      <header className="text-center mb-10 mt-8">
        <h1 className="text-3xl font-extrabold tracking-tighter sm:text-4xl md:text-5xl bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent mb-4 max-w-4xl mx-auto">
          How I Ported RemBG to ONNXRuntime Web
        </h1>
        <p className="text-muted-foreground mx-auto text-lg mb-6 hover:text-foreground transition-colors cursor-pointer" onClick={() => window.location.href='/'}>
          &larr; Back to App
        </p>
      </header>

      <main className="flex-1 w-full max-w-3xl mx-auto flex flex-col">
        <article className="prose prose-invert lg:prose-lg max-w-none text-muted-foreground">
          <p className="text-foreground font-medium text-xl mb-8 leading-relaxed">
            Bringing professional-grade background removal directly to the browser required breaking down Python's <code>rembg</code> library and porting its logic to WebAssembly. Here is a developer tutorial on how NoBG achieves native-like performance purely on the client.
          </p>

          <h2 className="text-foreground text-2xl font-bold mb-4 mt-8">Step 1: The Neural Network (ONNX Runtime Web)</h2>
          <p className="mb-6 leading-relaxed">
            Standard background removal services upload images to cloud GPUs. To run this locally, the first step is exporting the PyTorch U2Net model into the ONNX format (<code>u2netp.onnx</code>). Using <code>onnxruntime-web</code>, we can execute this model natively in the browser leveraging WebAssembly (WASM) and WebGL execution providers. This outputs a raw, initial probability mask.
          </p>
          
          <h2 className="text-foreground text-2xl font-bold mb-4 mt-8">Step 2: The Post-Processing Problem</h2>
          <p className="mb-6 leading-relaxed">
            The neural network alone isn't enough. The Python <code>rembg</code> library heavily relies on <strong>Alpha Matting</strong>, Gaussian Blurring, and Morphological Opening (via OpenCV and pymatting) to refine tricky edges like hair and fur. JavaScript is too slow for these pixel-perfect matrix operations. We needed C++.
          </p>

          <h2 className="text-foreground text-2xl font-bold mb-4 mt-8">Step 3: Compiling OpenCV to WebAssembly</h2>
          <p className="mb-6 leading-relaxed">
            To replicate the Python environment, we use Emscripten (<code>emsdk</code>) to compile OpenCV directly to WebAssembly. Instead of the massive full OpenCV library, we only compile the <code>core</code> and <code>imgproc</code> modules into static WASM libraries. In our codebase, the <code>setup-deps.sh</code> and <code>build-wasm.sh</code> scripts handle cloning OpenCV and executing the Emscripten toolchain automatically.
          </p>
          
          <h2 className="text-foreground text-2xl font-bold mb-4 mt-8">Step 4: Writing the C++ Wrapper</h2>
          <p className="mb-6 leading-relaxed">
            We wrote a custom C++ file (<code>src/wasm/postprocess.cpp</code>) that consumes the raw inference mask from ONNX. It utilizes the compiled OpenCV headers to generate trimaps, compute alpha mattes, and apply morphological operations. Emscripten compiles this alongside the OpenCV static libraries into a tiny ~1MB <code>postprocess.wasm</code> file.
          </p>

          <h2 className="text-foreground text-2xl font-bold mb-4 mt-8">Step 5: Frontend Integration</h2>
          <p className="mb-6 leading-relaxed">
            Finally, inside our React Vite application (<code>src/lib/rembg.ts</code>), we dynamically load <code>postprocess.wasm</code>. We pass the raw image tensor and the native ONNX mask directly into the WASM module's memory heap, execute the C++ alpha matting synchronously at near-native speeds, and read the refined image buffer back onto an HTML5 Canvas.
          </p>
        </article>
      </main>

      <footer className="w-full py-6 mt-16 text-center text-sm text-muted-foreground border-t border-border">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          <a href="/" className="font-medium hover:text-foreground underline underline-offset-4 transition-colors">
            Home
          </a>
          <span className="hidden sm:inline">&bull;</span>
          <a href="/about" className="font-medium hover:text-foreground underline underline-offset-4 transition-colors">
            About
          </a>
          <span className="hidden sm:inline">&bull;</span>
          <a href="/gallery" className="font-medium hover:text-foreground underline underline-offset-4 transition-colors">
            Gallery
          </a>
        </div>
      </footer>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PortingBlogPage />
  </StrictMode>,
)
