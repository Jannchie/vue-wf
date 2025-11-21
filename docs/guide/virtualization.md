# Virtualization

Vue WF keeps rendering work minimal by limiting DOM nodes to what is visible in the scroll container plus a buffer. Tune the settings below to balance performance and visual smoothness.

## Set a fixed scroll area

Apply a fixed height and `overflow: auto` on the **parent** scroll container. By default Vue WF reads the scrolling element from its parent; you can override it with `scroll-element` when the scrollable node is elsewhere.

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

- `range-expand` adds a pixel buffer above and below the viewport. Increase it to preload items and reduce pop-in while scrolling quickly. Leave it at `0` for the maximum node reduction.
- When the scrollable node is not the direct parent, set `scroll-element` to the element ref you want the component to observe.

## Tuning virtualization

- `range-expand` trades extra DOM nodes for smoother fast scrolling; start with `100–300` depending on card height variance.
- Keep item heights deterministic. Supplying `items` with accurate `{ width, height }` lets the virtualizer avoid reflows.
- If you animate heights, prefer transitions that do not drastically change measured height or update `items` when size changes.

## Programmatic scrolling

Use a template ref to access the exposed `scrollTo` helper when you need to jump to a specific offset.

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
  <button type="button" @click="scrollToTop">Back to top</button>
</template>
```
