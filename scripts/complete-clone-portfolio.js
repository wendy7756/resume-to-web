#!/usr/bin/env node

/**
 * Complete Portfolio Template Cloner - 完整克隆Portfolio模版
 * 基于index.astro中的导入来下载所有必需文件
 */

import fs from 'fs/promises';
import path from 'path';

// Astro官方仓库配置
const ASTRO_REPO = 'withastro/astro';
const TEMPLATE_PATH = 'examples/portfolio';
const GITHUB_RAW = 'https://raw.githubusercontent.com';

// Portfolio模版的完整文件列表（基于导入分析）
const PORTFOLIO_FILES = [
  // 根目录文件
  'package.json',
  'astro.config.mjs', 
  'tsconfig.json',
  'README.md',
  '.gitignore',
  
  // Public 目录
  'public/favicon.svg',
  'public/assets/portrait.jpg',
  'public/assets/backgrounds/bg-main-light-800w.jpg',
  'public/assets/backgrounds/bg-main-light.svg',
  'public/assets/backgrounds/bg-main-dark-800w.jpg', 
  'public/assets/backgrounds/bg-main-dark.svg',
  'public/assets/backgrounds/bg-subtle-1-light-800w.jpg',
  'public/assets/backgrounds/bg-subtle-1-dark-800w.jpg',
  'public/assets/backgrounds/bg-subtle-2-light-800w.jpg',
  'public/assets/backgrounds/bg-subtle-2-dark-800w.jpg',
  'public/assets/backgrounds/bg-footer-light-800w.jpg',
  'public/assets/backgrounds/bg-footer-dark-800w.jpg',
  'public/assets/backgrounds/noise.png',
  
  // 页面文件
  'src/pages/index.astro',
  'src/pages/about.astro',
  'src/pages/work.astro',
  'src/pages/work/[...slug].astro',
  
  // 布局文件
  'src/layouts/BaseLayout.astro',
  
  // 核心组件 (基于index.astro的导入)
  'src/components/CallToAction.astro',
  'src/components/ContactCTA.astro', 
  'src/components/Grid.astro',
  'src/components/Hero.astro',
  'src/components/Icon.astro',
  'src/components/Pill.astro',
  'src/components/PortfolioPreview.astro',
  'src/components/Skills.astro',
  'src/components/MainHead.astro',
  'src/components/Nav.astro',
  'src/components/Footer.astro',
  'src/components/ThemeToggle.astro',
  'src/components/IconPaths.ts',
  
  // Content配置和示例内容
  'src/content/config.ts',
  'src/content/work/bloom-box.md',
  'src/content/work/h20.md',
  'src/content/work/markdown-mystery-tour.md',
  'src/content/work/nested/duvet-genius.md',
  
  // 样式文件
  'src/styles/global.css',
  
  // 环境文件
  'src/env.d.ts'
];

/**
 * 下载单个文件
 */
async function downloadFile(filePath) {
  const url = `${GITHUB_RAW}/${ASTRO_REPO}/main/${TEMPLATE_PATH}/${filePath}`;
  
  try {
    console.log(`📄 下载: ${filePath}`);
    const response = await fetch(url);
    if (!response.ok) {
      console.log(`⚠️ 跳过文件: ${filePath} (状态: ${response.status})`);
      return null;
    }
    return await response.text();
  } catch (error) {
    console.error(`下载失败: ${filePath}`, error.message);
    return null;
  }
}

/**
 * 确保目录存在
 */
async function ensureDir(dirPath) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    // 目录已存在，忽略错误
  }
}

/**
 * 完整克隆Portfolio模版
 */
