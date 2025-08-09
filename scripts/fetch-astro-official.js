#!/usr/bin/env node

/**
 * Astro Official Template Fetcher - 获取Astro官方模版
 * 从 https://github.com/withastro/astro/tree/main/examples 获取
 */

import fs from 'fs/promises';
import path from 'path';

// Astro官方仓库配置
const ASTRO_REPO = 'withastro/astro';
const EXAMPLES_PATH = 'examples';
const GITHUB_API = 'https://api.github.com';

/**
 * 获取Astro官方examples目录
 */
async function getAstroExamples() {
  const url = `${GITHUB_API}/repos/${ASTRO_REPO}/contents/${EXAMPLES_PATH}`;
  
  try {
    console.log('🔍 获取Astro官方examples目录...');
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }
    const contents = await response.json();
    
    // 过滤出目录（模版）
    const templates = contents.filter(item => item.type === 'dir');
    console.log(`📁 找到 ${templates.length} 个官方模版`);
    
    return templates;
  } catch (error) {
    console.error('获取examples失败:', error);
    return [];
  }
}

/**
 * 获取模版的package.json信息
 */
async function getTemplatePackageJson(templateName) {
  const url = `${GITHUB_API}/repos/${ASTRO_REPO}/contents/${EXAMPLES_PATH}/${templateName}/package.json`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    const content = Buffer.from(data.content, 'base64').toString('utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`获取 ${templateName} 的package.json失败:`, error);
    return null;
  }
}

/**
 * 获取模版的README信息
 */
async function getTemplateReadme(templateName) {
  const url = `${GITHUB_API}/repos/${ASTRO_REPO}/contents/${EXAMPLES_PATH}/${templateName}/README.md`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    const content = Buffer.from(data.content, 'base64').toString('utf-8');
    return content;
  } catch (error) {
    console.error(`获取 ${templateName} 的README失败:`, error);
    return null;
  }
}

/**
 * 分析模版类型
 */
function analyzeTemplate(templateName, packageJson, readme) {
  const name = templateName.toLowerCase();
  const description = packageJson?.description || '';
  const readmeContent = (readme || '').toLowerCase();
  
  // 技术栈检测
  let tech = 'astro';
  const dependencies = { ...packageJson?.dependencies, ...packageJson?.devDependencies };
  
  if (dependencies?.react || dependencies?.['@types/react']) tech = 'react';
  else if (dependencies?.vue || dependencies?.['@vue/runtime-core']) tech = 'vue';
  else if (dependencies?.['tailwindcss']) tech = 'tailwind';
  else if (dependencies?.typescript || dependencies?.['@types/node']) tech = 'typescript';
  
  // 分类检测
  let category = 'portfolio';
  if (name.includes('blog')) category = 'blog';
  else if (name.includes('portfolio')) category = 'portfolio';
  else if (name.includes('landing')) category = 'landing-page';
  else if (name.includes('docs') || name.includes('documentation')) category = 'blog';
  else if (name.includes('ecommerce') || name.includes('shop')) category = 'ecommerce';
  else if (name.includes('business') || name.includes('corporate')) category = 'business';
  else if (readmeContent.includes('resume') || readmeContent.includes('cv')) category = 'resume';
  
  return { tech, category };
}

/**
 * 生成Astro官方模版的Markdown
 */
function generateAstroTemplateMarkdown(template, packageJson, readme) {
  const { tech, category } = analyzeTemplate(template.name, packageJson, readme);
  
  // 提取描述
  let description = packageJson?.description || '';
  if (readme) {
    const readmeLines = readme.split('\n');
    const descLine = readmeLines.find(line => line.trim() && !line.startsWith('#') && !line.startsWith('```'));
    if (descLine && descLine.length > description.length) {
      description = descLine.trim();
    }
  }
  
  if (!description) {
    description = `Official Astro ${template.name} template`;
  }
  
  // 生成预览图URL
  const previewImg = `/assets/templates/astro-${template.name}.jpg`;
  
  const frontmatter = `---
title: ${template.name}
publishDate: 2024-01-01 00:00:00
img: ${previewImg}
img_alt: Astro ${template.name} template preview
description: |
  ${description}
tags:
  - ${tech}
  - ${category}
  - astro-official
  - template
category: ${category}
technology: ${tech}
author: Astro Team
author_url: https://github.com/withastro/astro
github_url: https://github.com/withastro/astro/tree/main/examples/${template.name}
demo_url: https://astro.new/${template.name}
license: MIT License
stars: 52700
is_official: true
---

## ${template.name}

${description}

### 特点

- 🚀 Astro官方维护
- ⚡ 现代化构建工具
- 📱 响应式设计
- 🎨 精美UI设计
- 📖 完整文档

### 技术栈

- **框架**: Astro
- **样式**: ${tech === 'tailwind' ? 'Tailwind CSS' : 'CSS'}
- **许可证**: MIT License
${packageJson?.dependencies?.react ? '- **UI库**: React' : ''}
${packageJson?.dependencies?.vue ? '- **UI库**: Vue' : ''}

### 在线体验

- 🎮 **在线试用**: [astro.new/${template.name}](https://astro.new/${template.name})
- 📂 **源代码**: [GitHub](https://github.com/withastro/astro/tree/main/examples/${template.name})

### 快速开始

\`\`\`bash
# 使用 Astro CLI 创建项目
npm create astro@latest -- --template ${template.name}

# 或使用在线模版
open https://astro.new/${template.name}
\`\`\`

### 目录结构

\`\`\`
${template.name}/
├── src/
│   ├── components/
│   ├── layouts/
│   └── pages/
├── public/
└── package.json
\`\`\`

---

🌟 **官方推荐**: 这是Astro团队精心维护的官方模版，质量有保证！
`;

  return frontmatter;
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始获取Astro官方模版...');
  
  const templates = await getAstroExamples();
  if (templates.length === 0) {
    console.log('❌ 未找到任何模版');
    return;
  }
  
  // 创建content目录
  const contentDir = path.join(process.cwd(), 'src/content/work');
  await fs.mkdir(contentDir, { recursive: true });
  
  console.log('📦 开始处理模版...');
  
  for (const template of templates) {
    console.log(`🔄 处理: ${template.name}`);
    
    // 获取模版详细信息
    const packageJson = await getTemplatePackageJson(template.name);
    const readme = await getTemplateReadme(template.name);
    
    // 生成文件
    const filename = `astro-${template.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.md`;
    const filepath = path.join(contentDir, filename);
    const content = generateAstroTemplateMarkdown(template, packageJson, readme);
    
    await fs.writeFile(filepath, content);
    console.log(`✅ 生成: ${filename}`);
    
    // 添加延迟避免API限制
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  // 生成统计
  const stats = {
    total: templates.length,
    source: 'Astro Official',
    repository: `https://github.com/${ASTRO_REPO}/tree/main/${EXAMPLES_PATH}`,
    generated: new Date().toISOString(),
    templates: templates.map(t => t.name)
  };
  
  await fs.writeFile(
    path.join(process.cwd(), 'astro-official-stats.json'), 
    JSON.stringify(stats, null, 2)
  );
  
  console.log('🎉 Astro官方模版获取完成！');
  console.log(`📊 总计: ${templates.length} 个模版`);
  console.log('💡 预览图片路径: /public/assets/templates/astro-*.jpg');
  console.log('🌐 在线试用: https://astro.new/[template-name]');
}

// 运行脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
} 