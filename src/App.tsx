import { useState, useEffect, useRef } from 'react'
import { ImageUploadZone } from '@/components/image-upload-zone'
import { ImageResult } from '@/components/image-result'
import { removeBackground } from '@/lib/rembg'
import { Settings2, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ProcessingSettings = {
  mode: 'basic' | 'best';
  postProcessMask: boolean;
  alphaMatting: boolean;
  foregroundThreshold: number;
  backgroundThreshold: number;
  erodeSize: number;
};

const DEFAULT_SETTINGS: ProcessingSettings = {
  mode: 'basic',
  postProcessMask: true,
  alphaMatting: false,
  foregroundThreshold: 240,
  backgroundThreshold: 10,
  erodeSize: 10,
};

export default function App() {
  const [inputImage, setInputImage] = useState<string | null>(null);
  const [outputImage, setOutputImage] = useState<string | null>(null);
  const [fileToProcess, setFileToProcess] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [settings, setSettings] = useState<ProcessingSettings>(DEFAULT_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);
  const kofiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only fetch and initialize once
    if (!document.getElementById('kofi-widget-script')) {
      const script = document.createElement('script');
      script.id = 'kofi-widget-script';
      script.src = 'https://storage.ko-fi.com/cdn/widget/Widget_2.js';
      script.async = true;
      script.onload = () => {
        if (typeof window !== 'undefined' && (window as any).kofiwidget2 && kofiRef.current) {
          (window as any).kofiwidget2.init('Support me on Ko-fi', '#72a4f2', 'N4N0191W6B');
          kofiRef.current.innerHTML = (window as any).kofiwidget2.getHTML();
        }
      };
      document.head.appendChild(script);
    } else {
      if (typeof window !== 'undefined' && (window as any).kofiwidget2 && kofiRef.current && !kofiRef.current.innerHTML) {
        (window as any).kofiwidget2.init('Support me on Ko-fi', '#72a4f2', 'N4N0191W6B');
        kofiRef.current.innerHTML = (window as any).kofiwidget2.getHTML();
      }
    }
  }, []);

  const handleImageSelected = (file: File) => {
    const url = URL.createObjectURL(file);
    setInputImage(url);
    setFileToProcess(file);
    setOutputImage(null);
  };

  const handleProcess = async () => {
    if (!fileToProcess) return;

    setIsProcessing(true);
    try {
      // We pass the settings down, which will be utilized by rembg.ts to decide post-processing
      const resultBlob = await removeBackground(fileToProcess, 'u2netp', settings);
      const outputUrl = URL.createObjectURL(resultBlob);
      setOutputImage(outputUrl);
    } catch (e: any) {
      console.error(e);
      // Check if it's the WASM fallback error text we throw from rembg.ts
      if (e.message === "WASM_FALLBACK") {
        alert("The 'RemBG' precise C++ WASM module hasn't been compiled yet. Falling back to 'Basic' JS masking.");
        setSettings(s => ({ ...s, mode: 'basic' }));

        // Retry automatically with basic mode
        try {
          const fallbackBlob = await removeBackground(fileToProcess, 'u2netp', { ...settings, mode: 'basic' });
          setOutputImage(URL.createObjectURL(fallbackBlob));
        } catch (retryErr) {
          console.error(retryErr);
          alert("Failed to process image even in basic mode.");
        }
      } else {
        alert("Failed to process image. Check console for details.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      if (isProcessing) return;

      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];

        if (item.type.indexOf('image') !== -1) {
          const file = item.getAsFile();
          if (file) handleImageSelected(file);
          return;
        }

        if (item.type === 'text/plain') {
          item.getAsString(async (url) => {
            try {
              new URL(url); // basic validation
              const res = await fetch(url);
              const blob = await res.blob();
              if (blob.type.startsWith('image/')) {
                const file = new File([blob], 'pasted-url-image.png', { type: blob.type });
                handleImageSelected(file);
              }
            } catch (err) {
              console.log("Pasted text was not a valid image URL");
            }
          });
          return;
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isProcessing]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col p-4 md:p-8">
      <header className="text-center mb-10 mt-8">
        <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent mb-4">
          NoBG
        </h1>
        <p className="text-muted-foreground max-w-[600px] mx-auto text-lg mb-6">
          Client-side background removal via WebAssembly and ONNX Runtime.
        </p>
        <div ref={kofiRef} className="flex justify-center" />
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto flex flex-col items-center">
        {!inputImage ? (
          <div className="w-full max-w-2xl bg-card rounded-2xl shadow-xl border p-2">
            <div className="bg-muted/10 p-8 rounded-xl border border-dashed hover:bg-muted/20 transition-colors">
              <ImageUploadZone
                onImageSelected={handleImageSelected}
                isProcessing={isProcessing}
              />
            </div>
          </div>
        ) : (
          <div className="w-full max-w-4xl flex flex-col gap-6">
            <div className="flex justify-between items-center w-full bg-card p-4 rounded-xl border shadow-sm">
              <button
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-4 py-2 border rounded-full hover:bg-muted shadow-sm"
                onClick={() => {
                  setInputImage(null);
                  setOutputImage(null);
                  setFileToProcess(null);
                }}
              >
                ← Upload New Image
              </button>

              <button
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center gap-2 text-sm font-medium px-4 py-2 bg-muted/50 rounded-full hover:bg-muted transition-colors border"
              >
                <Settings2 className="w-4 h-4" />
                Settings
                {showSettings ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {showSettings && (
              <div className="bg-card p-6 rounded-xl border shadow-sm grid gap-6 animate-in slide-in-from-top-4 fade-in duration-200">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Processing Mode</h3>
                  <div className="flex gap-4">
                    <label className={cn(
                      "flex-1 border rounded-lg p-4 cursor-pointer transition-all hover:border-primary/50 text-center",
                      settings.mode === 'basic' ? "border-primary bg-primary/10 ring-1 ring-primary" : "border-border bg-background"
                    )}>
                      <input
                        type="radio"
                        className="hidden"
                        checked={settings.mode === 'basic'}
                        onChange={() => setSettings(s => ({ ...s, mode: 'basic' }))}
                      />
                      <div className="font-bold">Basic</div>
                    </label>
                    <label className={cn(
                      "flex-1 border rounded-lg p-4 cursor-pointer transition-all hover:border-primary/50 text-center",
                      settings.mode === 'best' ? "border-primary bg-primary/10 ring-1 ring-primary" : "border-border bg-background"
                    )}>
                      <input
                        type="radio"
                        className="hidden"
                        checked={settings.mode === 'best'}
                        onChange={() => setSettings(s => ({ ...s, mode: 'best' }))}
                      />
                      <div className="font-bold">RemBG</div>
                    </label>
                  </div>
                </div>

                {settings.mode === 'best' && (
                  <div className="grid gap-4 animate-in fade-in zoom-in-95 duration-200">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <label className="flex items-center justify-between p-3 border rounded-lg bg-background cursor-pointer hover:bg-muted/50">
                        <span className="text-sm font-medium">Post Process Mask</span>
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded"
                          checked={settings.postProcessMask}
                          onChange={(e) => setSettings(s => ({ ...s, postProcessMask: e.target.checked }))}
                        />
                      </label>

                      <label className="flex items-center justify-between p-3 border rounded-lg bg-background cursor-pointer hover:bg-muted/50">
                        <span className="text-sm font-medium">Alpha Matting</span>
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded"
                          checked={settings.alphaMatting}
                          onChange={(e) => setSettings(s => ({ ...s, alphaMatting: e.target.checked }))}
                        />
                      </label>
                    </div>

                    {settings.alphaMatting && (
                      <div className="grid gap-5 mt-2 p-5 bg-muted/20 rounded-xl border">
                        <div className="space-y-4">
                          <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center">
                              <label className="text-sm font-medium">Foreground Threshold</label>
                              <input
                                type="number"
                                min="0" max="255"
                                className="w-16 px-2 py-1 bg-background border rounded-md text-sm text-center"
                                value={settings.foregroundThreshold}
                                onChange={(e) => setSettings(s => ({ ...s, foregroundThreshold: Number(e.target.value) }))}
                              />
                            </div>
                            <input
                              type="range"
                              min="0" max="255"
                              value={settings.foregroundThreshold}
                              onChange={(e) => setSettings(s => ({ ...s, foregroundThreshold: Number(e.target.value) }))}
                              className="w-full accent-primary"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>0</span><span>255</span>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center">
                              <label className="text-sm font-medium">Background Threshold</label>
                              <input
                                type="number"
                                min="0" max="255"
                                className="w-16 px-2 py-1 bg-background border rounded-md text-sm text-center"
                                value={settings.backgroundThreshold}
                                onChange={(e) => setSettings(s => ({ ...s, backgroundThreshold: Number(e.target.value) }))}
                              />
                            </div>
                            <input
                              type="range"
                              min="0" max="255"
                              value={settings.backgroundThreshold}
                              onChange={(e) => setSettings(s => ({ ...s, backgroundThreshold: Number(e.target.value) }))}
                              className="w-full accent-primary"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>0</span><span>255</span>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center">
                              <label className="text-sm font-medium">Erode Size</label>
                              <input
                                type="number"
                                min="0" max="50"
                                className="w-16 px-2 py-1 bg-background border rounded-md text-sm text-center"
                                value={settings.erodeSize}
                                onChange={(e) => setSettings(s => ({ ...s, erodeSize: Number(e.target.value) }))}
                              />
                            </div>
                            <input
                              type="range"
                              min="0" max="50"
                              value={settings.erodeSize}
                              onChange={(e) => setSettings(s => ({ ...s, erodeSize: Number(e.target.value) }))}
                              className="w-full accent-primary"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>0</span><span>50</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <ImageResult
              inputImage={inputImage}
              outputImage={outputImage}
              isProcessing={isProcessing}
              onProcess={handleProcess}
            />
          </div>
        )}
      </main>
    </div>
  )
}
