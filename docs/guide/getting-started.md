# Getting Started

Vue WF renders a virtualized masonry layout for Vue 3 apps. Use it when you need responsive multi-column grids without sacrificing scroll performance.

## Installation

```bash
pnpm install vue-wf
```

## Basic usage

Wrap your content inside the `Waterfall` component and provide a `wrapper-width`, base `item-width`, and gap. Each child can be any element or component; the layout engine will measure it based on the width you provide and the height you set.

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
  <Waterfall :wrapper-width="480" :item-width="baseWidth" :gap="12">
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

## Core props

- `items`: an array of `{ width: number; height: number }` pairs used to compute column layout. Even if you render custom children, supplying dimensions keeps the virtualizer accurate.
- `wrapper-width`: the pixel width of the scrollable container. Use `ResizeObserver` or a ref to keep this in sync on responsive layouts.
- `item-width`: the base width of each tile. Columns are derived from `wrapper-width / item-width`.
- `gap`: spacing between tiles, applied to both axes.
- `item-padding`: extra padding per tile. Accepts a number or `{ x: number; y: number }` for asymmetric spacing.

## Commands

- `pnpm docs:dev` — start the VitePress dev server for this documentation.
- `pnpm docs:build` — generate the static site output under `.vitepress/dist`.
- `pnpm docs:preview` — preview the built site locally.
