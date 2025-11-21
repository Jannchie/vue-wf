---
layout: home
title: Vue WF
hero:
  name: Vue WF
  text: Virtualized waterfall layout for Vue 3
  tagline: Build responsive masonry galleries that stay smooth with big data sets.
  image:
    src: /example.png
    alt: Vue WF demo
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/jannchie/vue-wf
features:
  - title: Virtual scrolling
    details: Only visible tiles plus a configurable buffer are rendered for smooth infinite feeds.
  - title: Masonry alignment
    details: Keep cards balanced with automatic column calculation based on wrapper width and item size.
  - title: Vue-first API
    details: Shipping native TypeScript typings with props that fit the Vue 3 Composition API.
  - title: Flexible spacing
    details: Configure per-axis padding and gaps to adapt to captions, badges, or mixed aspect ratios.
---

## Why Vue WF

Vue WF focuses on rendering efficiency for media-heavy grids. It pairs a simple prop-driven API with virtualization so you can keep interaction snappy even when streaming hundreds of photos or cards.

## Quick sample

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

## What you get

- Type-safe props for layout tuning and virtualization buffers
- Works with any content node you render in each item slot
- Ready-to-build documentation with `pnpm docs:dev` and `pnpm docs:build`
