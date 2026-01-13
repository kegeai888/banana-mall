import type {
  Product,
  Platform,
  Style,
  Language,
  Model,
} from "@/stores/useAppStore";
import { api } from "./api";

export interface DetailPageContent {
  buyBox: {
    title: string;
    price: string;
    originalPrice?: string;
    cta: string;
  };
  valueProposition: {
    painPoints: string[];
    solutions: string[];
    visualizations: string[];
  };
  socialProof: {
    reviews: Array<{ text: string; rating: number }>;
    salesData: string;
    certifications: string[];
  };
  serviceGuarantee: {
    shipping: string;
    returnPolicy: string;
    faq: Array<{ question: string; answer: string }>;
  };
  crossSell: {
    recommendations: string[];
  };
}

/**
 * Generate detail page content with 5 core modules using AI
 */
export async function generateDetailPage(
  product: Product,
  platform: Platform,
  style: Style,
  language: Language,
  model: Model,
  brandName?: string,
  extraInfo?: string
): Promise<DetailPageContent> {
  const isChinese = language === "zh";

  // Check if API key is available
  const { useAppStore } = await import("@/stores/useAppStore");
  const apiKey = useAppStore.getState().settings.apiKey;

  if (!apiKey) {
    // Fallback to mock data if no API key
    console.warn("No API key, using mock detail page content");
    return getMockDetailPage(product, style, isChinese, brandName);
  }

  try {
    // Use Gemini API to generate detail page content
    const brandLine = brandName
      ? isChinese
        ? `品牌名：${brandName}\n`
        : `Brand Name: ${brandName}\n`
      : "";
    const extraInfoLine =
      extraInfo && extraInfo.trim().length > 0
        ? isChinese
          ? `补充信息：${extraInfo.trim()}\n`
          : `Additional Info: ${extraInfo.trim()}\n`
        : "";

    const prompt = isChinese
      ? `请为以下产品生成完整的电商详情页内容（5大核心模块）：

${brandLine}${extraInfoLine}产品类别：${product.category}
产品描述：${product.analysis?.description || ""}
产品规格：${product.analysis?.specifications?.join(", ") || ""}

目标平台：${
          platform === "amazon"
            ? "Amazon（跨境电商）"
            : platform === "taobao"
            ? "淘宝（国内电商）"
            : "京东（高端电商）"
        }
风格：${
          style === "minimal"
            ? "极简风格"
            : style === "cyber"
            ? "赛博风格"
            : "国潮风格"
        }

请生成以下5大核心模块的详细内容，以JSON格式返回：

1. 首屏决策区（Buy Box）：
   - title: 商品标题（包含品牌、核心关键词、属性、场景）
   - price: 当前价格
   - originalPrice: 原价（可选）
   - cta: 行动按钮文字

2. 卖点展示区（Value Proposition）：
   - painPoints: 用户痛点数组（3-5条）
   - solutions: 产品解决方案数组（3-5条）
   - visualizations: 可视化展示建议数组（3条）

3. 信任背书区（Social Proof）：
   - reviews: 用户评价数组，每个包含text（评价内容）和rating（评分1-5）
   - salesData: 销量数据描述
   - certifications: 认证证书数组

4. 服务保障区（Service & Guarantee）：
   - shipping: 物流政策描述
   - returnPolicy: 退换货政策描述
   - faq: 常见问题数组，每个包含question和answer

5. 关联推荐区（Cross-sell）：
   - recommendations: 推荐商品数组（3-5条）

请确保内容真实、吸引人，符合${
          platform === "amazon"
            ? "Amazon"
            : platform === "taobao"
            ? "淘宝"
            : "京东"
        }平台的风格特点。返回纯JSON格式，不要包含markdown代码块。`
      : `Please generate complete e-commerce detail page content (5 core modules) for the following product:

${brandLine}${extraInfoLine}Product Category: ${product.category}
Product Description: ${product.analysis?.description || ""}
Product Specifications: ${product.analysis?.specifications?.join(", ") || ""}

Target Platform: ${
          platform === "amazon"
            ? "Amazon (Cross-border)"
            : platform === "taobao"
            ? "Taobao (Domestic)"
            : "JD (Premium)"
        }
Style: ${
          style === "minimal"
            ? "Minimal"
            : style === "cyber"
            ? "Cyber"
            : "Chinese Traditional"
        }

Please generate detailed content for the following 5 core modules, return in JSON format:

1. Buy Box:
   - title: Product title (include brand, core keywords, attributes, scene)
   - price: Current price
   - originalPrice: Original price (optional)
   - cta: Call-to-action button text

2. Value Proposition:
   - painPoints: Array of user pain points (3-5 items)
   - solutions: Array of product solutions (3-5 items)
   - visualizations: Array of visualization suggestions (3 items)

3. Social Proof:
   - reviews: Array of user reviews, each with text (review content) and rating (1-5)
   - salesData: Sales data description
   - certifications: Array of certifications

4. Service & Guarantee:
   - shipping: Shipping policy description
   - returnPolicy: Return policy description
   - faq: Array of FAQs, each with question and answer

5. Cross-sell:
   - recommendations: Array of recommended products (3-5 items)

Ensure content is authentic, attractive, and matches the style of ${
          platform === "amazon"
            ? "Amazon"
            : platform === "taobao"
            ? "Taobao"
            : "JD"
        } platform. Return pure JSON format, do not include markdown code blocks.`;

    // Call Gemini API
    const response = await (api as any).requestGemini(
      model === "nanobanana"
        ? "gemini-2.5-flash"
        : "gemini-3-pro-image-preview",
      [
        {
          parts: [{ text: prompt }],
        },
      ],
      {
        generationConfig: {
          responseMimeType: "application/json",
        },
      }
    );

    // Parse JSON response
    const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error("No response from API");
    }

    // Clean JSON string (remove markdown code blocks if any)
    let jsonText = text.trim();
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/^```json\n?/, "").replace(/\n?```$/, "");
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/^```\n?/, "").replace(/\n?```$/, "");
    }

    const generatedContent = JSON.parse(jsonText) as DetailPageContent;

    // Validate and return
    return {
      buyBox:
        generatedContent.buyBox ||
        getMockDetailPage(product, style, isChinese, brandName).buyBox,
      valueProposition:
        generatedContent.valueProposition ||
        getMockDetailPage(product, style, isChinese, brandName).valueProposition,
      socialProof:
        generatedContent.socialProof ||
        getMockDetailPage(product, style, isChinese, brandName).socialProof,
      serviceGuarantee:
        generatedContent.serviceGuarantee ||
        getMockDetailPage(product, style, isChinese, brandName).serviceGuarantee,
      crossSell:
        generatedContent.crossSell ||
        getMockDetailPage(product, style, isChinese, brandName).crossSell,
    };
  } catch (error) {
    console.error("Error generating detail page content:", error);
    console.warn("Falling back to mock data");
    return getMockDetailPage(product, style, isChinese);
  }
}

