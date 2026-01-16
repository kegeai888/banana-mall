import { useState, useCallback, useRef } from "react";
import { useAppStore } from "@/stores/useAppStore";
import { useTranslation } from "@/lib/i18n";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Image as ImageIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function UploadPage() {
  const { setProduct, setCurrentStep } = useAppStore();
  const t = useTranslation();
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        setError(t.upload.uploadError);
        return;
      }

      setError(null);
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
      setIsAnalyzing(true);

      try {
        // Convert file to base64 for API calls
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            // Get base64 without data URL prefix
            const base64Data = result.split(",")[1];
            resolve(base64Data);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        // Analyze product
        const analysis = await api.analyzeProduct(file);

        // Create product object with base64 data
        const product = {
          id: Date.now().toString(),
          image: previewUrl, // For display
          imageBase64: base64, // For API calls
          imageMimeType: file.type || "image/jpeg",
          category: analysis.category,
          tags: analysis.specifications.slice(0, 5), // Use first 5 specs as tags
          analysis,
        };

        setProduct(product);
        setCurrentStep("config");
      } catch (err) {
        console.error("Analysis error:", err);
        setError(err instanceof Error ? err.message : "分析失败，请重试");
        setIsAnalyzing(false);
      }
    },
    [preview, setProduct, setCurrentStep]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  return (
    <div className="h-full bg-background p-8 overflow-auto">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-semibold">{t.upload.title}</h1>
          <p className="text-muted-foreground">{t.upload.description}</p>
          <p className="text-xs text-muted-foreground mt-1">
            <a href="https://api.kegeai.top/register?aff=DjMp" target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-primary transition-colors">国际API中转站</a> · 让灵感落地，让回忆有形
          </p>
        </div>

        <Card>
          <CardContent className="p-8">
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => {
                if (!isAnalyzing) {
                  fileInputRef.current?.click();
                }
              }}
              className={cn(
                "border-2 border-dashed rounded-lg p-12 text-center transition-colors",
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-muted-foreground/50",
                isAnalyzing && "pointer-events-none opacity-50"
              )}
            >
              {preview ? (
                <div className="space-y-4">
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-h-64 mx-auto rounded-lg object-contain"
                  />
                  {isAnalyzing && (
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{t.upload.analyzing}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="rounded-full bg-muted p-4">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-medium">{t.upload.dragDrop}</p>
                    <p className="text-sm text-muted-foreground">
                      {t.upload.fileFormat}
                    </p>
                  </div>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileInput}
                      className="hidden"
                      id="file-upload"
                      disabled={isAnalyzing}
                      ref={fileInputRef}
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer inline-block"
                    >
                      <Button disabled={isAnalyzing} type="button">
                        <ImageIcon className="mr-2 h-4 w-4" />
                        {t.upload.clickUpload}
                      </Button>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm">
                {error}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
