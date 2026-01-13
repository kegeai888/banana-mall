import { useState, useRef, useEffect } from "react";
import { useAppStore } from "@/stores/useAppStore";
import { api } from "@/lib/api";
import { exportContent } from "@/lib/export";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Download, 
  RefreshCw, 
  Edit2, 
  Image as ImageIcon,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Smartphone,
  Monitor
} from "lucide-react";
import { Loader2 } from "lucide-react";

const isTauri = () =>
  typeof window !== "undefined" && "__TAURI_IPC__" in window;

export function EditorPage() {
  const { generatedContent, setGeneratedContent, setCurrentStep, settings } = useAppStore();
  const [editingImageId, setEditingImageId] = useState<string | null>(null);
  const [imagePrompt, setImagePrompt] = useState("");
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isSavingImage, setIsSavingImage] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isMobileView, setIsMobileView] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  if (!generatedContent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">未找到生成内容</p>
            <Button
              onClick={() => setCurrentStep("upload")}
              className="mt-4"
              variant="outline"
            >
              重新开始
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { product, images, texts, platform, style, detailPage } = generatedContent;
  const mainImages = images.filter((img) => img.type === "main");
  const detailImages = images.filter((img) => img.type === "detail");

  // Auto-scroll carousel
  useEffect(() => {
    if (carouselRef.current && mainImages.length > 0) {
      const scrollWidth = carouselRef.current.scrollWidth / mainImages.length;
      carouselRef.current.scrollTo({
        left: scrollWidth * currentImageIndex,
        behavior: "smooth",
      });
    }
  }, [currentImageIndex, mainImages.length]);

  const handleTextChange = (field: "title" | "description", value: string) => {
    setGeneratedContent({
      ...generatedContent,
      texts: {
        ...texts,
        [field]: value,
      },
    });
  };

  const handleSpecChange = (index: number, value: string) => {
    const newSpecs = [...texts.specifications];
    newSpecs[index] = value;
    setGeneratedContent({
      ...generatedContent,
      texts: {
        ...texts,
        specifications: newSpecs,
      },
    });
  };

  /**
   * 提取当前显示的图片数据用于重绘：优先使用已有 data URL，否则拉取并转为 base64
   */
  const getImageDataForEdit = async (
    imageUrl: string
  ): Promise<{ base64: string; mimeType: string }> => {
    if (imageUrl.startsWith("data:image/")) {
      const [prefix, base64] = imageUrl.split(",");
      const mimeMatch = prefix.match(/data:(.*);base64/);
      return {
        base64: base64 || "",
        mimeType: mimeMatch?.[1] || "image/png",
      };
    }

    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const mimeType = blob.type || "image/png";

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        resolve({
          base64: result.split(",")[1] || "",
          mimeType,
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  /**
   * 将 base64 图片保存到本地（桌面端写文件，Web 触发下载）
   */
  const saveImageLocally = async (opts: {
    base64: string;
    mimeType: string;
    filenameHint: string;
  }) => {
    const { base64, mimeType, filenameHint } = opts;
    const ext = mimeType.split("/")[1] || "png";
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `${filenameHint}-${timestamp}.${ext}`;

    // 桌面端：写入指定目录（settings.exportPath），如果没有则弹出目录选择
    if (isTauri()) {
      const { writeBinaryFile, createDir } = await import(
        /* @vite-ignore */ "@tauri-apps/plugin-fs"
      );
      const { open } = await import(
        /* @vite-ignore */ "@tauri-apps/plugin-dialog"
      );

      let targetDir = settings.exportPath;
      if (!targetDir) {
        const selected = await open({
          directory: true,
          title: "选择图片保存目录",
        });
        if (!selected || Array.isArray(selected)) {
          throw new Error("未选择保存目录");
        }
        targetDir = selected;
      }

      await createDir(targetDir, { recursive: true });

      const binary = Uint8Array.from(
        atob(base64),
        (char) => char.charCodeAt(0)
      );
      const targetPath = `${targetDir}/${filename}`;
      await writeBinaryFile(targetPath, binary);
      alert(`已保存到：${targetPath}`);
      return;
    }

    // Web：触发浏览器下载
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleRegenerateImage = async (imageId: string) => {
    const image = images.find((img) => img.id === imageId);
    if (!image || !imagePrompt.trim()) return;

    setIsRegenerating(true);
    try {
      // 使用当前点击的图作为重绘基础，保持与用户看到的版本一致
      const { base64, mimeType } = await getImageDataForEdit(image.url);
      const newImageUrl = await api.editImage({
        image: base64,
        imageMimeType: mimeType,
        prompt: imagePrompt,
      });

      // 自动保存重绘后的图片
      const { base64: newBase64, mimeType: newMime } = await getImageDataForEdit(newImageUrl);
      await saveImageLocally({
        base64: newBase64,
        mimeType: newMime,
        filenameHint: `${image.id}-regenerated`,
      });

      const updatedImages = images.map((img) =>
        img.id === imageId
          ? { ...img, url: newImageUrl, prompt: imagePrompt }
          : img
      );

      setGeneratedContent({
        ...generatedContent,
        images: updatedImages,
      });

      setEditingImageId(null);
      setImagePrompt("");
    } catch (err) {
      console.error("Image regeneration error:", err);
      alert("图片重绘失败，请重试");
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleSaveImage = async (imageId: string) => {
    const image = images.find((img) => img.id === imageId);
    if (!image || !image.url) return;

    try {
      setIsSavingImage(true);
      const { base64, mimeType } = await getImageDataForEdit(image.url);
      await saveImageLocally({
        base64,
        mimeType,
        filenameHint: image.id,
      });
    } finally {
      setIsSavingImage(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportContent(generatedContent, settings.exportPath);
    } catch (err) {
      console.error("Export error:", err);
      alert(err instanceof Error ? err.message : "导出失败，请重试");
    } finally {
      setIsExporting(false);
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % mainImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + mainImages.length) % mainImages.length);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentStep("upload")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回
            </Button>
            <h1 className="text-xl font-semibold">编辑详情页</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={isMobileView ? "default" : "outline"}
              size="sm"
              onClick={() => setIsMobileView(true)}
            >
              <Smartphone className="h-4 w-4 mr-2" />
              手机
            </Button>
            <Button
              variant={!isMobileView ? "default" : "outline"}
              size="sm"
              onClick={() => setIsMobileView(false)}
            >
              <Monitor className="h-4 w-4 mr-2" />
              桌面
            </Button>
            <Button onClick={handleExport} disabled={isExporting}>
              {isExporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  导出中...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  导出
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Preview Panel */}
          <div className={`lg:col-span-2 space-y-0 ${isMobileView ? "flex justify-center" : ""}`}>
            {isMobileView ? (
              // Mobile Preview
              <div className="w-[375px] bg-gray-100 rounded-lg shadow-2xl overflow-hidden">
                <div className="bg-white min-h-screen">
                  {/* Product Title */}
                  <div className="p-4 border-b">
                    <h1 className="text-lg font-semibold leading-tight">{texts.title}</h1>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{texts.description}</p>
                  </div>

                  {/* Image Carousel */}
                  <div className="relative bg-white">
                    <div
                      ref={carouselRef}
                      className="flex overflow-x-hidden scroll-smooth"
                      style={{ scrollSnapType: "x mandatory" }}
                    >
                      {mainImages.map((image, idx) => (
                        <div
                          key={image.id}
                          className="w-full flex-shrink-0"
                          style={{ scrollSnapAlign: "start" }}
                        >
                          <img
                            src={image.url}
                            alt={`主图 ${idx + 1}`}
                            className="w-full aspect-square object-cover"
                          />
                        </div>
                      ))}
                    </div>
                    {mainImages.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-1.5 hover:bg-black/70 transition-colors"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-1.5 hover:bg-black/70 transition-colors"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                          {mainImages.map((_, idx) => (
                            <div
                              key={idx}
                              className={`h-1.5 rounded-full transition-all ${
                                idx === currentImageIndex ? "w-6 bg-white" : "w-1.5 bg-white/50"
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Price Section */}
                  {detailPage?.buyBox && (
                    <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 border-b">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-red-600">
                          {detailPage.buyBox.price}
                        </span>
                        {detailPage.buyBox.originalPrice && (
                          <span className="text-sm text-gray-500 line-through">
                            {detailPage.buyBox.originalPrice}
                          </span>
                        )}
                      </div>
                      <Button className="w-full mt-3 bg-red-600 hover:bg-red-700">
                        {detailPage.buyBox.cta || "立即购买"}
                      </Button>
                    </div>
                  )}

                  {/* Specifications */}
                  {texts.specifications && texts.specifications.length > 0 && (
                    <div className="p-4 border-b bg-white">
                      <h2 className="text-base font-semibold mb-3">商品规格</h2>
                      <div className="space-y-2">
                        {texts.specifications.map((spec, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm">
                            <span className="text-gray-500">•</span>
                            <span className="text-gray-700">{spec}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Value Proposition */}
                  {detailPage?.valueProposition && (
                    <div className="p-4 border-b bg-white">
                      <h2 className="text-base font-semibold mb-3">产品卖点</h2>
                      {detailPage.valueProposition.painPoints && (
                        <div className="mb-4">
                          <h3 className="text-sm font-medium text-gray-600 mb-2">用户痛点</h3>
                          <div className="space-y-2">
                            {detailPage.valueProposition.painPoints.map((point: string, idx: number) => (
                              <div key={idx} className="flex items-start gap-2 text-sm">
                                <span className="text-red-500">⚠</span>
                                <span className="text-gray-700">{point}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {detailPage.valueProposition.solutions && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-600 mb-2">解决方案</h3>
                          <div className="space-y-2">
                            {detailPage.valueProposition.solutions.map((solution: string, idx: number) => (
                              <div key={idx} className="flex items-start gap-2 text-sm">
                                <span className="text-green-500">✓</span>
                                <span className="text-gray-700">{solution}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Social Proof */}
                  {detailPage?.socialProof && (
                    <div className="p-4 border-b bg-white">
                      <h2 className="text-base font-semibold mb-3">用户评价</h2>
                      {detailPage.socialProof.salesData && (
                        <div className="text-sm text-gray-600 mb-3">
                          {detailPage.socialProof.salesData}
                        </div>
                      )}
                      {detailPage.socialProof.reviews && (
                        <div className="space-y-3">
                          {detailPage.socialProof.reviews.map((review: { text: string; rating: number }, idx: number) => (
                            <div key={idx} className="border-l-2 border-gray-200 pl-3">
                              <div className="flex items-center gap-1 mb-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <span
                                    key={i}
                                    className={`text-sm ${
                                      i < review.rating ? "text-yellow-400" : "text-gray-300"
                                    }`}
                                  >
                                    ★
                                  </span>
                                ))}
                              </div>
                              <p className="text-sm text-gray-700">{review.text}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Service Guarantee */}
                  {detailPage?.serviceGuarantee && (
                    <div className="p-4 border-b bg-white">
                      <h2 className="text-base font-semibold mb-3">服务保障</h2>
                      {detailPage.serviceGuarantee.shipping && (
                        <div className="mb-2 text-sm text-gray-700">
                          <span className="font-medium">物流：</span>
                          {detailPage.serviceGuarantee.shipping}
                        </div>
                      )}
                      {detailPage.serviceGuarantee.returnPolicy && (
                        <div className="mb-3 text-sm text-gray-700">
                          <span className="font-medium">退换货：</span>
                          {detailPage.serviceGuarantee.returnPolicy}
                        </div>
                      )}
                      {detailPage.serviceGuarantee.faq && (
                        <div className="space-y-3">
                          <h3 className="text-sm font-medium text-gray-600">常见问题</h3>
                          {detailPage.serviceGuarantee.faq.map((faq: { question: string; answer: string }, idx: number) => (
                            <div key={idx} className="text-sm">
                              <div className="font-medium text-gray-700 mb-1">Q: {faq.question}</div>
                              <div className="text-gray-600">A: {faq.answer}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Detail Images */}
                  {detailImages.length > 0 && (
                    <div className="bg-white">
                      {detailImages.map((image, idx) => (
                        <div key={image.id} className="w-full">
                          <img
                            src={image.url}
                            alt={`详情 ${idx + 1}`}
                            className="w-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Cross-sell */}
                  {detailPage?.crossSell?.recommendations && (
                    <div className="p-4 bg-gray-50 border-t">
                      <h2 className="text-base font-semibold mb-3">相关推荐</h2>
                      <div className="space-y-2">
                        {detailPage.crossSell.recommendations.map((rec: string, idx: number) => (
                          <div key={idx} className="text-sm text-gray-700">
                            • {rec}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Desktop Preview
              <div className="space-y-6">
                {/* Product Title */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl">{texts.title}</CardTitle>
                    <CardDescription>{texts.description}</CardDescription>
                  </CardHeader>
                </Card>

                {/* Main Images Carousel */}
                <Card>
                  <CardHeader>
                    <CardTitle>主图</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <div
                        ref={carouselRef}
                        className="flex overflow-x-hidden scroll-smooth rounded-lg"
                        style={{ scrollSnapType: "x mandatory" }}
                      >
                        {mainImages.map((image, idx) => (
                          <div
                            key={image.id}
                            className="w-full flex-shrink-0 relative group"
                            style={{ scrollSnapAlign: "start" }}
                          >
                            <img
                              src={image.url}
                              alt={`主图 ${idx + 1}`}
                              className="w-full rounded-lg border"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => {
                                  setEditingImageId(image.id);
                                  setImagePrompt(image.prompt);
                                }}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                      {mainImages.length > 1 && (
                        <>
                          <Button
                            variant="secondary"
                            size="icon"
                            className="absolute left-2 top-1/2 -translate-y-1/2"
                            onClick={prevImage}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="secondary"
                            size="icon"
                            className="absolute right-2 top-1/2 -translate-y-1/2"
                            onClick={nextImage}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                            {mainImages.map((_, idx) => (
                              <button
                                key={idx}
                                onClick={() => setCurrentImageIndex(idx)}
                                className={`h-2 rounded-full transition-all ${
                                  idx === currentImageIndex ? "w-8 bg-primary" : "w-2 bg-primary/50"
                                }`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Detail Images */}
                <Card>
                  <CardHeader>
                    <CardTitle>详情页</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {detailImages.map((image) => (
                      <div key={image.id} className="relative group">
                        <img
                          src={image.url}
                          alt="Detail"
                          className="w-full rounded-lg border"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              setEditingImageId(image.id);
                              setImagePrompt(image.prompt);
                            }}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Specifications */}
                <Card>
                  <CardHeader>
                    <CardTitle>商品规格</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {texts.specifications.map((spec, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground">
                          • {spec}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Right: Edit Panel */}
          <div className="space-y-6">
            <Tabs defaultValue="text" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="text">文本编辑</TabsTrigger>
                <TabsTrigger value="image">图片编辑</TabsTrigger>
              </TabsList>

              <TabsContent value="text" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>商品标题</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Input
                      value={texts.title}
                      onChange={(e) => handleTextChange("title", e.target.value)}
                      placeholder="输入商品标题"
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>商品描述</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={texts.description}
                      onChange={(e) =>
                        handleTextChange("description", e.target.value)
                      }
                      placeholder="输入商品描述"
                      rows={6}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>商品规格</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {texts.specifications.map((spec, idx) => (
                      <Input
                        key={idx}
                        value={spec}
                        onChange={(e) =>
                          handleSpecChange(idx, e.target.value)
                        }
                        placeholder={`规格 ${idx + 1}`}
                      />
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="image" className="space-y-4">
                {editingImageId ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>图片重绘</CardTitle>
                      <CardDescription>
                        通过提示词调整图片效果
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>提示词</Label>
                        <Textarea
                          value={imagePrompt}
                          onChange={(e) => setImagePrompt(e.target.value)}
                          placeholder="描述你想要的图片效果..."
                          rows={4}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleRegenerateImage(editingImageId)}
                          disabled={isRegenerating || !imagePrompt.trim()}
                          className="flex-1"
                        >
                          {isRegenerating ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              生成中...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="mr-2 h-4 w-4" />
                              重新生成
                            </>
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleSaveImage(editingImageId)}
                          disabled={isSavingImage}
                        >
                          {isSavingImage ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              保存中...
                            </>
                          ) : (
                            <>
                              <Download className="mr-2 h-4 w-4" />
                              保存图片
                            </>
                          )}
                        </Button>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditingImageId(null);
                          setImagePrompt("");
                        }}
                        className="w-full"
                      >
                        取消
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center text-muted-foreground">
                      <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>点击预览区域的图片开始编辑</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
