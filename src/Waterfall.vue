<script setup lang="ts">
import { useElementSize } from '@vueuse/core'
import type { MaybeRef, Ref } from 'vue'
import { computed, ref, unref, useSlots } from 'vue'

const props = defineProps<{
  gap?: MaybeRef<number>
  wrapperWidth?: MaybeRef<number>
  itemWidth?: MaybeRef<number>
  rowCount?: MaybeRef<number>
  paddingX?: MaybeRef<number>
}>()
const slots = useSlots()
const gap = computed(() => unref(props.gap) ?? 16)
const rowCount = computed(() => unref(props.rowCount) ?? 3)
const paddingX = computed(() => unref(props.paddingX) ?? 0)
const wrapper = ref<HTMLDivElement>()

function isArray<T>(val: any): val is T[] {
  return Array.isArray(val)
}

const itemsRef = ref([])
const boundings = computed(() => {
  const itemsVal = itemsRef.value
  return Array.from(itemsVal).map((item) => {
    return useElementSize(item)
  })
})

const wrapperWidth = computed(() => {
  if (props.itemWidth) {
    return unref(props.itemWidth) * rowCount.value + gap.value * (rowCount.value - 1) + paddingX.value * 2
  }
  if (props.wrapperWidth) {
    return unref(props.wrapperWidth)
  }
  return wrapper.value?.parentElement?.clientWidth ?? 0
})

const itemWidth = computed(() => {
  if (props.itemWidth) {
    return unref(props.itemWidth)
  }
  return (wrapperWidth.value - paddingX.value * 2 - gap.value * (rowCount.value - 1)) / rowCount.value
})

function calculateWaterfallLayout(itemsRef: Ref<{ width: Ref<number>, height: Ref<number> }[]>, columnCount: MaybeRef<number>, gap: MaybeRef<number>, paddingX: MaybeRef<number>) {
  const items = unref(itemsRef)
  const columnHeights = Array.from<number>({ length: unref(columnCount) }).fill(0) // 初始化列高度数组
  const itemPositions = [] // 存储每个项目的坐标
  const offset = Math.max(0, wrapperWidth.value - unref(paddingX) * 2 - itemWidth.value * items.length - unref(gap) * (items.length)) / 2

  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    const columnIndex = columnHeights.indexOf(Math.min(...columnHeights)) // 找到最短的列
    const x = columnIndex * (itemWidth.value + unref(gap)) + unref(paddingX) + offset
    const y = columnHeights[columnIndex] // 计算 y 坐标
    itemPositions.push({ x, y, width: item.width.value, height: item.height.value })
    // 更新列的高度
    columnHeights[columnIndex] += item.height.value + unref(gap)
  }
  return itemPositions
}

const layoutData = computed(() => {
  return calculateWaterfallLayout(boundings, rowCount, gap, paddingX)
})

const wrapperHeight = computed(() => {
  if (!isArray(layoutData.value)) {
    return 0
  }
  return Math.max(...layoutData.value.map(it => it.y + it.height))
})

const allSlots = computed(() => {
  return slots.default?.() ?? []
})
const childrenList = computed(() => {
  const children: any = []
  allSlots.value.forEach((slot) => {
    if (isArray(slot.children)) {
      slot.children.forEach((child) => {
        children.push(child)
      })
    }
    else {
      children.push(slot)
    }
  })
  return children
})

function getItemStyle(i: number) {
  if (!isArray(layoutData.value)) {
    return {}
  }
  const current = layoutData.value[i]
  if (!current) {
    return {}
  }
  return {
    left: `${current.x ?? 0}px`,
    top: `${current.y ?? 0}px`,
    maxWidth: `${itemWidth.value}px`,
  }
}
</script>

<template>
  <div
    ref="wrapper"
    :style="{
      position: 'relative',
      overflowX: 'clip',
      width: `${wrapperWidth}px`,
      height: `${wrapperHeight}px`,
    }"
  >
    <div
      v-for="it, i in childrenList"
      ref="itemsRef"
      :key="i"
      :style="getItemStyle(i as number)"
      style="position: absolute;"
    >
      <component
        :is="it"
        :style="{
          width: `${itemWidth}px`,
        }"
      />
    </div>
  </div>
</template>
