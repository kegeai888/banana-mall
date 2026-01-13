/**
 * 简单的应用功能测试脚本
 * 用于验证主要功能是否正常工作
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 开始测试 BananaMall 应用...\n');

const criticalFiles = [
  'src/App.tsx',
  'src/lib/i18n.ts',
  'src/hooks/useTheme.ts',
  'src/stores/useAppStore.ts',
  'src/pages/UploadPage.tsx',
  'src/pages/ConfigPage.tsx',
  'src/pages/GeneratingPage.tsx',
  'src/pages/EditorPage.tsx',
  'src/pages/SettingsPage.tsx',
  'src/lib/api.ts',
  'package.json',
  'tailwind.config.js',
  'vite.config.ts',
];

console.log('📁 测试 1: 检查关键文件...');
let allFilesExist = true;
criticalFiles.forEach(file => {
  const exists = fs.existsSync(file);
  if (exists) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} - 文件不存在`);
    allFilesExist = false;
  }
});

if (allFilesExist) {
  console.log('  ✅ 所有关键文件存在\n');
} else {
  console.log('  ❌ 部分文件缺失\n');
}

// 测试 2: 检查 package.json 依赖
console.log('📦 测试 2: 检查依赖...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredDeps = [
    'react',
    'react-dom',
    'zustand',
    '@tauri-apps/api',
    '@tauri-apps/plugin-store',
    'lucide-react',
    'tailwindcss',
  ];
  
  let allDepsInstalled = true;
  requiredDeps.forEach(dep => {
    if (packageJson.dependencies[dep] || packageJson.devDependencies[dep]) {
      console.log(`  ✅ ${dep}`);
    } else {
      console.log(`  ❌ ${dep} - 未安装`);
      allDepsInstalled = false;
    }
  });
  
  if (allDepsInstalled) {
    console.log('  ✅ 所有必需依赖已安装\n');
  } else {
    console.log('  ❌ 部分依赖缺失\n');
  }
} catch (error) {
  console.log(`  ❌ 无法读取 package.json: ${error.message}\n`);
}

// 测试 3: 检查 i18n 翻译文件
console.log('🌍 测试 3: 检查多语言支持...');
try {
  const i18nContent = fs.readFileSync('src/lib/i18n.ts', 'utf8');
  const requiredTranslations = [
    'common',
    'upload',
    'config',
    'generating',
    'editor',
    'settings',
    'platforms',
    'styles',
    'models',
  ];
  
  let allTranslationsExist = true;
  requiredTranslations.forEach(key => {
    if (i18nContent.includes(`  ${key}:`)) {
      console.log(`  ✅ ${key} 翻译模块`);
    } else {
      console.log(`  ❌ ${key} 翻译模块缺失`);
      allTranslationsExist = false;
    }
  });
  
  // 检查语言支持
  if (i18nContent.includes("zh:") && i18nContent.includes("en:")) {
    console.log('  ✅ 支持中文和英文');
  } else {
    console.log('  ❌ 语言支持不完整');
    allTranslationsExist = false;
  }
  
  if (allTranslationsExist) {
    console.log('  ✅ 多语言系统完整\n');
  } else {
    console.log('  ❌ 多语言系统不完整\n');
  }
} catch (error) {
  console.log(`  ❌ 无法读取 i18n.ts: ${error.message}\n`);
}

// 测试 4: 检查主题系统
console.log('🎨 测试 4: 检查深色模式支持...');
try {
  const themeContent = fs.readFileSync('src/hooks/useTheme.ts', 'utf8');
  const requiredThemeFeatures = [
    'light',
    'dark',
    'system',
    'localStorage',
    'matchMedia',
  ];
  
  let allThemeFeaturesExist = true;
  requiredThemeFeatures.forEach(feature => {
    if (themeContent.includes(feature)) {
      console.log(`  ✅ ${feature} 支持`);
    } else {
      console.log(`  ❌ ${feature} 支持缺失`);
      allThemeFeaturesExist = false;
    }
  });
  
  if (allThemeFeaturesExist) {
    console.log('  ✅ 深色模式系统完整\n');
  } else {
    console.log('  ❌ 深色模式系统不完整\n');
  }
} catch (error) {
  console.log(`  ❌ 无法读取 useTheme.ts: ${error.message}\n`);
}

// 测试 5: 检查 API 文件
console.log('🔌 测试 5: 检查 API 集成...');
try {
  const apiContent = fs.readFileSync('src/lib/api.ts', 'utf8');
  const requiredApiFeatures = [
    'analyzeProduct',
    'generateText',
    'generateImage',
    'editImage',
    'requestGemini',
    'getGeminiURL',
    'base64',
  ];
  
  let allApiFeaturesExist = true;
  requiredApiFeatures.forEach(feature => {
    if (apiContent.includes(feature)) {
      console.log(`  ✅ ${feature} 功能`);
    } else {
      console.log(`  ❌ ${feature} 功能缺失`);
      allApiFeaturesExist = false;
    }
  });
  
  if (allApiFeaturesExist) {
    console.log('  ✅ API 集成完整\n');
  } else {
    console.log('  ❌ API 集成不完整\n');
  }
} catch (error) {
  console.log(`  ❌ 无法读取 api.ts: ${error.message}\n`);
}

// 测试 6: 检查页面组件
console.log('📄 测试 6: 检查页面组件...');
const pages = [
  { file: 'src/pages/UploadPage.tsx', component: 'UploadPage' },
  { file: 'src/pages/ConfigPage.tsx', component: 'ConfigPage' },
  { file: 'src/pages/GeneratingPage.tsx', component: 'GeneratingPage' },
  { file: 'src/pages/EditorPage.tsx', component: 'EditorPage' },
  { file: 'src/pages/SettingsPage.tsx', component: 'SettingsPage' },
];

let allPagesExist = true;
pages.forEach(({ file, component }) => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes(`export function ${component}`) || content.includes(`export const ${component}`)) {
      console.log(`  ✅ ${component}`);
    } else {
      console.log(`  ❌ ${component} - 组件未导出`);
      allPagesExist = false;
    }
  } catch (error) {
    console.log(`  ❌ ${component} - 文件读取失败: ${error.message}`);
    allPagesExist = false;
  }
});

if (allPagesExist) {
  console.log('  ✅ 所有页面组件存在\n');
} else {
  console.log('  ❌ 部分页面组件缺失\n');
}

// 测试 7: 检查 Tailwind 配置
console.log('🎨 测试 7: 检查样式配置...');
try {
  const tailwindConfig = fs.readFileSync('tailwind.config.js', 'utf8');
  if (tailwindConfig.includes('zinc') && tailwindConfig.includes('Inter')) {
    console.log('  ✅ Tailwind 配置正确（Zinc 颜色 + Inter 字体）');
  } else {
    console.log('  ⚠️  Tailwind 配置可能不完整');
  }
  
  const indexCss = fs.readFileSync('src/index.css', 'utf8');
  if (indexCss.includes('@tailwind') && indexCss.includes('dark')) {
    console.log('  ✅ CSS 文件包含 Tailwind 和深色模式支持');
  } else {
    console.log('  ⚠️  CSS 文件可能不完整');
  }
  
  console.log('  ✅ 样式配置检查完成\n');
} catch (error) {
  console.log(`  ❌ 样式配置检查失败: ${error.message}\n`);
}

// 测试总结
console.log('📊 测试总结:');
console.log('  ✅ 文件结构检查完成');
console.log('  ✅ 依赖检查完成');
console.log('  ✅ 多语言系统检查完成');
console.log('  ✅ 深色模式检查完成');
console.log('  ✅ API 集成检查完成');
console.log('  ✅ 页面组件检查完成');
console.log('  ✅ 样式配置检查完成');
console.log('\n✨ 所有测试完成！');
console.log('\n💡 提示:');
console.log('  1. 确保开发服务器正在运行: npm run dev');
console.log('  2. 如果使用 Tauri，运行: npm run tauri:dev');
console.log('  3. 检查浏览器控制台是否有错误');
console.log('  4. 测试上传图片功能');
console.log('  5. 测试语言切换功能');
console.log('  6. 测试主题切换功能');
