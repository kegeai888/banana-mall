# BananaMall 开发与优化记录

> 本文档记录 BananaMall 项目的二次开发、优化修复及经验总结，方便后续维护和迭代。

---

## 目录

- [环境配置](#环境配置)
- [架构优化](#架构优化)
- [功能增强](#功能增强)
- [Bug 修复](#bug-修复)
- [代码规范](#代码规范)
- [待优化项](#待优化项)

---

## 环境配置

### 开发服务器端口调整

**问题**：默认 Vite 端口 1420 在某些环境下可能被占用。

**解决方案**：修改 `vite.config.ts`，将端口调整为 7860。

```typescript
// vite.config.ts
server: {
  port: 7860,      // 从 1420 改为 7860
  host: '0.0.0.0', // 允许外部访问
  strictPort: true,
  // ...
}
```

**影响文件**：`vite.config.ts`

---

## 架构优化

### 1. 混合架构模式

**设计理念**：采用 Tauri 混合架构，支持 Web 和桌面双模式运行。

**实现细节**：

```typescript
// 自动检测运行环境
const isTauri = 'window' in globalThis && '__TAURI__' in window;
```

**双模式支持**：
- `npm run dev` / `npm run build` → 纯 Web 模式（浏览器）
- `npm run tauri:dev` / `npm run tauri:build` → 桌面模式

### 2. 渐进式存储策略

**问题**：不同环境下存储能力不一致。

**解决方案**：实现三级降级存储策略。

```typescript
// src/stores/useAppStore.ts
try {
  if (isTauri) {
    // 1. 优先尝试 Tauri Store (原生能力)
    await tauriStore.set(key, value);
  } else {
    // 2. 降级至 localStorage (Web 兼容)
    localStorage.setItem(key, JSON.stringify(value));
  }
} catch (e) {
  // 3. 最终保障：内存状态
}
```

**优点**：
- 桌面端享受原生存储性能
- Web 端无缝降级
- 失败时仍有内存回退

### 3. Mock 降级模式

**场景**：用户未配置 API Key 时，系统仍需可用。

**实现**：

```typescript
// src/lib/api.ts
async analyzeProduct(imageFile: File): Promise<ProductAnalysis> {
  const apiKey = this.getApiKey();

  if (!apiKey) {
    console.warn("No API key configured, using mock API");
    return mockAPI.analyzeProduct(imageFile);
  }
  // ... 正常 API 调用
}
```

**优点**：
- 新用户可体验完整流程
- API 故障时自动降级
- 便于开发和测试

---

## 功能增强

### 1. 详情页生成模块

**功能**：为电商详情页生成 5 大核心模块内容。

**模块划分**：

| 模块 | 英文名 | 说明 |
|------|--------|------|
| 首屏决策区 | Buy Box | 标题、价格、CTA 按钮 |
| 卖点展示区 | Value Proposition | 痛点、解决方案、可视化建议 |
| 信任背书区 | Social Proof | 评价、销量、认证 |
| 服务保障区 | Service Guarantee | 物流、退货、FAQ |
| 关联推荐区 | Cross-sell | 推荐商品 |

**实现文件**：`src/lib/api-detail.ts`

### 2. 多语言支持

**支持语言**：中文（zh）、英文（en）

**实现位置**：`src/lib/i18n.ts`

### 3. 图片生成双模型

**可选模型**：
- `nanobanana`：gemini-2.5-flash-image（快速生成）
- `nanabanana`：gemini-3-pro-image-preview（高质量）

### 4. 移动端预览

**功能**：内置手机模拟器，实时预览电商页面效果。

**优势**：
- 无需真机即可预览
- 支持不同屏幕尺寸
- 实时编辑即时反馈

---

## Bug 修复

### 1. Base URL 默认值调整

**问题**：原默认值 `https://api.openai-proxy.org` 不符合当前服务环境。

**修复**：修改默认值为 `https://api.kegeai.top`

**位置**：`src/stores/useAppStore.ts:106`

### 2. 设置页面注册链接

**问题**：用户没有 API Key 时缺少获取途径引导。

**修复**：在 API 配置区域添加飞书文档注册链接。

**位置**：`src/pages/SettingsPage.tsx:62-73`

```tsx
<a
  href="https://kege-aigc.feishu.cn/docx/WDXYdMKwFoQrbPxfp7Lcg9OPnBe"
  target="_blank"
  rel="noopener noreferrer"
  className="font-bold text-orange-500 hover:text-orange-600"
>
  没有API KEY【密钥】？点击注册
</a>
```

### 3. Placeholder 一致性

**修复**：Base URL 输入框的 placeholder 与默认值保持一致。

**位置**：`src/pages/SettingsPage.tsx:99`

---

## 代码规范

### 命名约定

| 类型 | 规范 | 示例 |
|------|------|------|
| 组件 | PascalCase | `UploadPage`, `ConfigPage` |
| 函数 | camelCase | `generateText`, `analyzeProduct` |
| 常量 | UPPER_SNAKE_CASE | `TARGET_PORT` |
| 接口/类型 | PascalCase | `ProductAnalysis`, `AppSettings` |

### 文件结构

```
src/
├── components/     # React 组件
│   └── ui/        # Shadcn/UI 组件
├── lib/           # 工具函数和 API
├── pages/         # 页面组件
├── stores/        # Zustand 状态管理
└── hooks/         # 自定义 Hooks
```

### 类型定义

**原则**：所有函数参数和返回值必须有类型注解。

```typescript
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
```

---

## 开发命令

| 命令 | 用途 |
|------|------|
| `npm run dev` | Web 模式开发（端口 7860） |
| `npm run build` | 构建 Web 生产版本 |
| `./start_app.sh` | 一键启动开发服务（自动处理端口占用） |
| `npm run tauri:dev` | 桌面应用开发模式 |
| `npm run tauri:build` | 桌面应用生产构建 |

---

## 关键技术点

### Gemini API 调用

**代理模式**：通过 `/google` 后缀调用 Gemini 模型。

```typescript
private getGeminiURL(): string {
  const baseURL = this.getBaseURL();
  if (baseURL.includes("openai-proxy.org")) {
    return `${baseURL}/google`;
  }
  return baseURL;
}
```

### 图片编辑（Inpainting）

**功能**：基于提示词编辑现有图片。

**实现**：`src/lib/api.ts:367` 的 `editImage` 方法。

### JSON 响应解析

**问题**：Gemini 返回的 JSON 可能被 Markdown 代码块包裹。

**解决方案**：智能清理响应文本。

```typescript
let jsonText = textResponse.trim();
if (jsonText.includes("```json")) {
  jsonText = jsonText.split("```json")[1].split("```")[0].trim();
} else if (jsonText.includes("```")) {
  jsonText = jsonText.split("```")[1].split("```")[0].trim();
}
```

---

## 待优化项

- [ ] 添加单元测试覆盖
- [ ] 优化大图片上传性能
- [ ] 增加批量处理模式
- [ ] 支持更多电商平台（如拼多多、Shopee）
- [ ] 添加图片水印功能
- [ ] 实现导出 PDF 格式
- [ ] 支持自定义图片尺寸
- [ ] 添加 AI 去背景功能

---

## 更新日志

### 2026-01-16

- [修改] Base URL 默认值改为 `https://api.kegeai.top`
- [新增] 设置页面添加 API Key 注册引导链接
- [优化] placeholder 与默认值保持一致

### 历史记录

- 架构设计：Tauri v2 + React + TypeScript 混合架构
- UI 组件：集成 Shadcn/UI 组件库
- 状态管理：采用 Zustand 单例模式
- 主题系统：支持明暗主题切换

---

*最后更新：2026-01-16*
