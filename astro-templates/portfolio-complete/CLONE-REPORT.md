# Astro Portfolio Template - Complete Clone

这是从Astro官方仓库完整克隆的Portfolio模版。

## 📊 克隆统计

- **下载成功**: 41 文件
- **跳过文件**: 2 文件  
- **总文件数**: 43
- **成功率**: 95.3%

## 📁 文件结构

```
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
```

## 🚀 使用方法

```bash
cd astro-templates/portfolio-complete
npm install
npm run dev
```

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
*克隆时间: 2025-08-09T16:02:00.847Z*
*源仓库: https://github.com/withastro/astro/tree/main/examples/portfolio*
