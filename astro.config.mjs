// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://resumehub.com', // 替换为你的实际域名
  
  // 启用压缩
  compressHTML: true,
  
  // 构建配置
  build: {
    // 内联样式表，减少请求
    inlineStylesheets: 'auto',
  },
  
  // 预渲染配置
  output: 'static',
  
  // 移除过时的实验性功能配置
  
  // Vite 配置
  vite: {
    build: {
      // 压缩资源
      minify: 'terser',
      // 代码分割
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['astro'],
          },
        },
      },
    },
  },
});
