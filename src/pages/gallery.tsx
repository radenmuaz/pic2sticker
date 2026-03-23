import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css'

const DEMO_IMAGES = [
  { name: 'Calico Cat', id: 'calico' },
  { name: 'Grey Cat', id: 'grey' },
  { name: 'Tortie Cat', id: 'tortie' },
];



function GalleryPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col p-4 md:p-8">
      <header className="text-center mb-10 mt-8">
        <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent mb-4">
          NoBG Gallery
        </h1>
        <p className="text-muted-foreground mx-auto text-lg mb-6 hover:text-foreground transition-colors cursor-pointer" onClick={() => window.location.href='/'}>
          &larr; Back to App
        </p>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto flex flex-col space-y-12">
        <section className="text-center max-w-2xl mx-auto space-y-4">
          <p className="text-xl text-muted-foreground leading-relaxed">
            See the power of NoBG's local AI processing. These examples showcase the high-quality edge detection and alpha matting powered entirely by your browser without any server uploads.
          </p>
        </section>

        <section className="grid gap-16 mt-8">
          {DEMO_IMAGES.map((img) => (
            <div key={img.id} className="space-y-4">
              <h2 className="text-2xl font-bold text-center">{img.name}</h2>
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-2">
                  <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider block text-center">Original</span>
                  <div className="bg-muted/30 rounded-2xl overflow-hidden border shadow-sm">
                    <img 
                      src={`/demo-images/original/${img.id}.png`} 
                      alt={`Original ${img.name} before background removal`}
                      className="w-full h-auto object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <span className="text-sm font-medium text-foreground uppercase tracking-wider block text-center">Background Removed</span>
                  <div 
                    className="rounded-2xl overflow-hidden border shadow-sm"
                    style={{
                      backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
                      backgroundSize: '20px 20px',
                      backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                    }}
                  >
                    <img 
                      src={`/demo-images/processed/${img.id}.png`} 
                      alt={`Processed ${img.name} with transparent background`}
                      className="w-full h-auto object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </section>
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
    <GalleryPage />
  </StrictMode>,
)
