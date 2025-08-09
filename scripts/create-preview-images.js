#!/usr/bin/env node

/**
 * Template Preview Images Creator - 创建模版预览图片占位符
 * 为Astro官方模版生成SVG占位图片
 */

import fs from 'fs/promises';
import path from 'path';

// 模版配置
const TEMPLATES = [
  {
    name: 'astro-basics',
    title: 'Welcome to Astro',
    color: '#8B5CF6', // 紫色
    description: 'Getting Started'
  },
  {
    name: 'astro-blog',
    title: 'Blog',
    color: '#06B6D4', // 青色
    description: 'Personal Blog'
  },
  {
    name: 'astro-portfolio',
    title: 'Portfolio',
    color: '#10B981', // 绿色
    description: 'Showcase Work'
  },
  {
    name: 'astro-starlight',
    title: 'Starlight',
    color: '#F59E0B', // 橙色
    description: 'Documentation'
  },
  {
    name: 'astro-starlog',
    title: 'Starlog',
    color: '#EF4444', // 红色
    description: 'Release Notes'
  }
];

/**
 * 生成SVG预览图片
 */
function generatePreviewSVG(template) {
  return `<svg width="800" height="600" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad${template.name}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${template.color};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${template.color}88;stop-opacity:1" />
    </linearGradient>
    <filter id="shadow">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-opacity="0.1"/>
    </filter>
  </defs>
  
  <!-- Background -->
  <rect width="800" height="600" fill="url(#grad${template.name})"/>
  
  <!-- Main Content Area -->
  <rect x="50" y="80" width="700" height="440" rx="16" fill="white" fill-opacity="0.95" filter="url(#shadow)"/>
  
  <!-- Header -->
  <rect x="80" y="110" width="640" height="60" rx="8" fill="${template.color}22"/>
  <circle cx="110" cy="140" r="8" fill="${template.color}"/>
  <rect x="130" y="132" width="200" height="16" rx="8" fill="${template.color}66"/>
  
  <!-- Navigation -->
  <rect x="80" y="190" width="100" height="20" rx="10" fill="${template.color}44"/>
  <rect x="200" y="190" width="80" height="20" rx="10" fill="${template.color}22"/>
  <rect x="300" y="190" width="90" height="20" rx="10" fill="${template.color}22"/>
  
  <!-- Content Blocks -->
  <rect x="80" y="240" width="300" height="120" rx="12" fill="${template.color}11"/>
  <rect x="420" y="240" width="300" height="120" rx="12" fill="${template.color}11"/>
  <rect x="80" y="380" width="640" height="80" rx="12" fill="${template.color}11"/>
  
  <!-- Decorative Elements -->
  <circle cx="650" cy="160" r="20" fill="${template.color}33"/>
  <rect x="600" y="200" width="40" height="40" rx="20" fill="${template.color}22"/>
  
  <!-- Template Title -->
  <text x="400" y="540" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="32" font-weight="bold" fill="white">${template.title}</text>
  <text x="400" y="570" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="16" fill="white" fill-opacity="0.8">${template.description}</text>
</svg>`;
}

/**
 * 主函数
 */
async function main() {
  console.log('🎨 开始生成模版预览图片...');
  
  // 创建目标目录
  const targetDir = path.join(process.cwd(), 'public/assets/templates');
  await fs.mkdir(targetDir, { recursive: true });
  
  for (const template of TEMPLATES) {
    console.log(`🖼️ 生成: ${template.name}.svg`);
    
    const svgContent = generatePreviewSVG(template);
    const filepath = path.join(targetDir, `${template.name}.svg`);
    
    await fs.writeFile(filepath, svgContent);
  }
  
  console.log('✨ 预览图片生成完成！');
  console.log(`📁 位置: /public/assets/templates/`);
  console.log('💡 提示: 你可以稍后用真实的截图替换这些SVG文件');
}

// 运行脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
} 