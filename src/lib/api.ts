import { useAppStore } from "@/stores/useAppStore";
import type { ProductAnalysis, Platform, Style } from "@/stores/useAppStore";
import { mockAPI } from "./api-mock";

export interface GenerateTextParams {
  product: {
    category: string;
    tags: string[];
    analysis: ProductAnalysis;
  };
  platform: Platform;
  style: Style;
  language: "zh" | "en";
  brandName?: string;
  extraInfo?: string;
}

export interface GenerateImageParams {
  prompt: string;
  style: Style;
  platform: Platform;
  type?: "main" | "detail" | "scene";
}

export interface EditImageParams {
  image: string; // base64 string (without data URL prefix)
  imageMimeType: string; // image mime type (e.g., 'image/jpeg', 'image/png')
  prompt: string;
  mask?: string; // optional mask for inpainting
}

class NanoBananaAPI {
  private getBaseURL(): string {
    const { settings } = useAppStore.getState();
    // Default to proxy API for Gemini
    return settings.baseURL || "https://api.openai-proxy.org";
  }

  private getApiKey(): string {
    const { settings } = useAppStore.getState();
    return settings.apiKey;
  }

  /**
   * Get Gemini API endpoint
   * Uses /google suffix for Gemini models via proxy
   */
  private getGeminiURL(): string {
    const baseURL = this.getBaseURL();
    // If using proxy, add /google suffix for Gemini
    if (baseURL.includes("openai-proxy.org")) {
      return `${baseURL}/google`;
    }
    // Otherwise assume it's direct Gemini API
    return baseURL;
  }

  /**
   * Make request to Gemini API (OpenAI compatible format)
   * Made public for use in api-detail.ts
   */
  async requestGemini<T>(
    model: string,
    contents: any[],
    config?: any
  ): Promise<T> {
    const geminiURL = this.getGeminiURL();
    const apiKey = this.getApiKey();

    if (!apiKey) {
      throw new Error("API Key is required");
    }

    const response = await fetch(
      `${geminiURL}/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents,
          ...config,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Gemini API Error: ${response.statusText} - ${errorText}`
      );
    }

