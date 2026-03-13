# 图片去背景脚本

## 用法

```bash
# AI 抠图（推荐，效果最好，首次运行会下载 ~80MB 模型）
npm run remove-bg

# 简单白底去除（适合纯白底图，速度快）
npm run remove-bg:white

# 指定目录
node scripts/remove-bg.js public/assets/sprites

# 覆盖原图
node scripts/remove-bg.js --replace public/assets/sprites

# 白底 + 覆盖
node scripts/remove-bg.js --white --replace public/assets/sprites
```

## 依赖

- **AI 抠图**：`@imgly/background-removal-node`（已安装）
- **白底去除**：`sharp`（已安装）

## 未来生成图片时的建议

若 AI 无法直接生成透明背景，可要求生成 **纯白底** 或 **纯色底**，便于抠图：

- `on pure white #FFFFFF background`
- `isolated on solid white background`
- `on solid pastel pink #FFB6C1 background`（若主体不含粉色）

纯白底可用 `--white` 快速去除；其他背景建议用默认 AI 抠图。
