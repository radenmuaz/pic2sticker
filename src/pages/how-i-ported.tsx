import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css'

function PortingBlogPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col p-4 md:p-8">
      <header className="text-center mb-10 mt-8">
        <img src="/logo.png" alt="NoBG Logo" className="w-12 h-12 mx-auto mb-4 cursor-pointer" onClick={() => window.location.href='/'} />
        <h1 className="text-3xl font-extrabold tracking-tighter sm:text-4xl md:text-5xl bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent mb-4 max-w-4xl mx-auto">
          How I Ported RemBG to ONNXRuntime Web
        </h1>
        <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground mb-6">
          <span>March 23, 2026</span>
          <span>•</span>
          <span>10 min read</span>
        </div>
        <p className="text-muted-foreground mx-auto text-lg mb-6 hover:text-foreground transition-colors cursor-pointer" onClick={() => window.location.href='/'}>
          &larr; Back to App
        </p>
      </header>

      <main className="flex-1 w-full max-w-3xl mx-auto flex flex-col">
        <article className="prose prose-invert lg:prose-lg max-w-none text-muted-foreground">
          <p className="text-foreground font-medium text-xl mb-4 leading-relaxed">
            Bringing professional-grade background removal directly to the browser required breaking down Python's <a href="https://github.com/danielgatis/rembg" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">rembg</a> library and porting its logic to WebAssembly. 
          </p>
          <p className="mb-8">
            This is a comprehensive, step-by-step developer tutorial on how <strong>NoBG</strong> achieves native-like performance purely on the client. You can view the full source code for our implementation here: <a href="https://github.com/radenmuaz/pic2sticker" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">github.com/radenmuaz/pic2sticker</a>.
          </p>

          <h2 className="text-foreground text-2xl font-bold mb-4 mt-8">Step 1: The Neural Network (ONNX Runtime Web)</h2>
          <p className="mb-6 leading-relaxed">
            Standard background removal services upload images to cloud GPUs. To run this locally, the first step is dealing with the model itself. We export the PyTorch U2Net model into the ONNX format (specifically the lightweight <code>u2netp.onnx</code>). Using <code>onnxruntime-web</code>, we can execute this model natively in the browser leveraging WebAssembly (WASM) and WebGL execution providers.
          </p>
          
          <h2 className="text-foreground text-2xl font-bold mb-4 mt-8">Step 2: A Minimal Reproducible Example</h2>
          <p className="mb-4 leading-relaxed">
            Running ONNX in the browser is surprisingly elegant. If you simply want to see the <code>u2netp.onnx</code> model generate a raw probability mask, you can replicate this entire process in a single HTML file with inline JavaScript. 
          </p>
          <p className="mb-4 leading-relaxed">
            Save the following snippet to an <code>index.html</code> file, place the <code>u2netp.onnx</code> model next to it, and serve it via a local static server!
          </p>

          <div className="bg-muted/50 p-4 rounded-xl border overflow-x-auto mb-8 text-sm">
            <pre><code>{`<!DOCTYPE html>
<html>
<head>
  <title>Minimal U2Net Web</title>
  <script src="https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/ort.min.js"></script>
</head>
<body>
  <input type="file" id="upload" accept="image/*" />
  <canvas id="canvas"></canvas>

  <script>
    document.getElementById('upload').addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      // 1. Load Image onto Canvas to get Pixels
      const img = new Image();
      img.src = URL.createObjectURL(file);
      await new Promise(r => img.onload = r);

      const canvas = document.getElementById('canvas');
      canvas.width = 320; // U2Net standard input size
      canvas.height = 320;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, 320, 320);

      // 2. Extract ImageData & Normalize to Float32Array (RGB)
      const imageData = ctx.getImageData(0, 0, 320, 320).data;
      const float32Data = new Float32Array(3 * 320 * 320);
      for (let i = 0, j = 0; i < imageData.length; i += 4, j += 1) {
          float32Data[j] = (imageData[i] / 255.0 - 0.485) / 0.229;             // R
          float32Data[j + 320*320] = (imageData[i+1] / 255.0 - 0.456) / 0.224; // G
          float32Data[j + 2*320*320] = (imageData[i+2] / 255.0 - 0.406) / 0.225; // B
      }

      // 3. Load Model and Run Inference
      const session = await ort.InferenceSession.create('./u2netp.onnx');
      const tensor = new ort.Tensor('float32', float32Data, [1, 3, 320, 320]);
      
      const results = await session.run({ 'input.1': tensor });
      const maskData = results[Object.keys(results)[0]].data;

      // 4. Draw Mask back to Canvas
      const outImgData = ctx.createImageData(320, 320);
      // Denormalize and render greyscale mask
      const min = Math.min(...maskData);
      const max = Math.max(...maskData);
      
      for (let i = 0, j = 0; i < maskData.length; i++, j += 4) {
          const pixelVal = ((maskData[i] - min) / (max - min)) * 255;
          outImgData.data[j] = pixelVal;
          outImgData.data[j+1] = pixelVal;
          outImgData.data[j+2] = pixelVal;
          outImgData.data[j+3] = 255; // Alpha
      }
      ctx.putImageData(outImgData, 0, 0);
    });
  </script>
</body>
</html>`}</code></pre>
          </div>

          <h2 className="text-foreground text-2xl font-bold mb-4 mt-8">Step 3: The Post-Processing Problem</h2>
          <p className="mb-6 leading-relaxed">
            The code above gives you a soft probability mask, but the neural network alone isn't enough for professional graphics. The Python <code>rembg</code> library heavily relies on <strong>Alpha Matting</strong>, Gaussian Blurring, and Morphological Opening (via OpenCV and <code>pymatting</code>) to accurately refine tricky edges like straggly hair and blurry fur. Because native JavaScript is simply too slow for these pixel-perfect matrix inversions on high-res images, we needed C++.
          </p>

          <h2 className="text-foreground text-2xl font-bold mb-4 mt-8">Step 4: Compiling OpenCV to WebAssembly</h2>
          <p className="mb-6 leading-relaxed">
            To replicate the exact Python cv2 environment, we use Emscripten (<code>emsdk</code>) to compile C++ OpenCV directly to WebAssembly. Instead of shipping the massive 30MB full OpenCV library, we surgically compile only the <code>core</code> and <code>imgproc</code> modules into static WASM libraries. In the <a href="https://github.com/radenmuaz/pic2sticker" target="_blank" className="text-primary hover:underline">pic2sticker repo</a>, our <code>setup-deps.sh</code> and <code>build-wasm.sh</code> scripts handle cloning the required OpenCV version and executing the Emscripten toolchain automatically for you.
          </p>
          
          <h2 className="text-foreground text-2xl font-bold mb-4 mt-8">Step 5: Writing the C++ Wrapper</h2>
          <p className="mb-6 leading-relaxed">
            With our static libraries built, we wrote a custom C++ file (<code>src/wasm/postprocess.cpp</code>) that effectively bridges the raw inference mask from the ONNX JavaScript execution into OpenCV. It utilizes the compiled OpenCV headers to threshold the mask, generate trimaps, compute intensive alpha mattes, and apply morphological dilations. Emscripten compiles this alongside the OpenCV static libraries into a tiny, highly-optimized ~1MB <code>postprocess.wasm</code> file.
          </p>

          <h2 className="text-foreground text-2xl font-bold mb-4 mt-8">Step 6: Frontend React Integration</h2>
          <p className="mb-6 leading-relaxed">
            Finally, inside our Vite application environment (<code>src/lib/rembg.ts</code>), we dynamically load <code>postprocess.wasm</code> only when needed. We pass the raw image tensor and the native ONNX probability mask directly into the WASM module's memory heap, execute the C++ alpha matting synchronously at near-native edge speeds, and read the refined image buffer back onto a standard HTML5 Canvas to produce the beautifully transparent result you see.
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
        <p className="mt-4 text-xs opacity-60">Last Updated: 2026-03-23</p>
      </footer>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PortingBlogPage />
  </StrictMode>,
)
