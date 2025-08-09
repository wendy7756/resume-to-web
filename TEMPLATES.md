# 📚 模版库系统

本项目包含一个自动化的模版获取系统，类似于Astro官方的模版库，可以从GitHub获取免费开源的模版。

## 🚀 快速开始

### 获取模版

```bash
# 运行模版获取脚本
npm run fetch-templates

# 或者直接运行
node scripts/fetch-templates.js
```

### 预览图片

脚本会自动生成模版文件，但需要手动添加预览图片：

1. 在 `/public/assets/templates/` 创建目录
2. 为每个模版添加预览图片（推荐 800x600 分辨率）
3. 图片命名格式：`template-name.jpg`

## 📋 数据结构

每个模版包含以下信息：

```yaml
---
title: Template Name
publishDate: 2024-01-01 00:00:00
img: /assets/templates/template-name.jpg
img_alt: Template preview
description: |
  Template description
tags:
  - astro
  - portfolio  
  - template
category: portfolio    # resume|portfolio|business|blog|landing-page|ecommerce
technology: astro      # astro|react|vue|html|tailwind|bootstrap|typescript
author: Author Name
author_url: https://github.com/author
github_url: https://github.com/author/repo
demo_url: https://demo.example.com
license: MIT License
stars: 123
---
```

## 🏷️ 分类系统

### 用途分类 (Categories)
- **resume** - 个人简历
- **portfolio** - 作品集
- **business** - 企业官网
- **blog** - 博客
- **landing-page** - 落地页
- **ecommerce** - 电商

### 技术栈 (Technology)
- **astro** - Astro框架
- **react** - React/Next.js
- **vue** - Vue/Nuxt
- **html** - 纯HTML/CSS
- **tailwind** - Tailwind CSS
- **bootstrap** - Bootstrap
- **typescript** - TypeScript

## 🔒 合规性

系统只获取具有以下许可证的仓库：
- MIT License
- Apache License 2.0
- BSD 3-Clause License
- BSD 2-Clause License
- ISC License
- Creative Commons Zero v1.0

## 📊 统计信息

运行脚本后会生成 `template-stats.json` 文件，包含：
- 模版总数
- 分类统计
- 技术栈分布
- 生成时间

## 🛠️ 自定义配置

编辑 `scripts/fetch-templates.js` 来：
- 修改搜索关键词
- 调整分类逻辑
- 增加新的技术栈
- 更改许可证白名单

## 📖 最佳实践

1. **定期更新**：每周运行一次获取新模版
2. **质量控制**：手动审核生成的模版
3. **预览图片**：确保所有模版都有预览图
4. **作者归属**：保持作者信息的准确性
5. **许可证遵守**：只使用允许的开源许可证

## 🎯 例子

```bash
# 获取模版
npm run fetch-templates

# 启动开发服务器
npm run dev

# 访问模版页面
open http://localhost:4321/template/
```

## 🚨 注意事项

- GitHub API有速率限制，避免频繁运行
- 确保遵守所有开源许可证要求
- 定期检查链接的有效性
- 保持作者信息和许可证的准确性

## 📝 贡献

如果你发现优质的开源模版：

1. 确认许可证合规
2. 手动添加到 `src/content/work/`
3. 遵循现有的数据结构
4. 添加适当的预览图片

---

🎉 享受构建你的模版库！ 