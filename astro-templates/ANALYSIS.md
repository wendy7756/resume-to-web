# Astro Templates Analysis Report

这是对Astro官方精选模版的分析报告。

## 模版概览


### Welcome to Astro (`basics`)


- **版本**: 0.0.1
- **依赖包数量**: 1
- **开发依赖**: 0
- **脚本命令**: dev, build, preview, astro

**主要依赖**:
- astro

**脚本命令**:
```json
{
  "dev": "astro dev",
  "build": "astro build",
  "preview": "astro preview",
  "astro": "astro"
}
```



### Blog (`blog`)


- **版本**: 0.0.1
- **依赖包数量**: 5
- **开发依赖**: 0
- **脚本命令**: dev, build, preview, astro

**主要依赖**:
- @astrojs/mdx
- @astrojs/rss
- @astrojs/sitemap
- astro
- sharp

**脚本命令**:
```json
{
  "dev": "astro dev",
  "build": "astro build",
  "preview": "astro preview",
  "astro": "astro"
}
```



### Portfolio (`portfolio`)


- **版本**: 0.0.1
- **依赖包数量**: 1
- **开发依赖**: 0
- **脚本命令**: dev, build, preview, astro

**主要依赖**:
- astro

**脚本命令**:
```json
{
  "dev": "astro dev",
  "build": "astro build",
  "preview": "astro preview",
  "astro": "astro"
}
```



### Starlog (`starlog`)


- **版本**: 0.0.1
- **依赖包数量**: 3
- **开发依赖**: 0
- **脚本命令**: dev, build, preview, astro

**主要依赖**:
- astro
- sass
- sharp

**脚本命令**:
```json
{
  "dev": "astro dev",
  "build": "astro build",
  "preview": "astro preview",
  "astro": "astro"
}
```



## 共同特征

### 通用依赖
- **astro**: 出现在 4 个模版中
- **sharp**: 出现在 2 个模版中

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

1. **入门学习**: 从 `basics` 开始
2. **博客网站**: 使用 `blog` 模版
3. **作品展示**: 选择 `portfolio` 模版  
4. **项目日志**: 采用 `starlog` 模版

---
*生成时间: 2025-08-09T15:49:48.323Z*