async function cloneCompletePortfolio() {
  console.log('🎯 开始完整克隆Portfolio模版...');
  
  const targetDir = path.join(process.cwd(), 'astro-templates', 'portfolio-complete');
  await ensureDir(targetDir);
  
  let downloadedCount = 0;
  let skippedCount = 0;
  
  // 下载所有文件
  for (const filePath of PORTFOLIO_FILES) {
    const content = await downloadFile(filePath);
    
    if (content !== null) {
      const targetPath = path.join(targetDir, filePath);
      
      // 确保父目录存在
      await ensureDir(path.dirname(targetPath));
      
      // 写入文件
      await fs.writeFile(targetPath, content);
      downloadedCount++;
    } else {
      skippedCount++;
    }
    
    // 添加延迟避免API限制
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`✅ Portfolio模版克隆完成！`);
  console.log(`📊 下载成功: ${downloadedCount} 文件`);
  console.log(`⚠️ 跳过: ${skippedCount} 文件`);
  
  // 生成分析报告
  await generatePortfolioReport(targetDir, downloadedCount, skippedCount);
}

/**
 * 生成Portfolio分析报告
 */
async function generatePortfolioReport(targetDir, downloadedCount, skippedCount) {
  const reportContent = `# Astro Portfolio Template - Complete Clone

这是从Astro官方仓库完整克隆的Portfolio模版。

## 📊 克隆统计

- **下载成功**: ${downloadedCount} 文件
- **跳过文件**: ${skippedCount} 文件  
- **总文件数**: ${PORTFOLIO_FILES.length}
- **成功率**: ${(downloadedCount / PORTFOLIO_FILES.length * 100).toFixed(1)}%

## 📁 文件结构

\`\`\`
portfolio-complete/
├── package.json              # 项目配置
├── astro.config.mjs          # Astro配置
├── tsconfig.json            # TypeScript配置
├── README.md                # 项目说明
├── public/                  # 静态资源
│   ├── favicon.svg
│   └── assets/
│       ├── portrait.jpg     # 个人头像
│       └── backgrounds/     # 背景图片
├── src/
│   ├── pages/              # 页面
│   │   ├── index.astro     # 主页
│   │   ├── about.astro     # 关于页面
│   │   ├── work.astro      # 作品页面
│   │   └── work/
│   │       └── [...slug].astro  # 动态作品详情
│   ├── layouts/            # 布局
│   │   └── BaseLayout.astro
│   ├── components/         # 组件
│   │   ├── Hero.astro      # 英雄区域
│   │   ├── Nav.astro       # 导航栏
│   │   ├── Footer.astro    # 页脚
│   │   ├── Grid.astro      # 网格布局
│   │   ├── PortfolioPreview.astro  # 作品预览
│   │   └── ... (更多组件)
│   ├── content/            # 内容集合
│   │   ├── config.ts       # 内容配置
│   │   └── work/           # 作品内容
│   └── styles/
│       └── global.css      # 全局样式
\`\`\`

## 🚀 使用方法

\`\`\`bash
cd ${path.relative(process.cwd(), targetDir)}
npm install
npm run dev
\`\`\`

## 📖 学习要点

1. **组件架构**: 查看components/目录了解组件设计模式
2. **内容管理**: 学习content/目录的Content Collections用法
3. **样式系统**: 分析global.css的CSS变量和设计tokens
4. **响应式设计**: 研究各组件的媒体查询实现
5. **TypeScript集成**: 了解.astro文件中的TypeScript用法

## 📸 模版特色

- ✅ 响应式设计
- ✅ 暗色/亮色主题切换
- ✅ Content Collections内容管理
- ✅ SEO优化
- ✅ 无障碍访问支持
- ✅ 现代CSS（Grid、Flexbox、CSS变量）
- ✅ TypeScript支持

---
*克隆时间: ${new Date().toISOString()}*
*源仓库: https://github.com/withastro/astro/tree/main/examples/portfolio*
`;

  await fs.writeFile(path.join(targetDir, 'CLONE-REPORT.md'), reportContent);
  console.log('📖 生成分析报告: CLONE-REPORT.md');
}

/**
 * 主函数
 */
async function main() {
  await cloneCompletePortfolio();
  
  console.log('🎉 完整克隆完成！');
  console.log('📁 位置: ./astro-templates/portfolio-complete/');
  console.log('📖 查看报告: ./astro-templates/portfolio-complete/CLONE-REPORT.md');
}

// 运行脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
} 