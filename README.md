# Chips Official Theme: Obsidian Business

薯片生态官方 Obsidian 主题包，定位为单语义的深色商务视觉方案。

## 特性

- 与组件库冻结合同同步，覆盖 45 个可主题化组件接口点
- Token 体系收敛为 `ref/sys/comp/motion/layout` 五层
- 字体 token 冻结字段：`font.family.*`、`font.size.*`、`font.weight.*`、`font.lineHeight.*`
- 图标轴 token 冻结字段：`icon.fill/icon.weight/icon.grade/icon.opticalSize/icon.size`
- 主题清单采用单语义口径，`theme` 节点仅保留 `tokensVersion` 与 `inherits`

## 主题标识

- 仓库：`Chips-official-theme-obsidian-business-theme`
- 主题 ID：`chips-official.obsidian-business-theme`
- 默认继承：`chips-official.default-theme`

## 开发命令

```bash
pnpm install
pnpm build
pnpm test
pnpm validate
chipsd validate
chipsd pack
```

## 目录结构

```text
Chips-official-theme-obsidian-business-theme/
├── manifest.yaml
├── theme.css
├── tokens/
├── components/
├── icons/
├── animations/
├── contracts/
├── scripts/
├── tests/
└── archive/
```

- `archive/legacy-components/`：归档的历史组件样式（已退出主路径）
- `archive/legacy-tokens/`：归档的历史 token 文件（已退出主路径）
