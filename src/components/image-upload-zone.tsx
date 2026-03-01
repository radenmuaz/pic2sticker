import React, { useCallback, useState } from "react";
import { UploadCloudIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadZoneProps {
    onImageSelected: (file: File) => void;
    isProcessing: boolean;
}

export function ImageUploadZone({
    onImageSelected,
    isProcessing,
}: ImageUploadZoneProps) {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(false);

            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                const file = e.dataTransfer.files[0];
                if (file.type.startsWith("image/")) {
                    onImageSelected(file);
                } else {
                    alert("Please upload an image file.");
                }
            }
        },
        [onImageSelected]
    );

    const handleFileChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.files && e.target.files[0]) {
                onImageSelected(e.target.files[0]);
            }
        },
        [onImageSelected]
    );

    return (
        <div className="w-full flex flex-col gap-8 items-center">
            <div
                className={cn(
                    "relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl transition-colors duration-200 ease-in-out cursor-pointer",
                    isDragging
                        ? "border-primary bg-primary/10"
                        : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
                    isProcessing && "opacity-50 pointer-events-none"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById("file-upload")?.click()}
            >
                <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={isProcessing}
                />
                <div className="flex flex-col items-center justify-center p-4 text-center space-y-2">
                    <div className="p-4 rounded-full bg-background border shadow-sm">
                        <UploadCloudIcon className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-medium">
                            Drag & drop, paste (Ctrl+V), or click to select
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Supports JPG, PNG, WEBP
                        </p>
                    </div>
                </div>
            </div>

            <div className="relative w-full">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-muted-foreground/20" />
                </div>
                <div className="relative flex justify-center text-xs">
                    <span className="bg-background px-2 text-muted-foreground font-medium">
                        Or try a sample
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-3 w-full max-w-[280px] mx-auto">
                {[
                    { src: "/demo-images/original/calico.png", label: "Calico Cat" },
                    { src: "/demo-images/original/tortie.png", label: "Tortie Cat" },
                    { src: "/demo-images/original/grey.png", label: "Grey Cat" },
                ].map((demo) => (
                    <button
                        key={demo.src}
                        disabled={isProcessing}
                        onClick={async () => {
                            try {
                                const res = await fetch(demo.src);
                                const blob = await res.blob();
                                const file = new File([blob], demo.src.split('/').pop()!, { type: "image/png" });
                                onImageSelected(file);
                            } catch (e) {
                                console.error("Failed to load demo image", e);
                            }
                        }}
                        className="relative aspect-square overflow-hidden rounded-lg border border-muted-foreground/20 hover:ring-2 hover:ring-primary hover:border-transparent transition-all group/demo disabled:opacity-50"
                    >
                        <img src={demo.src} alt={demo.label} className="w-full h-full object-cover transition-transform group-hover/demo:scale-105" />
                    </button>
                ))}
            </div>
        </div>
    );
}
