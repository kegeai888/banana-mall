import { create } from "zustand";
import { Store } from "@tauri-apps/plugin-store";

// Types
export type Platform = "amazon" | "taobao" | "jd";
export type Style = "minimal" | "cyber" | "chinese";
export type Model = "nanobanana" | "nanabanana";
export type Language = "zh" | "en";

export interface Product {
  id: string;
  image: string; // base64 data URL
  imageBase64: string; // raw base64 for API calls
  imageMimeType: string; // image mime type
  category: string;
  tags: string[];
  analysis?: ProductAnalysis;
}

export interface ProductAnalysis {
  category: string;
  suggestions: string[];
  description: string;
  specifications: string[];
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  type: "main" | "detail" | "scene";
}

export interface GeneratedContent {
  product: Product;
  platform: Platform;
  style: Style;
  model: Model;
  language: Language;
  brandName?: string;
  images: GeneratedImage[];
  texts: {
    title: string;
    description: string;
    specifications: string[];
  };
  detailPage: {
    buyBox: any;
    valueProposition: any;
    socialProof: any;
    serviceGuarantee: any;
    crossSell: any;
  };
}

export interface GenerationHistory extends GeneratedContent {
  id: string;
  createdAt: number; // timestamp
}

export interface AppSettings {
  apiKey: string;
  baseURL: string;
  defaultPlatform: Platform;
  defaultStyle: Style;
  exportPath: string;
  selectedModel: Model;
  selectedLanguage: Language;
  theme: "light" | "dark" | "system";
  mainImageCount: number; // 主图数量
  detailImageCount: number; // 详情页图片数量
  brandName: string; // 品牌名称（可选，由用户输入）
  extraInfo: string; // 产品补充信息 / 规格说明（可选）
}

interface AppState {
  // Current step in the workflow
  currentStep: "upload" | "config" | "generating" | "editing" | "settings" | "history";

  // Product data
  product: Product | null;

  // Generated content
  generatedContent: GeneratedContent | null;

  // History records
  histories: GenerationHistory[];

  // Settings
  settings: AppSettings;

  // Store instance (will be initialized)
  store: Store | null;

  // Actions
  setCurrentStep: (step: AppState["currentStep"]) => void;
  setProduct: (product: Product | null) => void;
  setGeneratedContent: (content: GeneratedContent | null) => void;
  addHistory: (content: GeneratedContent) => Promise<void>;
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
  initializeStore: (store: Store) => void;
}

const defaultSettings: AppSettings = {
  apiKey: "",
  baseURL: "https://api.kegeai.top",
  defaultPlatform: "amazon",
  defaultStyle: "minimal",
  exportPath: "",
  selectedModel: "nanobanana",
  selectedLanguage: "zh",
  theme: "system",
  mainImageCount: 5, // 默认5张主图
  detailImageCount: 2, // 默认2张详情页图片
  brandName: "",
  extraInfo: "",
};

export const useAppStore = create<AppState>((set, get) => ({
  currentStep: "upload",
  product: null,
  generatedContent: null,
  histories: [],
  settings: defaultSettings,
  store: null,

  setCurrentStep: (step) => set({ currentStep: step }),

  setProduct: (product) => set({ product }),

  setGeneratedContent: (content) => {
    set({ generatedContent: content });

    // Persist current generated content for later reload
    const { store } = get();
    if (store) {
      store.set("generatedContent", content);
      // fire-and-forget; no await in setter
      store.save().catch((e) =>
        console.warn("Failed to persist generatedContent to store", e)
      );
    }

    // Fallback persist for web
    if (typeof window !== "undefined") {
      try {
        if (content) {
          window.localStorage.setItem(
            "bananaMallGeneratedContent",
            JSON.stringify(content)
          );
        } else {
          window.localStorage.removeItem("bananaMallGeneratedContent");
        }
      } catch (e) {
        console.warn("Failed to persist generatedContent to localStorage", e);
      }
    }
  },

  initializeStore: async (store) => {
    set({ store });
    // Load settings from store
    const savedSettings = await store.get<AppSettings>("settings");
    const savedHistories = await store.get<GenerationHistory[]>("histories");
    const savedGenerated = await store.get<GeneratedContent>("generatedContent");
    if (savedSettings) {
      set({ settings: { ...defaultSettings, ...savedSettings } });
    }
    if (savedHistories) {
      set({ histories: savedHistories });
    }
    if (savedGenerated) {
      set({ generatedContent: savedGenerated });
    }
  },

  addHistory: async (content) => {
    const { store, histories } = get();
    const entry: GenerationHistory = {
      ...content,
      id: `hist-${Date.now()}`,
      createdAt: Date.now(),
    };
    const updated = [entry, ...histories].slice(0, 20); // keep last 20
    set({ histories: updated });
    if (store) {
      await store.set("histories", updated);
      await store.save();
    }
    // Fallback: persist to localStorage for web environment
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(
          "bananaMallHistories",
          JSON.stringify(updated)
        );
      } catch (e) {
        console.warn("Failed to persist histories to localStorage", e);
      }
    }
  },

  updateSettings: async (newSettings) => {
    const { store, settings } = get();
    const updatedSettings = { ...settings, ...newSettings };
    set({ settings: updatedSettings });

    // Persist to store
    if (store) {
      await store.set("settings", updatedSettings);
      await store.save();
    }

    // Fallback: persist to localStorage for web environment
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(
          "bananaMallSettings",
          JSON.stringify(updatedSettings)
        );
      } catch (e) {
        console.warn("Failed to persist settings to localStorage", e);
      }
    }
  },
}));

// Fallback hydration for web (no Tauri store)
if (typeof window !== "undefined") {
  try {
    const savedSettings = window.localStorage.getItem("bananaMallSettings");
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings) as AppSettings;
      useAppStore.setState((state) => ({
        settings: { ...state.settings, ...parsed },
      }));
    }

    const savedHistories = window.localStorage.getItem("bananaMallHistories");
    if (savedHistories) {
      const parsed = JSON.parse(savedHistories) as GenerationHistory[];
      useAppStore.setState({ histories: parsed });
    }

    const savedGenerated = window.localStorage.getItem("bananaMallGeneratedContent");
    if (savedGenerated) {
      const parsed = JSON.parse(savedGenerated) as GeneratedContent;
      useAppStore.setState({ generatedContent: parsed });
    }
  } catch (e) {
    console.warn("Failed to hydrate from localStorage", e);
  }
}
