#!/usr/bin/env node

/**
 * Astro Templates Cloner - 复制Astro官方模版源代码
 * 从GitHub下载模版文件夹到本地
 */

import fs from 'fs/promises';
import path from 'path';

// Astro官方仓库配置
const ASTRO_REPO = 'withastro/astro';
const EXAMPLES_PATH = 'examples';
const GITHUB_API = 'https://api.github.com';

// 要复制的精选模版
const FEATURED_TEMPLATES = [
  'basics',
  'blog', 
  'portfolio',
  'starlog'
  // 注意：starlight是独立仓库，稍后单独处理
];

/**
 * 递归获取目录内容
 */
async function getDirectoryContents(repoPath, dirPath = '') {
  const url = `${GITHUB_API}/repos/${repoPath}/contents/${dirPath}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }
    const contents = await response.json();
    return contents;
  } catch (error) {
    console.error(`获取目录失败: ${dirPath}`, error);
    return [];
  }
}

/**
 * 下载文件内容
 */
async function downloadFile(downloadUrl) {
  try {
    const response = await fetch(downloadUrl);
    if (!response.ok) {
      throw new Error(`Download failed: ${response.status}`);
    }
    const data = await response.json();
    return Buffer.from(data.content, 'base64').toString('utf-8');
  } catch (error) {
    console.error('下载文件失败:', error);
    return null;
  }
}

/**
 * 递归复制目录
 */
async function copyDirectory(repoPath, sourcePath, targetPath) {
  console.log(`📁 处理目录: ${sourcePath}`);
  
  // 创建目标目录
  await fs.mkdir(targetPath, { recursive: true });
  
  // 获取目录内容
  const contents = await getDirectoryContents(repoPath, sourcePath);
  
  for (const item of contents) {
    const itemTargetPath = path.join(targetPath, item.name);
    
    if (item.type === 'file') {
      console.log(`📄 下载文件: ${item.name}`);
      const fileContent = await downloadFile(item.download_url);
      if (fileContent !== null) {
        await fs.writeFile(itemTargetPath, fileContent);
      }
      
      // 添加延迟避免API限制
      await new Promise(resolve => setTimeout(resolve, 100));
    } else if (item.type === 'dir') {
      // 递归处理子目录
      await copyDirectory(repoPath, item.path, itemTargetPath);
    }
  }
}

/**
 * 复制单个模版
 */
async function copyTemplate(templateName) {
  console.log(`🚀 开始复制模版: ${templateName}`);
  
  const sourcePath = `${EXAMPLES_PATH}/${templateName}`;
  const targetPath = path.join(process.cwd(), 'astro-templates', templateName);
  
  await copyDirectory(ASTRO_REPO, sourcePath, targetPath);
  
  console.log(`✅ 模版复制完成: ${templateName}`);
}

/**
 * 复制Starlight模版（独立仓库）
 */
async function copyStarlightTemplate() {
  console.log(`🌟 开始复制Starlight模版...`);
  
  const starlightRepo = 'withastro/starlight';
  const targetPath = path.join(process.cwd(), 'astro-templates', 'starlight');
  
  // 获取Starlight的主要文件
  const importantFiles = [
    'package.json',
    'astro.config.mjs',
    'tsconfig.json',
    'src',
    'public'
  ];
  
  for (const fileName of importantFiles) {
    try {
      await copyDirectory(starlightRepo, fileName, path.join(targetPath, fileName));
    } catch (error) {
      console.log(`⚠️ 跳过文件: ${fileName} (${error.message})`);
    }
  }
  
  console.log(`✅ Starlight模版复制完成`);
}

/**
 * 生成模版索引文件
 */
async function generateTemplateIndex() {
  const indexContent = `# Astro Official Templates

这个目录包含了从Astro官方仓库复制的精选模版源代码。

## 模版列表

### 1. basics - Welcome to Astro
- **路径**: \`./basics/\`
- **描述**: 官方入门模版，适合学习Astro
- **GitHub**: https://github.com/withastro/astro/tree/main/examples/basics

### 2. blog - Blog Template  
- **路径**: \`./blog/\`
- **描述**: 极简博客模版，包含最佳实践
- **GitHub**: https://github.com/withastro/astro/tree/main/examples/blog

### 3. portfolio - Portfolio Template
- **路径**: \`./portfolio/\`
- **描述**: 作品集展示模版
- **GitHub**: https://github.com/withastro/astro/tree/main/examples/portfolio

### 4. starlog - Release Notes
- **路径**: \`./starlog/\`
- **描述**: 轻量级更新日志主题
- **GitHub**: https://github.com/withastro/astro/tree/main/examples/starlog

### 5. starlight - Documentation (独立仓库)
- **路径**: \`./starlight/\`
- **描述**: 文档网站构建工具
- **GitHub**: https://github.com/withastro/starlight

## 使用方法

每个模版都是完整的Astro项目，可以直接运行：

\`\`\`bash
cd astro-templates/[template-name]
npm install
npm run dev
\`\`\`

## 注意事项

- 这些文件仅用于学习和参考
- 保持与上游仓库的同步
- 遵循MIT许可证
`;

  const indexPath = path.join(process.cwd(), 'astro-templates', 'README.md');
  await fs.writeFile(indexPath, indexContent);
}

/**
 * 主函数
 */
async function main() {
  console.log('🎯 开始复制Astro官方模版源代码...');
  
  // 创建目标目录
  const templatesDir = path.join(process.cwd(), 'astro-templates');
  await fs.mkdir(templatesDir, { recursive: true });
  
  // 复制普通模版
  for (const templateName of FEATURED_TEMPLATES) {
    await copyTemplate(templateName);
    
    // 添加延迟避免API限制
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // 复制Starlight模版
  await copyStarlightTemplate();
  
  // 生成索引文件
  await generateTemplateIndex();
  
  console.log('🎉 所有模版复制完成！');
  console.log('📁 位置: ./astro-templates/');
  console.log('📖 查看 ./astro-templates/README.md 了解详情');
  
  // 生成统计
  const stats = {
    total: FEATURED_TEMPLATES.length + 1, // +1 for starlight
    templates: [...FEATURED_TEMPLATES, 'starlight'],
    location: './astro-templates/',
    copied_at: new Date().toISOString(),
    source: 'https://github.com/withastro/astro/tree/main/examples'
  };
  
  await fs.writeFile(
    path.join(templatesDir, 'clone-stats.json'),
    JSON.stringify(stats, null, 2)
  );
}

// 运行脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
} 