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
</script>

<template>
  <div
    style="height: 80vh; width:100dvw; overflow: auto"
  >
    <Waterfall
      :scroll-element="wrapper"
      :gap="4"
      :item-width="width"
      :items="items"
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
</template>
