<script setup lang="ts">
import { computed, ref } from 'vue'
import { Waterfall } from 'vue-wf'

const tmps = ref(Array.from({ length: 100 }))
const heights = [50, 100, 200, 300, 400]
const width = 200

const items = computed(() => tmps.value.map(() => {
  const height = heights[Math.floor(Math.random() * heights.length)]
  return {
    width,
    height,
    src: `https://picsum.photos/${width}/${height}?random=${Math.random()}`,
  }
}))
const wrapper = ref()
</script>

<template>
  <div
    ref="wrapper"
    style="display: flex; gap: 20px;  overflow:auto"
  >
    <div style="height: 80vh">
      <Waterfall
        :scroll-element="wrapper"
        :gap="4"
        :item-width="width"
      >
        <img
          v-for="item, i in items"
          :key="i"
          :src="item.src"
          :style="{
            display: 'inline-block',
            height: `100%`,
            backgroundImage: `url(${item.src})`,
          }"
        >
      </Waterfall>
    </div>
  </div>
</template>