/**
 * Get mock detail page content as fallback
 */
function getMockDetailPage(
  product: Product,
  style: Style,
  isChinese: boolean,
  brandName?: string
): DetailPageContent {
  return {
    buyBox: {
      title: isChinese
        ? `${brandName ? brandName + " " : ""}${product.category} - 高品质${
            style === "minimal" ? "极简" : style === "cyber" ? "赛博" : "国潮"
          }风格`
        : `${brandName ? brandName + " " : ""}${product.category} - High Quality`,
      price: isChinese ? "¥299" : "$29.99",
      originalPrice: isChinese ? "¥399" : "$39.99",
      cta: isChinese ? "立即购买" : "Buy Now",
    },
    valueProposition: {
      painPoints: isChinese
        ? ["痛点1", "痛点2", "痛点3"]
        : ["Pain Point 1", "Pain Point 2", "Pain Point 3"],
      solutions: isChinese
        ? ["解决方案1", "解决方案2", "解决方案3"]
        : ["Solution 1", "Solution 2", "Solution 3"],
      visualizations: isChinese
        ? ["可视化1", "可视化2", "可视化3"]
        : ["Visualization 1", "Visualization 2", "Visualization 3"],
    },
    socialProof: {
      reviews: [
        { text: isChinese ? "很好用！" : "Great product!", rating: 5 },
        { text: isChinese ? "质量不错" : "Good quality", rating: 4 },
        { text: isChinese ? "值得推荐" : "Worth recommending", rating: 5 },
      ],
      salesData: isChinese ? "月销1000+" : "1000+ sold this month",
      certifications: isChinese
        ? ["质检认证", "专利证书"]
        : ["Quality Certification", "Patent Certificate"],
    },
    serviceGuarantee: {
      shipping: isChinese
        ? "全国包邮，3-5天送达"
        : "Free shipping, 3-5 days delivery",
      returnPolicy: isChinese ? "7天无理由退换货" : "7-day return policy",
      faq: [
        {
          question: isChinese ? "如何清洗？" : "How to clean?",
          answer: isChinese ? "可用清水清洗" : "Can be cleaned with water",
        },
        {
          question: isChinese ? "是否包邮？" : "Is shipping free?",
          answer: isChinese
            ? "是的，全国包邮"
            : "Yes, free shipping nationwide",
        },
        {
          question: isChinese ? "质保多久？" : "Warranty period?",
          answer: isChinese ? "1年质保" : "1 year warranty",
        },
      ],
    },
    crossSell: {
      recommendations: isChinese
        ? ["推荐商品1", "推荐商品2", "推荐商品3"]
        : [
            "Recommended Product 1",
            "Recommended Product 2",
            "Recommended Product 3",
          ],
    },
  };
}
