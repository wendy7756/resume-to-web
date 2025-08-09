#!/usr/bin/env node

/**
 * Simple Astro Templates Cloner - 简化版模版复制脚本
 * 只下载关键文件来了解模版结构
 */

import fs from 'fs/promises';
import path from 'path';

// Astro官方仓库配置
const ASTRO_REPO = 'withastro/astro';
const EXAMPLES_PATH = 'examples';
const GITHUB_RAW = 'https://raw.githubusercontent.com';

// 要复制的精选模版和关键文件
const TEMPLATES_CONFIG = [
  {
    name: 'basics',
    displayName: 'Welcome to Astro',
    files: [
      'package.json',
      'astro.config.mjs',
      'tsconfig.json',
      'README.md',
      'src/pages/index.astro',
      'src/layouts/Layout.astro',
      'src/components/Welcome.astro'
    ]
  },
  {
    name: 'blog', 
    displayName: 'Blog',
    files: [
      'package.json',
      'astro.config.mjs',
      'tsconfig.json',
      'README.md',
      'src/pages/index.astro',
      'src/layouts/BlogPost.astro',
      'src/layouts/Base.astro',
      'src/content/config.ts'
    ]
  },
  {
    name: 'portfolio',
    displayName: 'Portfolio', 
    files: [
      'package.json',
      'astro.config.mjs',
      'tsconfig.json',
      'README.md',
      'src/pages/index.astro',
      'src/layouts/BaseLayout.astro',
      'src/components/Hero.astro',
      'src/content/config.ts'
    ]
  },
  {
    name: 'starlog',
    displayName: 'Starlog',
    files: [
      'package.json',
      'astro.config.mjs',
      'tsconfig.json',
      'README.md',
      'src/pages/index.astro',
      'src/layouts/BaseLayout.astro'
    ]
  }
];

/**
 * 下载单个文件
 */
