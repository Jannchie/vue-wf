<script setup lang="ts">
import { useScroll } from '@vueuse/core'
import type { ComputedRef, MaybeRef } from 'vue'
import { computed, ref, unref, useSlots } from 'vue'

const props = defineProps<{
  gap?: MaybeRef<number>
  wrapperWidth?: MaybeRef<number>
  itemWidth?: MaybeRef<number>
  rowCount?: MaybeRef<number>
  paddingX?: MaybeRef<number>
  is?: MaybeRef<any>
  items: MaybeRef<{ width: number, height: number }[]>
  rangeExpand?: MaybeRef<number>
}>()
const rangeExpand = computed(() => unref(props.rangeExpand) ?? 0)
const slots = useSlots()
const gap = computed(() => unref(props.gap) ?? 16)
const rowCount = computed(() => unref(props.rowCount) ?? 3)
const paddingX = computed(() => unref(props.paddingX) ?? 0)
const wrapper = ref<any>()
const wrapperDom = computed<any>(() => {
  if (wrapper.value && wrapper.value.$el) {
    return wrapper.value.$el
  }
  return wrapper.value
})

function isArray<T>(val: any): val is T[] {
  return Array.isArray(val)
}

const wrapperWidth = computed(() => {
  if (props.itemWidth) {
    return unref(props.itemWidth) * rowCount.value + gap.value * (rowCount.value - 1) + paddingX.value * 2
  }
  if (props.wrapperWidth) {
    return unref(props.wrapperWidth)
  }
  return wrapperDom.value?.parentElement?.clientWidth ?? 0
})

const itemWidth = computed(() => {
  if (props.itemWidth) {
    return unref(props.itemWidth)
  }
  return (wrapperWidth.value - paddingX.value * 2 - gap.value * (rowCount.value - 1)) / rowCount.value
})

const boundings = computed(() => {
  const itemsVal = unref(props.items)
  return itemsVal.map((d) => {
    const scale = itemWidth.value / d.width
    return {
      width: itemWidth.value,
      height: d.height * scale,
    }
  })
})

function calculateWaterfallLayout(itemsRef: ComputedRef<{ width: number, height: number }[]>, columnCount: MaybeRef<number>, gap: MaybeRef<number>, paddingX: MaybeRef<number>) {
  const items = unref(itemsRef)
  const columnHeights = Array.from<number>({ length: unref(columnCount) }).fill(0) // 初始化列高度数组
  const itemPositions = [] // 存储每个项目的坐标
  const offset = Math.max(0, wrapperWidth.value - unref(paddingX) * 2 - itemWidth.value * items.length - unref(gap) * (items.length)) / 2

  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    const columnIndex = columnHeights.indexOf(Math.min(...columnHeights)) // 找到最短的列
    const x = columnIndex * (itemWidth.value + unref(gap)) + unref(paddingX) + offset
    const y = columnHeights[columnIndex] // 计算 y 坐标
    itemPositions.push({ x, y, width: item.width, height: item.height })
    // 更新列的高度
    columnHeights[columnIndex] += item.height + unref(gap)
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

const _smooth = ref(false)
const behavior = computed(() => _smooth.value ? 'smooth' : 'auto')
const scroll = useScroll(wrapperDom, {
  behavior,
})
const yRange = computed(() => {
  return [
    scroll.y.value - rangeExpand.value,
    scroll.y.value + (wrapperDom.value?.clientHeight ?? 0) + rangeExpand.value,
  ]
})

const inRange = computed(() => {
  return layoutData.value.map((it) => {
    const top = it.y
    const bottom = it.y + it.height
    return top >= yRange.value[0] && top <= yRange.value[1] || bottom >= yRange.value[0] && bottom <= yRange.value[1] || top <= yRange.value[0] && bottom >= yRange.value[1]
  })
})

const childrenList = computed(() => {
  const children: any = []
  allSlots.value.forEach((slot, i) => {
    if (isArray(slot.children)) {
      slot.children.forEach((child, i) => {
        if (!inRange.value[i]) {
          return
        }
        children.push([child, i])
      })
    }
    else {
      if (!inRange.value[i]) {
        return
      }
      children.push([slot, i])
    }
  })
  return children
})
defineExpose({
  scroll,
  scrollTo: (top: number, smooth = false) => {
    const prev = _smooth.value
    _smooth.value = smooth
    scroll.y.value = top
    _smooth.value = prev
  },
})
const wrapperIs = computed(() => props.is ?? 'div')
</script>

<template>
  <component
    :is="wrapperIs"
    ref="wrapper"
    :style="{
      position: 'relative',
    }"
  >
    <div
      :style="{
        height: `${wrapperHeight}px`,
        width: `${wrapperWidth}px`,
        margin: '0 auto',
        position: 'relative',
      }"
    >
      <div
        v-for="[it, i] in childrenList"
        :key="it"
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
  </component>
</template>
