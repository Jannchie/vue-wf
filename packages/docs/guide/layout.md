# Layout & sizing

Understand how Vue WF decides widths, columns, and padding so tiles line up across layouts.

## Width sources

- `wrapper-width` (optional): explicit wrapper width (px). When omitted, the wrapper stretches to its parent and measures that width. A `min-width` fallback avoids collapse during SSR and first render.
- `contentWidth`: internal width used for layout. Prefer `wrapper-width`; otherwise measured from the parent.

## Columns and tile width

- `cols` (default `6`): fixed column count; the layout always uses this number.
- `item-width` (optional): base tile width. When provided, `contentWidth = (itemWidth + itemPadding.x) * cols + gap * (cols - 1) + paddingX * 2`.
- Auto item width: when `item-width` is missing, `itemWidth = (contentWidth - paddingX * 2 - gap * (cols - 1) - itemPadding.x * cols) / cols`.

## Spacing

- `gap`: spacing between tiles on both axes.
- `item-padding`: per-tile padding. Accepts a number (both axes) or `{ x, y }`.
- `paddingX` / `paddingY`: outer padding for the whole grid.

## Recommended setups

- Responsive container: feed parent width into `wrapper-width` (e.g., via `ResizeObserver`), set the desired `cols`, and omit `item-width` so tiles auto-fit those columns.
- Fixed tile size: set `cols` and `item-width` to lock both count and width. Ensure the parent (or `wrapper-width`) is wide enough to avoid horizontal scroll.
- Grid-driven width: set `item-width` and `cols` when the container should expand to hold an exact grid (e.g., horizontal scrollers). The component computes `contentWidth` and applies it as `min-width`.
- Quick start: rely on parent width and the default `cols = 6`; tweak `cols` (and optionally `item-width`) to suit your layout.

## Keep measurements in sync

Update `wrapper-width` when the parent resizes to avoid layout jumps on responsive pages.

```vue
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import Waterfall from 'vue-wf'

const wrapperWidth = ref(0)
const wrapperRef = ref<HTMLElement | null>(null)

onMounted(() => {
  const observer = new ResizeObserver((entries) => {
    const entry = entries[0]
    if (entry?.contentRect?.width) {
      wrapperWidth.value = entry.contentRect.width
    }
  })
  if (wrapperRef.value) {
    observer.observe(wrapperRef.value)
  }
})
</script>

<template>
  <div
    ref="wrapperRef"
    style="height: 80vh; overflow: auto;"
  >
    <Waterfall
      :wrapper-width="wrapperWidth"
      :item-width="200"
      :items="items"
    />
  </div>
</template>
```
