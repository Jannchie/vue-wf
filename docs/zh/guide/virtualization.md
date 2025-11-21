# 虚拟化渲染

Vue WF 仅渲染可视区域附近的卡片，以保持长列表的滚动性能。通过以下设置可以在平滑度与节点数量之间取得平衡。

## 固定滚动区域

请在 **父级** 滚动容器上设置固定高度与 `overflow: auto`。默认情况下，Vue WF 会从父元素读取滚动容器；如果滚动节点在别处，可用 `scroll-element` 显式指定。

```vue
<template>
  <div style="height: 100vh; overflow: auto;">
    <Waterfall
      :items="items"
      :item-width="180"
      :gap="16"
      :range-expand="200"
    >
      <Card v-for="item, index in items" :key="index" :item="item" />
    </Waterfall>
  </div>
</template>
```

- `range-expand` 为可视区域上下增加像素缓冲。值越大预加载越多，跳动越少；为 `0` 时节点数量最少。
- 若滚动节点不是父元素，请将 `scroll-element` 传入对应的元素引用。

## 虚拟化调优

- `range-expand` 在平滑度与节点数量之间取舍，建议从 `100–300` 像素缓冲开始，根据卡片高度波动调整。
- 保持卡片高度可预测，`items` 提供准确的 `{ width, height }` 数据可以减少重排。
- 若有高度动画，避免剧烈变化或在变化后同步更新 `items`，以免虚拟化范围失准。

## 编程式滚动

通过模板 ref 获取 `scrollTo` 方法，可以在需要时跳转到任意位置。

```vue
<script setup lang="ts">
import { ref } from 'vue'
import Waterfall from 'vue-wf'

const waterfallRef = ref<InstanceType<typeof Waterfall> | null>(null)

function scrollToTop() {
  waterfallRef.value?.scrollTo(0, true)
}
</script>

<template>
  <Waterfall ref="waterfallRef" :items="items" :item-width="200" :gap="12" />
  <button type="button" @click="scrollToTop">返回顶部</button>
</template>
```
