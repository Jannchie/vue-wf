<script setup lang="ts">
const heights = [50, 100, 200, 300, 400]
const width = 100
const height = heights[Math.floor(Math.random() * heights.length)]
const src = `https://picsum.photos/${width}/${height}?random=${Math.random()}`
</script>

<template>
  <div
    :style="{
      height: `${height / width * 100}px`,
      backgroundImage: `url(${src})`,
    }"
  />
</template>
