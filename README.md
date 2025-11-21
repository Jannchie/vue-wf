# Vue WF

[![CodeTime badge](https://img.shields.io/endpoint?style=social&url=https%3A%2F%2Fapi.codetime.dev%2Fshield%3Fid%3D2%26project%3Dvue-wf%26in%3D0)](https://codetime.dev)

<p align="center" style="overflow: hidden; border-radius:">
  <img src="packages/docs/public/example.png" alt="Example">
</p>

## Install

```bash
pnpm install vue-wf
```

## Usage

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

### Props

- `item-padding`: extra space around each item (useful for captions or badges). Accepts a number for both axes or an object `{ x, y }`. The legacy `y-gap` prop now maps to `item-padding.y`.
- `items`: array of `{ width, height }` objects. Both fields are required numbers and are validated at runtime.

### Virtual rendering tips

- Set the outer container to a fixed height with `overflow: auto` (e.g., `height: 100vh; overflow: auto;`). This allows the component to measure the viewport and only render items inside (plus the `rangeExpand` buffer).
- If `rangeExpand` is set to `0`, only the items currently in view are rendered. Increase it to preload items above/below the viewport for smoother scrolling.

## Packages

- `packages/vue-wf`: core library source and build artifacts.
- `packages/docs`: VitePress documentation site.
- `packages/playground`: interactive playground project.

## Development

```bash
pnpm install
pnpm build
pnpm dev:all
```