    return response.json();
  }

  /**
   * Analyze product image using Gemini vision
   */
  async analyzeProduct(imageFile: File): Promise<ProductAnalysis> {
    const apiKey = this.getApiKey();

    // Use mock API if no API key is configured
    if (!apiKey) {
      console.warn("No API key configured, using mock API");
      return mockAPI.analyzeProduct(imageFile);
    }

    try {
      // Convert file to base64
      const base64 = await this.fileToBase64(imageFile);
      const mimeType = imageFile.type || "image/jpeg";

      // Use Gemini 2.5 Flash for fast analysis
      const prompt = `请分析这张产品图片，提供以下信息（用中文回答）：
1. 产品类别（一个词或短语）
2. 产品描述（2-3句话）
3. 上架建议（3-4条，每条一句话）
4. 产品规格（5条，格式：属性名：属性值）

请以JSON格式返回，格式如下：
{
  "category": "产品类别",
  "description": "产品描述",
  "suggestions": ["建议1", "建议2", "建议3"],
  "specifications": ["规格1", "规格2", "规格3", "规格4", "规格5"]
}`;

      const response = await this.requestGemini<{
        candidates: Array<{
          content: {
            parts: Array<{ text: string }>;
          };
        }>;
      }>("gemini-2.5-flash", [
        {
          parts: [
            {
              inlineData: {
                mimeType: mimeType,
                data: base64,
              },
            },
            { text: prompt },
          ],
        },
      ]);

      // Extract text response
      const textResponse = response.candidates[0]?.content?.parts[0]?.text;
      if (!textResponse) {
        throw new Error("No response from Gemini");
      }

      // Parse JSON from response (might be wrapped in markdown code blocks)
      let jsonText = textResponse.trim();
      if (jsonText.includes("```json")) {
        jsonText = jsonText.split("```json")[1].split("```")[0].trim();
      } else if (jsonText.includes("```")) {
        jsonText = jsonText.split("```")[1].split("```")[0].trim();
      }

      const analysis = JSON.parse(jsonText) as ProductAnalysis;
      return analysis;
    } catch (error) {
      console.error("Gemini analysis error:", error);
      console.warn("Falling back to mock API");
      return mockAPI.analyzeProduct(imageFile);
    }
  }

  /**
   * Generate product text content using Gemini
   */
  async generateText(params: GenerateTextParams): Promise<{
    title: string;
    description: string;
    specifications: string[];
  }> {
    const apiKey = this.getApiKey();

    if (!apiKey) {
      return mockAPI.generateText(params);
    }

    try {
      const platformNames = {
        amazon: "Amazon",
        taobao: "淘宝",
        jd: "京东",
      };

      const styleNames = {
        minimal: "极简",
        cyber: "赛博",
        chinese: "国潮",
      };

      const isChinese = params.language === "zh";
      const brandLine = params.brandName
        ? isChinese
          ? `品牌名：${params.brandName}\n`
          : `Brand Name: ${params.brandName}\n`
        : "";
      const extraInfoLine =
        params.extraInfo && params.extraInfo.trim().length > 0
          ? isChinese
            ? `补充信息：${params.extraInfo.trim()}\n`
            : `Additional Info: ${params.extraInfo.trim()}\n`
          : "";

      const prompt = isChinese
        ? `基于以下产品信息，生成${
            platformNames[params.platform]
          }平台的商品文案（${styleNames[params.style]}风格）：

${brandLine}${extraInfoLine}产品类别：${params.product.category}
产品描述：${params.product.analysis.description}
产品规格：${params.product.analysis.specifications.join("、")}

请生成：
1. 商品标题（吸引人，包含关键词）
2. 商品描述（详细，突出卖点，适合${platformNames[params.platform]}平台）
3. 商品规格列表（5条）

以JSON格式返回：
{
  "title": "商品标题",
  "description": "商品描述",
  "specifications": ["规格1", "规格2", "规格3", "规格4", "规格5"]
}`
      : `Generate product copy for ${
            platformNames[params.platform]
          } platform (${styleNames[params.style]} style) based on:

${brandLine}${extraInfoLine}Category: ${params.product.category}
Description: ${params.product.analysis.description}
Specifications: ${params.product.analysis.specifications.join(", ")}

Generate:
1. Product title (attractive, includes keywords)
2. Product description (detailed, highlights selling points, suitable for ${
            platformNames[params.platform]
          })
3. Specification list (5 items)

Return in JSON format:
{
  "title": "Product Title",
  "description": "Product Description",
  "specifications": ["Spec1", "Spec2", "Spec3", "Spec4", "Spec5"]
}`;

      const response = await this.requestGemini<{
        candidates: Array<{
          content: {
            parts: Array<{ text: string }>;
          };
        }>;
      }>("gemini-2.5-flash", [{ parts: [{ text: prompt }] }]);

      const textResponse = response.candidates[0]?.content?.parts[0]?.text;
      if (!textResponse) {
        throw new Error("No response from Gemini");
      }

      let jsonText = textResponse.trim();
      if (jsonText.includes("```json")) {
        jsonText = jsonText.split("```json")[1].split("```")[0].trim();
      } else if (jsonText.includes("```")) {
        jsonText = jsonText.split("```")[1].split("```")[0].trim();
      }

      return JSON.parse(jsonText);
    } catch (error) {
      console.error("Gemini text generation error:", error);
      console.warn("Falling back to mock API");
      return mockAPI.generateText(params);
    }
  }

  /**
   * Generate product image using Gemini Image Generation (Nano Banana)
   */
  async generateImage(params: GenerateImageParams): Promise<string> {
    const apiKey = this.getApiKey();
    const { settings } = useAppStore.getState();

    if (!apiKey) {
      return mockAPI.generateImage(params);
    }

    try {
      // Choose model based on selected NanoBanana variant
      const model =
        settings.selectedModel === "nanabanana"
          ? "gemini-3-pro-image-preview"
          : "gemini-2.5-flash-image";

      // Build prompt with style and platform context
      const stylePrompts = {
        minimal: "极简风格，简洁现代，突出产品本身，干净背景",
        cyber: "赛博风格，科技感强，未来感，炫酷",
        chinese: "国潮风格，传统与现代结合，文化元素",
      };

      const platformPrompts = {
        amazon: "适合Amazon平台，专业产品摄影风格",
        taobao: "适合淘宝平台，营销感强，吸引眼球",
        jd: "适合京东平台，高端品质展示",
      };

      const fullPrompt = `${params.prompt}，${stylePrompts[params.style]}，${
        platformPrompts[params.platform]
      }，高质量产品图片`;

      const response = await this.requestGemini<{
        candidates: Array<{
          content: {
            parts: Array<{
              inlineData?: {
                mimeType: string;
                data: string;
              };
              text?: string;
            }>;
          };
        }>;
      }>(model, [{ parts: [{ text: fullPrompt }] }], {
        generationConfig: {
          responseModalities: ["IMAGE"],
          imageConfig: {
            aspectRatio: params.type === "detail" ? "3:4" : "1:1",
          },
        },
      });

      // Extract image from response
      const parts = response.candidates[0]?.content?.parts;
      if (!parts || parts.length === 0) {
        throw new Error("No image generated");
      }

      // Find image part
      const imagePart = parts.find((part) => part.inlineData);
      if (!imagePart?.inlineData) {
        throw new Error("No image data in response");
      }

      // Convert base64 to data URL
      const imageData = imagePart.inlineData.data;
      const mimeType = imagePart.inlineData.mimeType || "image/png";
      return `data:${mimeType};base64,${imageData}`;
    } catch (error) {
      console.error("Gemini image generation error:", error);
      console.warn("Falling back to mock API");
      return mockAPI.generateImage(params);
    }
  }

  /**
   * Edit existing image with prompt using Gemini Image Generation
   * Directly passes base64 image to Google API
   */
  async editImage(params: EditImageParams): Promise<string> {
    const apiKey = this.getApiKey();
    const { settings } = useAppStore.getState();

    if (!apiKey) {
      console.warn("No API key, using mock API");
      return mockAPI.editImage({
        image: params.image,
        prompt: params.prompt,
      });
    }

    try {
      // Use raw base64 string directly (already extracted)
      const base64Image = params.image;
      const mimeType = params.imageMimeType || "image/jpeg";

      const model =
        settings.selectedModel === "nanabanana"
          ? "gemini-3-pro-image-preview"
          : "gemini-2.5-flash-image";

      console.log("Calling Gemini Image Edit API:", {
        model,
        mimeType,
        promptLength: params.prompt.length,
        imageSize: base64Image.length,
      });
      const geminiURL = this.getGeminiURL();

      // Direct API call to Gemini
      const response = await fetch(
        `${geminiURL}/v1beta/models/${model}:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    inlineData: {
                      mimeType: mimeType,
                      data: base64Image, // Direct base64 string
                    },
                  },
                  { text: params.prompt },
                ],
              },
            ],
            generationConfig: {
              responseModalities: ["IMAGE"],
              imageConfig: {
                aspectRatio: params.prompt.includes("3:4") ? "3:4" : "1:1",
              },
            },
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Gemini API Error:", {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
        });
        throw new Error(
          `Gemini API Error: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      const result = await response.json();
      console.log("Gemini API Response:", result);

      const parts = result.candidates?.[0]?.content?.parts;
      if (!parts || parts.length === 0) {
        throw new Error("No image generated - empty response");
      }

      // Find image part in response
      const imagePart = parts.find((part: any) => part.inlineData);
      if (!imagePart?.inlineData) {
        console.error("Response parts:", parts);
        throw new Error("No image data in response");
      }

      const imageData = imagePart.inlineData.data;
      const responseMimeType = imagePart.inlineData.mimeType || "image/png";

      console.log("Image generated successfully:", {
        mimeType: responseMimeType,
        dataLength: imageData.length,
      });

      return `data:${responseMimeType};base64,${imageData}`;
    } catch (error) {
      console.error("Gemini image edit error:", error);
      console.warn("Falling back to mock API");
      return mockAPI.editImage({
        image: params.image,
        prompt: params.prompt,
      });
    }
  }

  /**
   * Convert File to base64 string
   */
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}

export const api = new NanoBananaAPI();