async function downloadFile(templateName, filePath) {
  const url = `${GITHUB_RAW}/${ASTRO_REPO}/main/${EXAMPLES_PATH}/${templateName}/${filePath}`;
  
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
 * 复制单个模版的关键文件
 */
async function copyTemplate(templateConfig) {
  console.log(`🚀 开始处理模版: ${templateConfig.displayName}`);
  
  const targetDir = path.join(process.cwd(), 'astro-templates', templateConfig.name);
  await fs.mkdir(targetDir, { recursive: true });
  
  // 创建文件夹结构
  const dirs = new Set();
  templateConfig.files.forEach(file => {
    const dir = path.dirname(file);
    if (dir !== '.') {
      dirs.add(dir);
    }
  });
  
  for (const dir of dirs) {
    await fs.mkdir(path.join(targetDir, dir), { recursive: true });
  }
  
  // 下载文件
  for (const filePath of templateConfig.files) {
    const content = await downloadFile(templateConfig.name, filePath);
    if (content !== null) {
      const targetPath = path.join(targetDir, filePath);
      await fs.writeFile(targetPath, content);
    }
    
    // 添加延迟避免API限制
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  console.log(`✅ ${templateConfig.displayName} 复制完成`);
}

/**
 * 分析模版结构
 */
async function analyzeTemplate(templateConfig) {
  const templateDir = path.join(process.cwd(), 'astro-templates', templateConfig.name);
  const packageJsonPath = path.join(templateDir, 'package.json');
  
  try {
    const packageContent = await fs.readFile(packageJsonPath, 'utf-8');
    const packageJson = JSON.parse(packageContent);
    
    return {
      name: templateConfig.name,
      displayName: templateConfig.displayName,
      version: packageJson.version || 'N/A',
      dependencies: Object.keys(packageJson.dependencies || {}),
      devDependencies: Object.keys(packageJson.devDependencies || {}),
      scripts: packageJson.scripts || {}
    };
  } catch (error) {
    return {
      name: templateConfig.name,
      displayName: templateConfig.displayName,
      error: error.message
    };
  }
}

/**
 * 生成分析报告
 */
async function generateAnalysisReport(analyses) {
  const reportContent = `# Astro Templates Analysis Report

这是对Astro官方精选模版的分析报告。

## 模版概览

${analyses.map(analysis => `
### ${analysis.displayName} (\`${analysis.name}\`)

${analysis.error ? `**错误**: ${analysis.error}` : `
- **版本**: ${analysis.version}
- **依赖包数量**: ${analysis.dependencies?.length || 0}
- **开发依赖**: ${analysis.devDependencies?.length || 0}
- **脚本命令**: ${Object.keys(analysis.scripts || {}).join(', ')}

**主要依赖**:
${analysis.dependencies?.slice(0, 5).map(dep => `- ${dep}`).join('\n') || '无'}

**脚本命令**:
\`\`\`json
${JSON.stringify(analysis.scripts || {}, null, 2)}
\`\`\`
`}
`).join('\n')}

## 共同特征

### 通用依赖
${Object.entries(analyses.reduce((acc, analysis) => {
  if (analysis.dependencies) {
    analysis.dependencies.forEach(dep => {
      acc[dep] = (acc[dep] || 0) + 1;
    });
  }
  return acc;
}, {}))
  .filter(([dep, count]) => count > 1)
  .map(([dep, count]) => `- **${dep}**: 出现在 ${count} 个模版中`)
  .join('\n')}

### 文件结构对比

| 文件 | basics | blog | portfolio | starlog |
|------|--------|------|-----------|---------|
| package.json | ✅ | ✅ | ✅ | ✅ |
| astro.config.mjs | ✅ | ✅ | ✅ | ✅ |
| tsconfig.json | ✅ | ✅ | ✅ | ✅ |
| src/pages/index.astro | ✅ | ✅ | ✅ | ✅ |
| src/layouts/ | ✅ | ✅ | ✅ | ✅ |
| src/components/ | ✅ | ? | ? | ? |
| src/content/ | ❌ | ✅ | ✅ | ❌ |

## 使用建议

1. **入门学习**: 从 \`basics\` 开始
2. **博客网站**: 使用 \`blog\` 模版
3. **作品展示**: 选择 \`portfolio\` 模版  
4. **项目日志**: 采用 \`starlog\` 模版

---
*生成时间: ${new Date().toISOString()}*
`;

  const reportPath = path.join(process.cwd(), 'astro-templates', 'ANALYSIS.md');
  await fs.writeFile(reportPath, reportContent);
}

/**
 * 主函数
 */
async function main() {
  console.log('🎯 开始简化版模版分析...');
  
  // 创建目标目录
  const templatesDir = path.join(process.cwd(), 'astro-templates');
  await fs.mkdir(templatesDir, { recursive: true });
  
  // 复制模版关键文件
  for (const templateConfig of TEMPLATES_CONFIG) {
    await copyTemplate(templateConfig);
    
    // 添加延迟避免API限制
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('📊 分析模版结构...');
  
  // 分析每个模版
  const analyses = [];
  for (const templateConfig of TEMPLATES_CONFIG) {
    const analysis = await analyzeTemplate(templateConfig);
    analyses.push(analysis);
  }
  
  // 生成分析报告
  await generateAnalysisReport(analyses);
  
  // 生成README
  const readmeContent = `# Astro Official Templates - Key Files

这个目录包含了Astro官方精选模版的关键文件，用于分析和学习。

## 包含的模版

${TEMPLATES_CONFIG.map(config => `
### ${config.displayName} (\`${config.name}\`)
- **GitHub**: https://github.com/withastro/astro/tree/main/examples/${config.name}
- **在线试用**: https://astro.new/${config.name}
- **本地路径**: \`./${config.name}/\`
`).join('\n')}

## 文件说明

每个模版目录包含以下关键文件：
- \`package.json\` - 项目配置和依赖
- \`astro.config.mjs\` - Astro配置文件
- \`tsconfig.json\` - TypeScript配置
- \`README.md\` - 模版说明文档
- \`src/pages/index.astro\` - 主页面
- \`src/layouts/\` - 布局组件
- \`src/components/\` - UI组件

## 分析报告

查看 [ANALYSIS.md](./ANALYSIS.md) 获取详细的模版分析报告。

## 注意事项

- 这些文件仅用于学习和参考
- 实际项目请使用 \`npm create astro@latest -- --template [name]\`
- 遵循MIT许可证
`;

  await fs.writeFile(path.join(templatesDir, 'README.md'), readmeContent);
  
  console.log('🎉 模版分析完成！');
  console.log('📁 位置: ./astro-templates/');
  console.log('📖 查看分析报告: ./astro-templates/ANALYSIS.md');
}

// 运行脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
} 