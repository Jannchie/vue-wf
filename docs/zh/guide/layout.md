# 布局与尺寸

了解 Vue WF 如何确定宽度、列数与间距，以在不同布局下保持网格对齐。

## 宽度来源

- `wrapper-width`（可选）：显式容器宽度（px）。不传时，组件填满父级并测量父级宽度，同时有 `min-width` 回退保证首屏不塌缩。
- `contentWidth`：内部用于布局的宽度。优先使用 `wrapper-width`，否则取父级实测值。

## 列数与卡片宽度

- `cols`（默认 `6`）：固定列数，布局始终使用该值。
- `item-width`（可选）：单卡片基准宽度。传入时，`contentWidth = (itemWidth + itemPadding.x) * cols + gap * (cols - 1) + paddingX * 2`。
- 自动列宽：未传 `item-width` 时，`itemWidth = (contentWidth - paddingX * 2 - gap * (cols - 1) - itemPadding.x * cols) / cols`。

## 间距

- `gap`：卡片之间的横纵向间距。
- `item-padding`：卡片内补白，支持数字（双轴一致）或 `{ x, y }`。
- `paddingX` / `paddingY`：整个网格的外边距。

## 推荐组合

- 响应式容器：通过 `ResizeObserver` 等方式把父级宽度传给 `wrapper-width`，设定目标 `cols`，不传 `item-width`，让卡片宽度在这些列中自动平分。
- 固定卡片尺寸：同时设定 `cols` 和 `item-width`，锁定列数与单列宽度；确保父级或 `wrapper-width` 足够宽以避免横向滚动。
- 网格驱动宽度：同时给出 `item-width` 与 `cols`，让容器为精确列数展开（如水平滚动场景），组件会计算 `contentWidth` 并设置为 `min-width`。
- 快速体验：默认使用父级宽度与 `cols = 6`，后续按需求调整 `cols`（及可选的 `item-width`）。

## 尺寸同步

在响应式页面中父级宽度变化时，及时更新 `wrapper-width` 以避免布局抖动。

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
  <div ref="wrapperRef" style="height: 80vh; overflow: auto;">
    <Waterfall :wrapper-width="wrapperWidth" :item-width="200" :items="items" />
  </div>
</template>
```
