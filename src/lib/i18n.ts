export type Language = 'zh' | 'en';

export interface Translations {
  // Common
  common: {
    save: string;
    cancel: string;
    back: string;
    next: string;
    confirm: string;
    loading: string;
    error: string;
    success: string;
  };
  
  // Upload Page
  upload: {
    title: string;
    description: string;
    dragDrop: string;
    clickUpload: string;
    fileFormat: string;
    analyzing: string;
    uploadError: string;
  };
  
  // Config Page
  config: {
    title: string;
    description: string;
    platform: string;
    platformDesc: string;
    style: string;
    styleDesc: string;
    model: string;
    modelDesc: string;
    language: string;
    languageDesc: string;
    brand: string;
    brandDesc: string;
    brandPlaceholder: string;
    extraInfo: string;
    extraInfoDesc: string;
    extraInfoPlaceholder: string;
    productAnalysis: string;
    category: string;
    suggestions: string;
    startGenerate: string;
    imageCount: string;
    imageCountDesc: string;
    mainImageCount: string;
    mainImageCountDesc: string;
    detailImageCount: string;
    detailImageCountDesc: string;
  };
  
  // Generating Page
  generating: {
    title: string;
    initializing: string;
    generatingText: string;
    generatingImages: string;
    generatingDetail: string;
    generatingDetailImages: string;
    complete: string;
    cancel: string;
  };
  
  // Editor Page
  editor: {
    title: string;
    export: string;
    mainImages: string;
    detailPage: string;
    detailPageDesc: string;
    specifications: string;
    textEdit: string;
    imageEdit: string;
    productTitle: string;
    productDescription: string;
    productSpecs: string;
    imageRedraw: string;
    imageRedrawDesc: string;
    prompt: string;
    regenerate: string;
    regenerating: string;
    clickToEdit: string;
    buyBox: string;
    valueProposition: string;
    socialProof: string;
    serviceGuarantee: string;
    crossSell: string;
    painPoints: string;
    solutions: string;
    reviews: string;
    shipping: string;
    returnPolicy: string;
    faq: string;
    recommendations: string;
    detailImages: string;
    exportFailed: string;
  };
  
  // Settings Page
  settings: {
    title: string;
    description: string;
    apiConfig: string;
    apiConfigDesc: string;
    apiKey: string;
    baseURL: string;
    baseURLDesc: string;
    preferences: string;
    preferencesDesc: string;
    defaultPlatform: string;
    defaultStyle: string;
    theme: string;
    themeDesc: string;
    light: string;
    dark: string;
    system: string;
    saveSettings: string;
    saving: string;
    reset: string;
    saved: string;
    saveFailed: string;
  };
  
  // Platforms
  platforms: {
    amazon: string;
    amazonDesc: string;
    taobao: string;
    taobaoDesc: string;
    jd: string;
    jdDesc: string;
  };
  
  // Styles
  styles: {
    minimal: string;
    minimalDesc: string;
    cyber: string;
    cyberDesc: string;
    chinese: string;
    chineseDesc: string;
  };
  
  // Models
  models: {
    nanobanana: string;
    nanobananaDesc: string;
    nanabanana: string;
    nanabananaDesc: string;
  };
}

