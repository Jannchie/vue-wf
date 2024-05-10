<script setup lang="ts">
import { computed, onMounted, ref, watchEffect } from 'vue'
import Waterfall from 'vue-wf'

const tmps = ref([0])
const heights = [50, 100, 200, 300, 400]
const width = 100

onMounted(() => {
  tmps.value = Array.from({ length: 100 })
  setTimeout(() => {
    tmps.value = Array.from({ length: 10 })
  }, 300)
})

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
  <Waterfall
    :wrapper-width="400"
    :item-width="width"
    :gap="20"
  >
    <img

      v-for="item, i in items"
      :key="i"
      :src="item.src"
      :style="{
        display: 'inline-block',
        height: `100%`,
      }"
    >
  </Waterfall>
</template>
