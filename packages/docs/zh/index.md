---
layout: home
title: Vue WF
hero:
  name: Vue WF
  text: 虚拟化的瀑布流布局组件
  tagline: 为海量图片与卡片提供流畅的 Masonry 排布与滚动体验。
  image:
    src: /example.png
    alt: Vue WF 示意
  actions:
    - theme: brand
      text: 快速开始
      link: /zh/guide/getting-started
    - theme: alt
      text: GitHub
      link: https://github.com/jannchie/vue-wf
features:
  - title: 虚拟滚动
    details: 仅渲染可视区域与缓冲范围内的卡片，轻松应对长列表。
  - title: 自适应对齐
    details: 根据容器与卡片尺寸自动计算列数，保持布局均衡。
  - title: Vue 3 优先
    details: 原生 TypeScript 类型与 Composition API 友好的属性设计。
  - title: 间距可控
    details: 支持按轴配置间距与内边距，适配带说明或徽章的卡片。
---

## 为什么选择 Vue WF

Vue WF 聚焦于媒体密集场景的性能与可用性。通过简单的属性驱动 API 与虚拟化渲染，你可以在滚动数百甚至上千张图片时保持顺滑交互。

## 快速示例

```vue
<script setup lang="ts">
import Waterfall from 'vue-wf'

const tmps = Array.from({ length: 100 })
const heights = [50, 100, 200, 300, 400]
const width = 100
const items = tmps.map(() => {
  const height = heights[Math.floor(Math.random() * heights.length)]
  return {
    width,
    height,
    src: `https://picsum.photos/${width}/${height}?random=${Math.random()}`,
  }
})
</script>

<template>
  <Waterfall
    :wrapper-width="400"
    :item-width="width"
    :gap="20"
  >
    <div
      v-for="item, i in items"
      :key="i"
      :style="{
        height: `${item.height / item.width * 100}px`,
        backgroundImage: `url(${item.src})`,
      }"
    />
  </Waterfall>
</template>
```

## 你将得到

- 可配置的间距、缓冲范围与列计算，类型安全的 Props
- 自由渲染任意插槽内容，兼容图片、卡片或自定义组件
- 一键本地预览与构建：`pnpm docs:dev` 与 `pnpm docs:build`