const translations: Record<Language, Translations> = {
  zh: {
    common: {
      save: '保存',
      cancel: '取消',
      back: '返回',
      next: '下一步',
      confirm: '确认',
      loading: '加载中...',
      error: '错误',
      success: '成功',
    },
    upload: {
      title: '上传产品图片',
      description: '上传一张产品白底图，AI 将自动分析产品信息',
      dragDrop: '拖拽图片到这里，或点击上传',
      clickUpload: '选择文件',
      fileFormat: '支持 JPG、PNG 格式，建议使用白底图',
      analyzing: '正在分析产品...',
      uploadError: '请上传图片文件',
    },
    config: {
      title: '选择配置',
      description: '选择目标平台和详情页风格',
      platform: '目标平台',
      platformDesc: '选择产品要上架的平台',
      style: '详情页风格',
      styleDesc: '选择你喜欢的详情页风格模板',
      model: 'AI 模型',
      modelDesc: '选择使用的图片生成模型',
      language: '语言',
      languageDesc: '选择生成内容的语言',
      brand: '品牌名称（可选）',
      brandDesc: '如果有自己的品牌，可以在这里填写，AI 会在文案和部分图片中适当加入品牌信息',
      brandPlaceholder: '例如：灵矩绘境 / MatrixInspire',
      extraInfo: '产品补充信息 / 规格说明',
      extraInfoDesc: '可填写材质、适用人群、使用场景、卖点补充等信息，AI 会在文案和图片风格中参考这些内容',
      extraInfoPlaceholder: '例如：食品级硅胶；适合婴幼儿使用；适合夏季户外露营；主打轻便和高颜值设计',
      productAnalysis: '产品分析结果',
      category: '产品类别',
      suggestions: '上架建议',
      startGenerate: '开始生成',
      imageCount: '图片数量设置',
      imageCountDesc: '设置生成的主图和详情页图片数量',
      mainImageCount: '主图数量',
      mainImageCountDesc: '生成的主图数量（1-10张）',
      detailImageCount: '详情页图片数量',
      detailImageCountDesc: '生成的详情页图片数量（1-5张）',
    },
    generating: {
      title: '正在生成详情页',
      initializing: '正在初始化...',
      generatingText: '正在生成商品文案...',
      generatingImages: '正在生成主图（基于上传图片）...',
      generatingDetail: '正在生成详情页内容...',
      generatingDetailImages: '正在生成详情页图片（3:4比例）...',
      complete: '生成完成！',
      cancel: '取消生成',
    },
    editor: {
      title: '编辑详情页',
      export: '导出',
      mainImages: '主图',
      detailPage: '详情页 - 5大核心模块',
      detailPageDesc: '3:4比例，移动端优化',
      specifications: '商品规格',
      textEdit: '文本编辑',
      imageEdit: '图片编辑',
      productTitle: '商品标题',
      productDescription: '商品描述',
      productSpecs: '商品规格',
      imageRedraw: '图片重绘',
      imageRedrawDesc: '通过提示词调整图片效果',
      prompt: '提示词',
      regenerate: '重新生成',
      regenerating: '生成中...',
      clickToEdit: '点击预览区域的图片开始编辑',
      exportFailed: '导出失败，请重试',
      buyBox: '1. 首屏决策区',
      valueProposition: '2. 卖点展示区',
      socialProof: '3. 信任背书区',
      serviceGuarantee: '4. 服务保障区',
      crossSell: '5. 关联推荐区',
      painPoints: '痛点：',
      solutions: '解决方案：',
      reviews: '用户评价：',
      shipping: '物流：',
      returnPolicy: '退换货：',
      faq: '常见问题：',
      recommendations: '推荐商品',
      detailImages: '详情页图片（3:4比例）',
    },
    settings: {
      title: '设置',
      description: '配置 API 和偏好设置',
      apiConfig: 'API 配置',
      apiConfigDesc: '配置 Gemini API 密钥和代理服务器地址',
      apiKey: 'API Key',
      baseURL: 'Base URL',
      baseURLDesc: '代理API地址，用于访问Gemini模型。默认: https://api.openai-proxy.org\n注意：Gemini会通过 /google 后缀自动访问',
      preferences: '偏好设置',
      preferencesDesc: '设置默认平台和风格',
      defaultPlatform: '默认平台',
      defaultStyle: '默认风格',
      theme: '主题',
      themeDesc: '选择应用主题',
      light: '浅色',
      dark: '深色',
      system: '跟随系统',
      saveSettings: '保存设置',
      saving: '保存中...',
      reset: '重置',
      saved: '设置已保存',
      saveFailed: '保存失败，请重试',
    },
    platforms: {
      amazon: 'Amazon',
      amazonDesc: '适合跨境电商，注重产品细节',
      taobao: '淘宝',
      taobaoDesc: '适合国内电商，注重营销文案',
      jd: '京东',
      jdDesc: '适合高端产品，注重品质展示',
    },
    styles: {
      minimal: '极简风格',
      minimalDesc: '简洁现代，突出产品本身',
      cyber: '赛博风格',
      cyberDesc: '科技感强，适合电子产品',
      chinese: '国潮风格',
      chineseDesc: '传统与现代结合，适合国货',
    },
    models: {
      nanobanana: 'NanoBanana',
      nanobananaDesc: 'Gemini 2.5 Flash Image - 快速生成',
      nanabanana: 'NanaBanana',
      nanabananaDesc: 'Gemini 3 Pro Image - 高质量生成',
    },
  },
  en: {
    common: {
      save: 'Save',
      cancel: 'Cancel',
      back: 'Back',
      next: 'Next',
      confirm: 'Confirm',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
    },
    upload: {
      title: 'Upload Product Image',
      description: 'Upload a white background product image, AI will automatically analyze product information',
      dragDrop: 'Drag and drop image here, or click to upload',
      clickUpload: 'Select File',
      fileFormat: 'Supports JPG, PNG format, white background recommended',
      analyzing: 'Analyzing product...',
      uploadError: 'Please upload an image file',
    },
    config: {
      title: 'Select Configuration',
      description: 'Select target platform and detail page style',
      platform: 'Target Platform',
      platformDesc: 'Select the platform for your product',
      style: 'Detail Page Style',
      styleDesc: 'Select your preferred detail page style template',
      model: 'AI Model',
      modelDesc: 'Select the image generation model to use',
      language: 'Language',
      languageDesc: 'Select the language for generated content',
      brand: 'Brand Name (Optional)',
      brandDesc: 'If you have your own brand, fill it here and AI will insert it into copy and some images when appropriate',
      brandPlaceholder: 'e.g. 灵矩绘境 / MatrixInspire',
      extraInfo: 'Additional Product Info / Specs',
      extraInfoDesc: 'You can add material, target audience, usage scenarios, extra selling points, etc. AI will reference this when generating copy and image styles',
      extraInfoPlaceholder: 'e.g. Food-grade silicone; suitable for babies; ideal for summer outdoor camping; focuses on lightweight and stylish design',
      productAnalysis: 'Product Analysis Result',
      category: 'Product Category',
      suggestions: 'Listing Suggestions',
      startGenerate: 'Start Generation',
      imageCount: 'Image Count Settings',
      imageCountDesc: 'Set the number of main images and detail page images to generate',
      mainImageCount: 'Main Image Count',
      mainImageCountDesc: 'Number of main images to generate (1-10)',
      detailImageCount: 'Detail Image Count',
      detailImageCountDesc: 'Number of detail page images to generate (1-5)',
    },
    generating: {
      title: 'Generating Detail Page',
      initializing: 'Initializing...',
      generatingText: 'Generating product copy...',
      generatingImages: 'Generating main images (based on uploaded image)...',
      generatingDetail: 'Generating detail page content...',
      generatingDetailImages: 'Generating detail page images (3:4 ratio)...',
      complete: 'Generation complete!',
      cancel: 'Cancel Generation',
    },
    editor: {
      title: 'Edit Detail Page',
      export: 'Export',
      mainImages: 'Main Images',
      detailPage: 'Detail Page - 5 Core Modules',
      detailPageDesc: '3:4 ratio, mobile optimized',
      specifications: 'Product Specifications',
      textEdit: 'Text Edit',
      imageEdit: 'Image Edit',
      productTitle: 'Product Title',
      productDescription: 'Product Description',
      productSpecs: 'Product Specifications',
      imageRedraw: 'Image Redraw',
      imageRedrawDesc: 'Adjust image effect through prompts',
      prompt: 'Prompt',
      regenerate: 'Regenerate',
      regenerating: 'Generating...',
      clickToEdit: 'Click on images in preview area to start editing',
      exportFailed: 'Export failed, please try again',
      buyBox: '1. Buy Box',
      valueProposition: '2. Value Proposition',
      socialProof: '3. Social Proof',
      serviceGuarantee: '4. Service & Guarantee',
      crossSell: '5. Cross-sell',
      painPoints: 'Pain Points:',
      solutions: 'Solutions:',
      reviews: 'Reviews:',
      shipping: 'Shipping:',
      returnPolicy: 'Return Policy:',
      faq: 'FAQ:',
      recommendations: 'Recommendations',
      detailImages: 'Detail Page Images (3:4 Ratio)',
    },
    settings: {
      title: 'Settings',
      description: 'Configure API and preferences',
      apiConfig: 'API Configuration',
      apiConfigDesc: 'Configure Gemini API key and proxy server address',
      apiKey: 'API Key',
      baseURL: 'Base URL',
      baseURLDesc: 'Proxy API address for accessing Gemini models. Default: https://api.openai-proxy.org\nNote: Gemini will be accessed via /google suffix automatically',
      preferences: 'Preferences',
      preferencesDesc: 'Set default platform and style',
      defaultPlatform: 'Default Platform',
      defaultStyle: 'Default Style',
      theme: 'Theme',
      themeDesc: 'Select application theme',
      light: 'Light',
      dark: 'Dark',
      system: 'System',
      saveSettings: 'Save Settings',
      saving: 'Saving...',
      reset: 'Reset',
      saved: 'Settings saved',
      saveFailed: 'Save failed, please try again',
    },
    platforms: {
      amazon: 'Amazon',
      amazonDesc: 'Suitable for cross-border e-commerce, focus on product details',
      taobao: 'Taobao',
      taobaoDesc: 'Suitable for domestic e-commerce, focus on marketing copy',
      jd: 'JD',
      jdDesc: 'Suitable for high-end products, focus on quality display',
    },
    styles: {
      minimal: 'Minimal Style',
      minimalDesc: 'Simple and modern, highlight the product itself',
      cyber: 'Cyber Style',
      cyberDesc: 'Strong tech feel, suitable for electronic products',
      chinese: 'Chinese Traditional Style',
      chineseDesc: 'Combination of traditional and modern, suitable for Chinese products',
    },
    models: {
      nanobanana: 'NanoBanana',
      nanobananaDesc: 'Gemini 2.5 Flash Image - Fast generation',
      nanabanana: 'NanaBanana',
      nanabananaDesc: 'Gemini 3 Pro Image - High quality generation',
    },
  },
};

let currentLanguage: Language = 'zh';

export function setLanguage(lang: Language) {
  currentLanguage = lang;
  // Update document language attribute
  document.documentElement.lang = lang;
}

export function getLanguage(): Language {
  return currentLanguage;
}

export function t(): Translations {
  return translations[currentLanguage];
}

// Helper function for easy access
export const useTranslation = () => {
  return t();
};
