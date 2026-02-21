# Chips Official Theme: Obsidian Business Night

薯片生态官方主题包，定位为“暗夜 + 商务质感”视觉风格，面向夜间长时间使用场景。

## 特性

- Obsidian 深色基底与蓝金商务点缀
- 覆盖当前组件库 13 个无头组件接口点（class + data-part + data-scope）
- 主题契约驱动测试（接口命中、变量引用、占位清理）
- Style Dictionary Token 构建链路
- 可直接通过 `chipsd validate` 与 `chipsd pack`

## 主题标识

- 仓库：`Chips-official-theme-obsidian-business-theme`
- 主题 ID：`chips-official.obsidian-business-theme`
- 默认继承：`chips-official.default-theme`
- 主题模式：`darkMode: true`

## 开发命令

```bash
pnpm install
pnpm test
pnpm validate
pnpm build
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
└── tests/
```
