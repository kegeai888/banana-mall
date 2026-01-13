/**
 * Mock API for development/testing
 * Replace api calls with this when NanoBanana API is not available
 */

import type { ProductAnalysis, Platform, Style } from "@/stores/useAppStore";

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockAPI = {
  async analyzeProduct(_file: File): Promise<ProductAnalysis> {
    await delay(1500);
    
    // Mock analysis based on file name or random
    const categories = ["电子产品", "服装", "家居用品", "美妆", "食品"];
    const suggestions = [
      "建议突出产品的主要功能特点",
      "使用高质量的产品图片",
      "添加详细的产品规格说明",
      "包含用户评价和使用场景",
    ];
    const descriptions = [
      "这是一款高品质的产品，采用先进技术制造，具有出色的性能和耐用性。",
      "精心设计的产品，注重细节和用户体验，适合日常使用。",
      "专业级产品，满足高标准要求，是您理想的选择。",
    ];
    const specifications = [
      "材质：优质材料",
      "尺寸：标准规格",
      "重量：轻便设计",
      "颜色：多种可选",
      "包装：精美包装",
    ];

    return {
      category: categories[Math.floor(Math.random() * categories.length)],
      suggestions,
      description: descriptions[Math.floor(Math.random() * descriptions.length)],
      specifications,
    };
  },

  async generateText(params: {
    product: {
      category: string;
      tags: string[];
      analysis: ProductAnalysis;
    };
    platform: Platform;
    style: Style;
  }): Promise<{
    title: string;
    description: string;
    specifications: string[];
  }> {
    await delay(2000);

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

    return {
      title: `${params.product.analysis.category} - ${styleNames[params.style]}风格 ${platformNames[params.platform]}专供`,
      description: `${params.product.analysis.description}\n\n${params.product.analysis.suggestions.join("\n")}`,
      specifications: params.product.analysis.specifications,
    };
  },

  async generateImage(params: {
    prompt: string;
    style: Style;
    platform: Platform;
    type?: "main" | "detail" | "scene";
  }): Promise<string> {
    await delay(3000);

    // Return a placeholder image URL
    // In production, this would be the actual generated image URL
    const width = params.type === "detail" ? 800 : 600;
    const height = params.type === "detail" ? 1200 : 600;
    
    return `https://via.placeholder.com/${width}x${height}?text=${encodeURIComponent(
      params.prompt.substring(0, 20)
    )}`;
  },

  async editImage(params: {
    image: string;
    prompt?: string;
    imageMimeType?: string;
    mask?: string;
  }): Promise<string> {
    await delay(3000);

    // Return a modified placeholder
    const promptText = params.prompt || 'Edited image';
    return `https://via.placeholder.com/600x600?text=${encodeURIComponent(
      `Edited: ${promptText.substring(0, 15)}`
    )}`;
  },
};
