# 快速开始

Vue WF 为 Vue 3 提供高性能的瀑布流布局。适合需要多列自适应且滚动流畅的媒体列表场景。

## 安装

```bash
pnpm install vue-wf
```

## 基础用法

将内容包裹在 `Waterfall` 组件内，提供容器宽度 `wrapper-width`、单卡片基准宽度 `item-width` 与间距 `gap`。卡片的实际高度由你自己的样式决定，组件只负责计算列与虚拟化范围。

```vue
<script setup lang="ts">
import Waterfall from 'vue-wf'

const baseWidth = 160
const items = [
  { width: baseWidth, height: 240, src: 'https://picsum.photos/160/240' },
  { width: baseWidth, height: 180, src: 'https://picsum.photos/160/180' },
  { width: baseWidth, height: 280, src: 'https://picsum.photos/160/280' },
]
</script>

<template>
  <Waterfall
    :wrapper-width="480"
    :item-width="baseWidth"
    :gap="12"
  >
    <div
      v-for="item, index in items"
      :key="index"
      :style="{
        height: `${(item.height / item.width) * baseWidth}px`,
        backgroundImage: `url(${item.src})`,
      }"
    />
  </Waterfall>
</template>
```

## 核心属性

- `items`：`{ width: number; height: number }[]`，用于计算列布局与滚动范围。
- `wrapper-width`：容器的像素宽度，响应式场景下可通过 `ResizeObserver` 同步更新。
- `item-width`：单卡片的基准宽度，列数由 `wrapper-width / item-width` 推导。
- `gap`：卡片之间的水平与垂直间距。
- `item-padding`：卡片内补白，可传数字或 `{ x: number; y: number }`。

## 常用命令

- `pnpm docs:dev` — 启动 VitePress 开发服务器。
- `pnpm docs:build` — 构建静态站点，输出到 `.vitepress/dist`。
- `pnpm docs:preview` — 预览构建产物。
