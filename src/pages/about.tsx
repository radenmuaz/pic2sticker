import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css'

function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col p-4 md:p-8">
      <header className="text-center mb-10 mt-8">
        <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent mb-4">
          About NoBG
        </h1>
        <p className="text-muted-foreground mx-auto text-lg mb-6 hover:text-foreground transition-colors cursor-pointer" onClick={() => window.location.href='/'}>
          &larr; Back to App
        </p>
      </header>

      <main className="flex-1 w-full max-w-3xl mx-auto flex flex-col">
        <article className="prose prose-invert lg:prose-lg max-w-none">
          <h2 className="text-2xl font-bold mb-4">Free & Private Background Removal</h2>
          <p className="mb-4 text-muted-foreground leading-relaxed">
            NoBG was built with a single premise: background removal should be fast, free, and shouldn't require uploading your personal or professional photos to a random server on the internet. Your data never leaves your device.
          </p>
          <h2 className="text-2xl font-bold mb-4 mt-8">How it Actually Works</h2>
          <p className="mb-4 text-muted-foreground leading-relaxed">
            NoBG operates entirely client-side using Edge AI capabilities. When you first select an image, here is exactly what happens under the hood:
          </p>
          <ol className="list-decimal pl-6 mb-8 text-muted-foreground leading-relaxed space-y-2">
            <li><strong>Downloads the Neural Network:</strong> The application fetches the highly-optimized <code>u2netp.onnx</code> AI model directly to your browser's local cache. This is the same lightweight architecture pioneered by the popular <a href="https://github.com/danielgatis/rembg" target="_blank" rel="noopener noreferrer" className="text-foreground font-medium underline underline-offset-4 hover:text-foreground/80 transition-colors">rembg</a> Python repository.</li>
            <li><strong>Loads ONNX Runtime Web:</strong> We initialize Microsoft's web-optimized machine learning engine, binding it to WebAssembly (WASM) for near-native computing speeds.</li>
            <li><strong>Runs the Model:</strong> The ONNX Runtime processes your image's pixels through the U2Net model locally on your CPU or GPU to generate an initial probability mask.</li>
            <li><strong>JavaScript Post-Processing:</strong> We apply fine-tuned edge smoothing and alpha matting algorithms right in your browser to refine the tricky edges like hair and fur, resulting in a perfectly transparent cutout.</li>
          </ol>
          <h2 className="text-2xl font-bold mb-4 mt-8">Who made this?</h2>
          <p className="text-muted-foreground leading-relaxed">
            Developed by <strong>RadenLabs</strong>. NoBG is a showcase of the power of modern web technologies.
          </p>
        </article>
      </main>

      <footer className="w-full py-6 mt-10 text-center text-sm text-muted-foreground border-t">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          <a href="/" className="font-medium hover:text-foreground underline underline-offset-4 transition-colors">
            Home
          </a>
          <span className="hidden sm:inline">&bull;</span>
          <a href="/gallery" className="font-medium hover:text-foreground underline underline-offset-4 transition-colors">
            Gallery
          </a>
          <span className="hidden sm:inline">&bull;</span>
          <a href="/how-i-ported-rembg-to-onnxruntime-web" className="font-medium hover:text-foreground underline underline-offset-4 transition-colors">
            Developer Blog
          </a>
        </div>
        <p className="mt-4 text-xs opacity-60">Last Updated: 2026-03-23</p>
      </footer>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AboutPage />
  </StrictMode>,
)
