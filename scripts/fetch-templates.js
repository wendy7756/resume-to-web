#!/usr/bin/env node

/**
 * Template Fetcher - 获取免费开源模版
 * 类似于Astro官方的模版库系统
 */

import fs from 'fs/promises';
import path from 'path';

// GitHub API配置
const GITHUB_API = 'https://api.github.com';
const SEARCH_QUERIES = [
  'astro template',
  'resume template astro',
  'portfolio template astro', 
  'astro starter',
  'nextjs template',
  'vue template',
  'nuxt template',
  'react template'
];

// 许可证白名单（确保合规）
const ALLOWED_LICENSES = [
  'MIT License',
  'Apache License 2.0', 
  'BSD 3-Clause "New" or "Revised" License',
  'BSD 2-Clause "Simplified" License',
  'ISC License',
  'Creative Commons Zero v1.0 Universal'
];

/**
 * 搜索GitHub仓库
 */
async function searchGitHubRepos(query, page = 1) {
  const url = `${GITHUB_API}/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=30&page=${page}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`搜索失败: ${query}`, error);
    return { items: [] };
  }
}

/**
 * 获取仓库详细信息
 */
async function getRepoDetails(repo) {
  try {
    // 获取许可证信息
    const licenseResponse = await fetch(`${GITHUB_API}/repos/${repo.full_name}/license`);
    const license = licenseResponse.ok ? await licenseResponse.json() : null;
    
    // 获取README内容
    const readmeResponse = await fetch(`${GITHUB_API}/repos/${repo.full_name}/readme`);
    const readme = readmeResponse.ok ? await readmeResponse.json() : null;
    
    return {
      ...repo,
      license_info: license,
      readme_content: readme
    };
  } catch (error) {
    console.error(`获取仓库详情失败: ${repo.full_name}`, error);
    return repo;
  }
}

/**
 * 过滤和分类模版
 */
function categorizeTemplate(repo) {
  const name = repo.name.toLowerCase();
  const description = (repo.description || '').toLowerCase();
  const topics = repo.topics || [];
  
  // 技术栈检测
  let tech = 'html';
  if (topics.includes('astro') || name.includes('astro')) tech = 'astro';
  else if (topics.includes('react') || name.includes('react')) tech = 'react';
  else if (topics.includes('vue') || name.includes('vue')) tech = 'vue';
  else if (topics.includes('nextjs') || name.includes('next')) tech = 'react';
  else if (topics.includes('nuxt') || name.includes('nuxt')) tech = 'vue';
  else if (topics.includes('typescript') || name.includes('typescript')) tech = 'typescript';
  else if (topics.includes('tailwind') || name.includes('tailwind')) tech = 'tailwind';
  
  // 分类检测
  let category = 'portfolio';
  if (name.includes('resume') || name.includes('cv')) category = 'resume';
  else if (name.includes('blog')) category = 'blog';  
  else if (name.includes('business') || name.includes('corporate')) category = 'business';
  else if (name.includes('landing') || name.includes('startup')) category = 'landing-page';
  else if (name.includes('ecommerce') || name.includes('shop')) category = 'ecommerce';
  
  return { tech, category };
}

/**
 * 生成模版Markdown文件
 */
function generateTemplateMarkdown(repo, category, tech) {
  const { tech: detectedTech, category: detectedCategory } = categorizeTemplate(repo);
  const finalTech = tech || detectedTech;
  const finalCategory = category || detectedCategory;
  
  // 获取作者信息
  const author = repo.owner?.login || 'Unknown';
  const authorUrl = repo.owner?.html_url || '';
  
  // 生成预览图URL（可能需要后续手动替换）
  const previewImg = `/assets/templates/${repo.name}.jpg`;
  
  const frontmatter = `---
title: ${repo.name}
publishDate: ${new Date(repo.created_at).toISOString().split('T')[0]} 00:00:00
img: ${previewImg}
img_alt: ${repo.description || `${repo.name} template preview`}
description: |
  ${repo.description || 'A beautiful template for your project'}
tags:
  - ${finalTech}
  - ${finalCategory}
  - template
category: ${finalCategory}
technology: ${finalTech}
author: ${author}
author_url: ${authorUrl}
github_url: ${repo.html_url}
demo_url: ${repo.homepage || ''}
license: ${repo.license?.name || 'Unknown'}
stars: ${repo.stargazers_count}
---

## ${repo.name}

${repo.description || 'A beautiful template for your project'}

### Features

- Built with ${finalTech.charAt(0).toUpperCase() + finalTech.slice(1)}
- Responsive design
- Modern UI/UX
- ${repo.license?.name || 'Open source'}

### Author

Created by [${author}](${authorUrl})

### Repository

- **GitHub**: [${repo.full_name}](${repo.html_url})
- **Stars**: ${repo.stargazers_count}
- **License**: ${repo.license?.name || 'Unknown'}
${repo.homepage ? `- **Demo**: [Live Demo](${repo.homepage})` : ''}

### Installation

\`\`\`bash
git clone ${repo.clone_url}
cd ${repo.name}
npm install
npm run dev
\`\`\`
`;

  return frontmatter;
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始获取免费开源模版...');
  
  const allTemplates = [];
  
  // 搜索各种查询
  for (const query of SEARCH_QUERIES) {
    console.log(`🔍 搜索: ${query}`);
    const results = await searchGitHubRepos(query);
    
    for (const repo of results.items.slice(0, 10)) { // 每个查询取前10个
      // 检查许可证
      if (repo.license && ALLOWED_LICENSES.includes(repo.license.name)) {
        const detailRepo = await getRepoDetails(repo);
        allTemplates.push(detailRepo);
        
        // 添加延迟避免API限制
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }
  
  console.log(`📦 找到 ${allTemplates.length} 个合规模版`);
  
  // 去重（基于仓库名）
  const uniqueTemplates = allTemplates.filter((repo, index, self) => 
    index === self.findIndex(r => r.full_name === repo.full_name)
  );
  
  console.log(`✨ 去重后 ${uniqueTemplates.length} 个模版`);
  
  // 创建content/work目录
  const contentDir = path.join(process.cwd(), 'src/content/work');
  await fs.mkdir(contentDir, { recursive: true });
  
  // 生成模版文件
  for (const repo of uniqueTemplates.slice(0, 50)) { // 限制50个模版
    const filename = `${repo.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.md`;
    const filepath = path.join(contentDir, filename);
    const content = generateTemplateMarkdown(repo);
    
    await fs.writeFile(filepath, content);
    console.log(`📝 生成: ${filename}`);
  }
  
  // 生成统计报告
  const stats = {
    total: uniqueTemplates.length,
    categories: {},
    technologies: {},
    generated: new Date().toISOString()
  };
  
  uniqueTemplates.forEach(repo => {
    const { tech, category } = categorizeTemplate(repo);
    stats.categories[category] = (stats.categories[category] || 0) + 1;
    stats.technologies[tech] = (stats.technologies[tech] || 0) + 1;
  });
  
  await fs.writeFile(
    path.join(process.cwd(), 'template-stats.json'), 
    JSON.stringify(stats, null, 2)
  );
  
  console.log('🎉 模版获取完成！');
  console.log('📊 统计:', stats);
  console.log('💡 提示: 请手动添加预览图片到 /public/assets/templates/ 目录');
}

// 运行脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
} 