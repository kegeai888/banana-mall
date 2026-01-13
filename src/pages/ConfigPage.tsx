import { useState } from "react";
import {
  useAppStore,
  Platform,
  Style,
  Model,
  Language,
} from "@/stores/useAppStore";
import { useTranslation } from "@/lib/i18n";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, ArrowRight } from "lucide-react";

export function ConfigPage() {
  const { product, settings, setCurrentStep, updateSettings } = useAppStore();
  const t = useTranslation();

  const PLATFORMS: { value: Platform; label: string; description: string }[] = [
    {
      value: "amazon",
      label: t.platforms.amazon,
      description: t.platforms.amazonDesc,
    },
    {
      value: "taobao",
      label: t.platforms.taobao,
      description: t.platforms.taobaoDesc,
    },
    { value: "jd", label: t.platforms.jd, description: t.platforms.jdDesc },
  ];

  const STYLES: { value: Style; label: string; description: string }[] = [
    {
      value: "minimal",
      label: t.styles.minimal,
      description: t.styles.minimalDesc,
    },
    {
      value: "cyber",
      label: t.styles.cyber,
      description: t.styles.cyberDesc,
    },
    {
      value: "chinese",
      label: t.styles.chinese,
      description: t.styles.chineseDesc,
    },
  ];
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>(
    settings.defaultPlatform
  );
  const [selectedStyle, setSelectedStyle] = useState<Style>(
    settings.defaultStyle
  );
  const [selectedModel, setSelectedModel] = useState<Model>(
    settings.selectedModel || "nanobanana"
  );
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(
    settings.selectedLanguage || "zh"
  );
  const [mainImageCount, setMainImageCount] = useState<number>(
    settings.mainImageCount || 5
  );
  const [detailImageCount, setDetailImageCount] = useState<number>(
    settings.detailImageCount || 2
  );
  const [brandName, setBrandName] = useState<string>(
    settings.brandName || ""
  );
  const [extraInfo, setExtraInfo] = useState<string>(
    settings.extraInfo || ""
  );

  const handleNext = () => {
    if (!product) return;

    // Update settings with selected platform, style, model, language and image counts
    updateSettings({
      defaultPlatform: selectedPlatform,
      defaultStyle: selectedStyle,
      selectedModel: selectedModel,
      selectedLanguage: selectedLanguage,
      mainImageCount: mainImageCount,
      detailImageCount: detailImageCount,
      brandName: brandName.trim(),
      extraInfo: extraInfo.trim(),
    });

    // Store config in product or generate content
    setCurrentStep("generating");
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">未找到产品信息</p>
            <Button
              onClick={() => setCurrentStep("upload")}
              className="mt-4"
              variant="outline"
            >
              返回上传
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-semibold">{t.config.title}</h1>
          <p className="text-muted-foreground">{t.config.description}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Platform Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                {t.config.platform}
              </CardTitle>
              <CardDescription>{t.config.platformDesc}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="platform">{t.config.platform}</Label>
                <Select
                  value={selectedPlatform}
                  onValueChange={(value) =>
                    setSelectedPlatform(value as Platform)
                  }
                >
                  <SelectTrigger id="platform">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PLATFORMS.map((platform) => (
                      <SelectItem key={platform.value} value={platform.value}>
                        <div>
                          <div className="font-medium">{platform.label}</div>
                          <div className="text-xs text-muted-foreground">
                            {platform.description}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Brand Name */}
          <Card>
            <CardHeader>
              <CardTitle>{t.config.brand}</CardTitle>
              <CardDescription>{t.config.brandDesc}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="brand">{t.config.brand}</Label>
                <Input
                  id="brand"
                  type="text"
                  value={brandName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setBrandName(e.target.value)
                  }
                  placeholder={t.config.brandPlaceholder}
                  maxLength={50}
                />
              </div>
            </CardContent>
          </Card>

          {/* Extra Product Info */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>{t.config.extraInfo}</CardTitle>
              <CardDescription>{t.config.extraInfoDesc}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="extraInfo">{t.config.extraInfo}</Label>
                <textarea
                  id="extraInfo"
                  className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={extraInfo}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setExtraInfo(e.target.value)
                  }
                  placeholder={t.config.extraInfoPlaceholder}
                  maxLength={400}
                />
              </div>
            </CardContent>
          </Card>

          {/* Style Selection */}
          <Card>
            <CardHeader>
              <CardTitle>{t.config.style}</CardTitle>
              <CardDescription>{t.config.styleDesc}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="style">{t.config.style}</Label>
                <Select
                  value={selectedStyle}
                  onValueChange={(value) => setSelectedStyle(value as Style)}
                >
                  <SelectTrigger id="style">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STYLES.map((style) => (
                      <SelectItem key={style.value} value={style.value}>
                        <div>
                          <div className="font-medium">{style.label}</div>
                          <div className="text-xs text-muted-foreground">
                            {style.description}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Model and Language Selection */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t.config.model}</CardTitle>
              <CardDescription>{t.config.modelDesc}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="model">{t.config.model}</Label>
                <Select
                  value={selectedModel}
                  onValueChange={(value) => setSelectedModel(value as Model)}
                >
                  <SelectTrigger id="model">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nanobanana">
                      <div>
                        <div className="font-medium">{t.models.nanobanana}</div>
                        <div className="text-xs text-muted-foreground">
                          {t.models.nanobananaDesc}
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="nanabanana">
                      <div>
                        <div className="font-medium">{t.models.nanabanana}</div>
                        <div className="text-xs text-muted-foreground">
                          {t.models.nanabananaDesc}
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t.config.language}</CardTitle>
              <CardDescription>{t.config.languageDesc}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="language">{t.config.language}</Label>
                <Select
                  value={selectedLanguage}
                  onValueChange={(value) =>
                    setSelectedLanguage(value as Language)
                  }
                >
                  <SelectTrigger id="language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="zh">中文</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Image Count Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>{t.config.imageCount}</CardTitle>
              <CardDescription>{t.config.imageCountDesc}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mainImageCount">
                  {t.config.mainImageCount}
                </Label>
                <Input
                  id="mainImageCount"
                  type="number"
                  min="1"
                  max="10"
                  value={mainImageCount}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setMainImageCount(
                      Math.max(1, Math.min(10, parseInt(e.target.value) || 5))
                    )
                  }
                />
                <p className="text-xs text-muted-foreground">
                  {t.config.mainImageCountDesc}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="detailImageCount">
                  {t.config.detailImageCount}
                </Label>
                <Input
                  id="detailImageCount"
                  type="number"
                  min="1"
                  max="5"
                  value={detailImageCount}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setDetailImageCount(
                      Math.max(1, Math.min(5, parseInt(e.target.value) || 2))
                    )
                  }
                />
                <p className="text-xs text-muted-foreground">
                  {t.config.detailImageCountDesc}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Product Preview */}
        {product.analysis && (
          <Card>
            <CardHeader>
              <CardTitle>产品分析结果</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">产品类别</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {product.analysis.category}
                </p>
              </div>
              {product.analysis.suggestions.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">上架建议</Label>
                  <ul className="list-disc list-inside text-sm text-muted-foreground mt-1 space-y-1">
                    {product.analysis.suggestions.map((suggestion, idx) => (
                      <li key={idx}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setCurrentStep("upload")}>
            返回
          </Button>
          <Button onClick={handleNext} size="lg">
            开始生成
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
