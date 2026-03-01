import { useState } from "react";
import { ArrowRightIcon, Maximize2, Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageResultProps {
    inputImage: string;
    outputImage: string | null;
    isProcessing: boolean;
    onProcess?: () => void;
}

export function ImageResult({
    inputImage,
    outputImage,
    isProcessing,
    onProcess,
}: ImageResultProps) {
    const [expandedImage, setExpandedImage] = useState<string | null>(null);

    const handleDownload = () => {
        if (!outputImage) return;
        const link = document.createElement('a');
        link.href = outputImage;
        link.download = 'generated-image.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDownloadInput = () => {
        if (!inputImage) return;
        const link = document.createElement('a');
        link.href = inputImage;
        link.download = 'original-image.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="w-full max-w-5xl mx-auto space-y-8 relative">
            <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
                {/* Input */}
                <div className="flex flex-col gap-2 w-full max-w-md">
                    <div className="text-sm font-medium text-muted-foreground">Original</div>
                    <div className="relative aspect-square w-full rounded-xl overflow-hidden border bg-muted/50 group">
                        <div
                            className="relative w-full h-full cursor-pointer flex items-center justify-center"
                            onClick={() => setExpandedImage(inputImage)}
                        >
                            <img
                                src={inputImage}
                                alt="Input"
                                className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-80"
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20">
                                <span className="text-white text-sm font-medium bg-black/50 px-3 py-1.5 rounded-full backdrop-blur-sm flex items-center gap-2 pointer-events-none">
                                    <Maximize2 className="w-4 h-4" />
                                    Click to expand
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-2 w-full">
                        <Button
                            variant="outline"
                            className="w-full gap-2"
                            onClick={handleDownloadInput}
                        >
                            <Download className="h-4 w-4" />
                            Download Original
                        </Button>
                    </div>
                </div>

                {/* Arrow / Spinner */}
                <div className="flex items-center justify-center">
                    {isProcessing ? (
                        <div className="flex flex-col items-center gap-2">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                        </div>
                    ) : (
                        <ArrowRightIcon className="w-8 h-8 text-muted-foreground rotate-90 md:rotate-0" />
                    )}
                </div>

                {/* Output */}
                <div className="flex flex-col gap-2 w-full max-w-md">
                    <div className="text-sm font-medium text-muted-foreground">Result</div>
                    <div className="relative aspect-square w-full rounded-xl overflow-hidden border bg-muted/50 flex items-center justify-center group">
                        {outputImage ? (
                            <div
                                className="relative w-full h-full cursor-pointer flex items-center justify-center"
                                onClick={() => setExpandedImage(outputImage)}
                            >
                                <img
                                    src={outputImage}
                                    alt="Result"
                                    className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-80"
                                />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20">
                                    <span className="text-white text-sm font-medium bg-black/50 px-3 py-1.5 rounded-full backdrop-blur-sm flex items-center gap-2 pointer-events-none">
                                        <Maximize2 className="w-4 h-4" />
                                        Click to expand
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center p-6 text-center w-full h-full">
                                {isProcessing ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="text-muted-foreground">Processing...</div>
                                    </div>
                                ) : onProcess ? (
                                    <div className="flex flex-col items-center gap-4">
                                        <p className="text-muted-foreground text-sm">
                                            Ready to process
                                        </p>
                                        <Button
                                            onClick={onProcess}
                                            size="lg"
                                            className="shadow-lg min-w-[200px]"
                                        >
                                            Pic2Sticker Now
                                        </Button>
                                    </div>
                                ) : (
                                    <span className="text-muted-foreground/50 text-sm">Waiting for result...</span>
                                )}
                            </div>
                        )}
                    </div>

                    {outputImage && (
                        <div className="mt-4 w-full flex flex-col gap-2">
                            <Button
                                variant="default"
                                className="w-full gap-2"
                                onClick={handleDownload}
                            >
                                <Download className="h-4 w-4" />
                                Download Result
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Expanded Modal */}
            {expandedImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    onClick={() => setExpandedImage(null)}
                >
                    <div className="relative max-w-[95vw] h-[95vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                        <img
                            alt="Expanded"
                            className="max-w-full max-h-full object-contain rounded-md shadow-2xl"
                            src={expandedImage}
                        />
                        <Button
                            variant="secondary"
                            size="icon"
                            className="absolute top-4 right-4 h-10 w-10 rounded-full bg-black/50 hover:bg-black/70 text-white border-none"
                            onClick={() => setExpandedImage(null)}
                        >
                            <X className="h-6 w-6" />
                            <span className="sr-only">Close</span>
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
