# Planet Port 品牌网站 v2

Planet Port 的双风格品牌介绍站：入口选择页 + 「现代」「未来」两套完全独立的单页方案。
基于原生 HTML / CSS / JavaScript 构建，Vite 仅作开发服务器与生产打包，
无运行时依赖、无外部字体/图片 CDN，可离线完整呈现。

## 本地运行

```bash
npm install
npm run dev      # http://127.0.0.1:5173 （入口页，可进入两套风格）
```

## 生产构建

```bash
npm run build    # 产出 dist/（index / modern / future 三入口）
npm run preview
```

## 页面说明

- `index.html` 入口选择页：左右分屏进入两套风格，支持 A / B 键快捷访问
- `modern.html` 现代风：浅色基底 + 深色首屏，克制精致
- `future.html` 未来风：深空底色 + 轨道/星图视觉，沉浸叙事；科幻词汇仅作章节包装，功能描述保持真实原词
- 两套页面右下角可互相切换；每套页面均可独立摘出上线

## 事实基准

平台状态与路线图以各平台仓库 README 为准，如实标注，未发布功能不写成已上线。
非官方品牌站，与 ZeroTier, Inc. 无隶属关系。
