## BananaMall

AI-powered e-commerce detail page generator built with Tauri v2 + React + TypeScript.

### 项目概述（中文）

**BananaMall** 是一个 AI 驱动的电商详情页生成工具：上传产品白底图，选择平台/风格/模型/语言，系统自动完成**产品分析、文案生成、主图与详情页图片生成、详情页五大核心模块生成**，并提供接近购物 App 的可视化编辑与预览（含移动端模拟器、历史记录与导出能力）。

### 🚀 Quick Start

#### Prerequisites

- Node.js 18+ and npm
- Rust (latest stable version)
- [Tauri prerequisites](https://tauri.app/v1/guides/getting-started/prerequisites)

#### Installation

1. Install dependencies:
```bash
npm install
```

2. Install additional Tailwind plugin:
```bash
npm install -D tailwindcss-animate
```

3. Initialize Shadcn/UI (run this command):
```bash
npx shadcn@latest init
```
When prompted:
- ✅ Would you like to use TypeScript? Yes
- ✅ Which style would you like to use? Default
- ✅ Which base color would you like to use? Zinc
- ✅ Where is your global CSS file? src/index.css
- ✅ Would you like to use CSS variables for colors? Yes
- ✅ Where is your tailwind.config.js located? tailwind.config.js
- ✅ Configure the import alias for components? @/components
- ✅ Configure the import alias for utils? @/lib/utils

#### Development

Run the development server:
```bash
npm run tauri:dev
```

#### Build

Build for production:
```bash
npm run tauri:build
```

## 📁 Project Structure

```
banana-mall/
├── src/
│   ├── components/     # React components
│   ├── lib/           # Utilities
│   ├── stores/        # Zustand stores
│   ├── hooks/         # Custom hooks
│   ├── App.tsx        # Main app component
│   ├── main.tsx       # Entry point
│   └── index.css      # Global styles
├── src-tauri/         # Tauri backend (Rust)
└── public/            # Static assets
```

## 🎨 Design System

- **Color Scheme**: Zinc (light/dark mode support)
- **Typography**: Inter font family
- **Style**: Vercel/Next.js inspired minimal design
- **Components**: Shadcn/UI based

## 📦 Key Dependencies

- **Tauri v2**: Desktop app framework
- **React 18**: UI library
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **Shadcn/UI**: Component library
- **Zustand**: State management
- **Lucide React**: Icons

## 🔧 Configuration

### API Configuration

The app supports custom API endpoints for proxy support. Configure in Settings.

### Store Plugin

Uses `tauri-plugin-store` for persistent storage of:
- API keys
- User preferences
- App settings

## 📝 License

MIT (as per initial open-source requirement)
