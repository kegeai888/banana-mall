import { useEffect, useRef, useState } from "react";
import { useAppStore } from "@/stores/useAppStore";
import { useTranslation } from "@/lib/i18n";
import { api } from "@/lib/api";
import { generateDetailPage } from "@/lib/api-detail";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, X } from "lucide-react";

export function GeneratingPage() {
  const { product, settings, setCurrentStep, setGeneratedContent, addHistory } =
    useAppStore();
  const t = useTranslation();

  // Get platform, style, model, language and user inputs from settings
  const platform = settings.defaultPlatform;
  const style = settings.defaultStyle;
  const model = settings.selectedModel || "nanobanana";
  const language = settings.selectedLanguage || "zh";
  const brandName = settings.brandName?.trim() || "";
  const extraInfo = settings.extraInfo?.trim() || "";
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState(t.generating.initializing);
  const [error, setError] = useState<string | null>(null);
  const [isCancelled, setIsCancelled] = useState(false);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (!product) {
      setCurrentStep("upload");
      return;
    }

    // 避免 React 严格模式导致的重复调用
    if (hasStarted.current) {
      return;
    }
    hasStarted.current = true;

    const generate = async () => {
      try {
        // Step 1: Generate text content
        setProgress(20);
        setStatus(t.generating.generatingText);

        const texts = await api.generateText({
          product: {
            category: product.category,
            tags: product.tags,
            analysis: product.analysis!,
          },
          platform: platform,
          style: style,
          language: language,
          brandName,
          extraInfo,
        });

        if (isCancelled) return;

        // Step 2: Generate main images (基于上传图片编辑，确保一致)
        setProgress(40);
        setStatus(t.generating.generatingImages);

        const mainImages = [];
        const isChinese = language === "zh";
        const mainImageCount = settings.mainImageCount || 5;
        // 使用上传图片的base64数据，确保直接传递给Google API
        const baseImageBase64 = product.imageBase64;
        const baseImageMimeType = product.imageMimeType;

        // 根据平台和风格生成不同的编辑提示，明确指定语言
        const basePrompts =
          platform === "amazon"
            ? [
                // Amazon: 极简、白底、无文字
                isChinese
                  ? "保持产品完全一致，极简风格，纯白背景，无任何文字和装饰，专业产品摄影，所有文字使用中文"
                  : "Keep product exactly the same, minimal style, pure white background, no text or decorations, professional product photography, all text in English",
                isChinese
                  ? "保持产品完全一致，侧面角度展示，极简风格，纯白背景，所有文字使用中文"
                  : "Keep product exactly the same, side angle view, minimal style, pure white background, all text in English",
                isChinese
                  ? "保持产品完全一致，细节特写，极简风格，纯白背景，突出产品质感，所有文字使用中文"
                  : "Keep product exactly the same, detail close-up, minimal style, pure white background, highlight product texture, all text in English",
                isChinese
                  ? "保持产品完全一致，45度角展示，极简风格，纯白背景，所有文字使用中文"
                  : "Keep product exactly the same, 45-degree angle view, minimal style, pure white background, all text in English",
                isChinese
                  ? "保持产品完全一致，包装展示，极简风格，纯白背景，所有文字使用中文"
                  : "Keep product exactly the same, packaging display, minimal style, pure white background, all text in English",
              ]
            : [
                // 淘宝/京东: 营销感强，可加标签
                isChinese
                  ? "保持产品完全一致，营销风格，可添加促销标签，吸引眼球，所有文字使用中文"
                  : "Keep product exactly the same, marketing style, can add promotional labels, eye-catching, all text in English",
                isChinese
                  ? "保持产品完全一致，侧面展示，营销风格，高对比度，所有文字使用中文"
                  : "Keep product exactly the same, side view, marketing style, high contrast, all text in English",
                isChinese
                  ? "保持产品完全一致，细节特写，营销风格，突出卖点，所有文字使用中文"
                  : "Keep product exactly the same, detail close-up, marketing style, highlight selling points, all text in English",
                isChinese
                  ? "保持产品完全一致，使用场景，营销风格，氛围感强，所有文字使用中文"
                  : "Keep product exactly the same, usage scene, marketing style, strong atmosphere, all text in English",
                isChinese
                  ? "保持产品完全一致，包装展示，营销风格，可添加价格标签，所有文字使用中文"
                  : "Keep product exactly the same, packaging display, marketing style, can add price labels, all text in English",
              ];

        // 根据用户设置的数量生成图片
        for (let i = 0; i < mainImageCount; i++) {
          if (isCancelled) return;

          setStatus(
            `${t.generating.generatingImages} ${i + 1}/${mainImageCount}`
          );

          // 使用循环的提示词，如果超过5个则重复使用
          const basePrompt = basePrompts[i % basePrompts.length];
          const extraInfoSuffix =
            extraInfo && extraInfo.length > 0
              ? isChinese
                ? `，整体画面风格需要呼应以下产品补充信息：${extraInfo}`
                : `, overall visual style should reflect the following additional product info: ${extraInfo}`
              : "";
          const prompt =
            brandName && platform !== "amazon" && i % 2 === 0
              ? basePrompt +
                (isChinese
                  ? `，在画面合适位置加入品牌名称「${brandName}」的小标签`
                  : `, subtly include brand name "${brandName}" as a small promotional label in the image`) +
                extraInfoSuffix
              : basePrompt + extraInfoSuffix;

          // 使用editImage确保和上传图片一致，直接传递base64给Google API
          const imageUrl = await api.editImage({
            image: baseImageBase64,
            imageMimeType: baseImageMimeType,
            prompt: prompt,
          });

          mainImages.push({
            id: `main-${i}`,
            url: imageUrl,
            prompt: prompt,
            type: "main" as const,
          });

          setProgress(40 + Math.floor((i + 1) * (40 / mainImageCount)));
        }

        if (isCancelled) return;

        // Step 3: Generate detail page content (5大核心模块)
        setProgress(80);
        setStatus(t.generating.generatingDetail);

        const detailPage = await generateDetailPage(
          product,
          platform,
          style,
          language,
          model,
          brandName || undefined,
          extraInfo || undefined
        );

        if (isCancelled) return;

        // Step 4: Generate detail page images (3:4比例，基于上传图片)
        setProgress(85);
        setStatus(t.generating.generatingDetailImages);

        const detailImages = [];
        const detailImageCount = settings.detailImageCount || 2;
        const detailPrompts = isChinese
          ? [
              "保持产品完全一致，详情页长图，3:4比例，包含5大核心模块内容，移动端优化，所有文字使用中文",
              "保持产品完全一致，产品规格可视化展示图，3:4比例，所有文字使用中文",
              "保持产品完全一致，产品使用场景图，3:4比例，所有文字使用中文",
              "保持产品完全一致，产品特点对比图，3:4比例，所有文字使用中文",
              "保持产品完全一致，产品细节展示图，3:4比例，所有文字使用中文",
            ]
          : [
              "Keep product exactly the same, detail page long image, 3:4 ratio, includes 5 core modules, mobile optimized, all text in English",
              "Keep product exactly the same, product specification visualization, 3:4 ratio, all text in English",
              "Keep product exactly the same, product usage scene, 3:4 ratio, all text in English",
              "Keep product exactly the same, product feature comparison, 3:4 ratio, all text in English",
              "Keep product exactly the same, product detail showcase, 3:4 ratio, all text in English",
            ];

        for (let i = 0; i < detailImageCount; i++) {
          if (isCancelled) return;

          // 使用循环的提示词，如果超过5个则重复使用
          const basePrompt = detailPrompts[i % detailPrompts.length];
          const extraInfoSuffix =
            extraInfo && extraInfo.length > 0
              ? isChinese
                ? `，在内容和布局上需要呼应以下产品补充信息：${extraInfo}`
                : `, content and layout should reflect the following additional product info: ${extraInfo}`
              : "";
          const prompt =
            brandName && i === 0
              ? basePrompt +
                (isChinese
                  ? `，在画面中自然露出品牌名称「${brandName}」，与卖点文案风格一致`
                  : `, naturally reveal brand name "${brandName}" in the layout, consistent with selling point copy`) +
                extraInfoSuffix
              : basePrompt + extraInfoSuffix;

          // 使用editImage确保和上传图片一致，3:4比例，直接传递base64给Google API
          const imageUrl = await api.editImage({
            image: baseImageBase64,
            imageMimeType: baseImageMimeType,
            prompt: prompt,
          });

          detailImages.push({
            id: `detail-${i}`,
            url: imageUrl,
            prompt: prompt,
            type: "detail" as const,
          });
        }

        if (isCancelled) return;

        // Step 5: Complete
        setProgress(100);
        setStatus(t.generating.complete);

          const finalContent = {
          product,
          platform: platform,
          style: style,
          model: model,
          language: language,
          brandName,
          images: [...mainImages, ...detailImages],
          texts,
          detailPage,
        };

        // Set generated content & history
        setGeneratedContent(finalContent);
        await addHistory(finalContent);

        // Navigate to editor
        setTimeout(() => {
          setCurrentStep("editing");
        }, 500);
      } catch (err) {
        console.error("Generation error:", err);
        setError(err instanceof Error ? err.message : t.common.error);
      }
    };

    generate();

    return () => {
      setIsCancelled(true);
    };
  }, [product, settings, setCurrentStep, setGeneratedContent, isCancelled]);

  const handleCancel = () => {
    setIsCancelled(true);
    setCurrentStep("config");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-8 space-y-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-2">
                {t.generating.title}
              </h2>
              <p className="text-muted-foreground">{status}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{status}</span>
              <span>{Math.round(progress)}%</span>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-center">
            <Button variant="outline" onClick={handleCancel}>
              <X className="mr-2 h-4 w-4" />
              {t.generating.cancel}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
