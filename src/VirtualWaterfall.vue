<script setup lang="ts">
import type { ComputedRef, MaybeRef } from 'vue'
import { useElementBounding, useParentElement, useScroll } from '@vueuse/core'
import { computed, ref, unref } from 'vue'
import { useClientWidth } from './useClientWidth'

const props = defineProps<{
  gap?: MaybeRef<number>
  wrapperWidth?: MaybeRef<number>
  itemWidth?: MaybeRef<number>
  cols?: MaybeRef<number>
  paddingX?: MaybeRef<number>
  paddingY?: MaybeRef<number>
  items: MaybeRef<{ width: number, height: number }[]>
  is?: MaybeRef<any>
  yGap?: MaybeRef<number>
  rangeExpand?: MaybeRef<number>
  scrollElement?: MaybeRef<HTMLElement | null>
}>()
const slots = defineSlots<{
  default: (props?: any) => any
}>()
const rangeExpand = computed(() => unref(props.rangeExpand) ?? 0)
const gap = computed(() => unref(props.gap) ?? 16)
const paddingX = computed(() => unref(props.paddingX) ?? 0)
const paddingY = computed(() => unref(props.paddingY) ?? 0)
const yGap = computed(() => unref(props.yGap) ?? 0)
const wrapper = ref<HTMLElement | null>(null)
const parent = useParentElement(wrapper)
const scrollElement = computed(() => unref(props.scrollElement) ?? parent.value)
const cols = computed(() => {
  return unref(props.cols) ?? 3
})

function isArray<T>(val: any): val is T[] {
  return Array.isArray(val)
}

const contentWidth = computed(() => {
  if (props.itemWidth) {
    return unref(props.itemWidth) * cols.value + gap.value * (cols.value - 1) + paddingX.value * 2
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
  return (contentWidth.value - paddingX.value * 2 - gap.value * (cols.value - 1)) / cols.value
})

const boundings = computed(() => {
  const itemsVal = unref(props.items)
  return itemsVal.map((d) => {
    if (d.width === 0 || itemWidth.value === 0) {
      return {
        width: itemWidth.value,
        height: itemWidth.value,
      }
    }
    const scale = itemWidth.value / d.width
    const height = d.height * scale + yGap.value
    return {
      width: itemWidth.value,
      height,
    }
  })
})

const clientWidth = useClientWidth(wrapper)
const paddingInner = computed(() => {
  return (clientWidth.value - contentWidth.value) / 2
})
function calculateWaterfallLayout(itemsRef: ComputedRef<{ width: number, height: number }[]>, columnCount: MaybeRef<number>, gap: MaybeRef<number>, paddingX: MaybeRef<number>) {
  const items = unref(itemsRef)
  const columnHeights = Array.from<number>({ length: unref(columnCount) }).fill(0) // 初始化列高度数组
  const itemPositions: {
    x: number
    y: number
    width: number
    height: number
  }[] = [] // 存储每个项目的坐标
  const offset = Math.max(0, contentWidth.value - unref(paddingX) * 2 - itemWidth.value * items.length - unref(gap) * (items.length)) / 2
  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    const columnIndex = columnHeights.indexOf(Math.min(...columnHeights)) // 找到最短的列
    const x = columnIndex * (itemWidth.value + unref(gap)) + unref(paddingX) + offset + unref(paddingInner)
    const y = columnHeights[columnIndex] + unref(paddingY)
    itemPositions.push({ x, y, width: item.width, height: item.height })
    // 更新列的高度
    columnHeights[columnIndex] += item.height + unref(gap)
  }
  return itemPositions
}

const layoutData = computed(() => {
  return calculateWaterfallLayout(boundings, cols, gap, paddingX)
})

const contentHeight = computed(() => {
  if (!isArray(layoutData.value)) {
    return 0
  }
  if (layoutData.value.length === 0) {
    return 0
  }
  return Math.max(...layoutData.value.map(it => it.y + it.height)) + paddingY.value * 2
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
const scroll = useScroll(scrollElement, { behavior })

const scrollBounds = useElementBounding(scrollElement)
const scrollVal = useScroll(scrollElement)
const wrapperBounds = useElementBounding(wrapper)
const relativeCoords = computed(() => {
  const relativeX = wrapperBounds.left.value - scrollBounds.left.value + scrollVal.x.value
  const relativeY = wrapperBounds.top.value - scrollBounds.top.value + scrollVal.y.value
  return {
    x: relativeX,
    y: relativeY,
  }
})

const yRange = computed(() => {
  const yRange = [
    scroll.y.value - rangeExpand.value,
    scroll.y.value + scrollBounds.height.value + rangeExpand.value,
  ]
  return yRange
})

const inRange = computed(() => {
  return layoutData.value.map((it) => {
    const top = it.y + relativeCoords.value.y
    const bottom = it.y + it.height + relativeCoords.value.y
    return (top >= yRange.value[0] && top <= yRange.value[1]) || (bottom >= yRange.value[0] && bottom <= yRange.value[1]) || (top <= yRange.value[0] && bottom >= yRange.value[1])
  })
})

const childrenList = computed(() => {
  const children: any = []
  allSlots.value.forEach((slot: any, i: number) => {
    if (isArray(slot.children)) {
      slot.children.forEach((child: any, i: number) => {
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
const contentDom = ref<HTMLElement>()
defineExpose({
  scroll,
  scrollTo: (top: number, smooth = false) => {
    const prev = _smooth.value
    _smooth.value = smooth
    scroll.y.value = top
    _smooth.value = prev
  },
  wrapper,
  contentDom,
  layoutData,
})
</script>

<template>
  <div
    ref="wrapper"
    class="vue-wf-waterfall"
    :style="{
      position: 'relative',
    }"
  >
    <div
      ref="contentDom"
      class="vue-wf-waterfall-content"
      :style="{
        width: `${contentWidth}px`,
        height: `${contentHeight}px`,
        minHeight: '100%',
        position: 'relative',
      }"
    >
      <div
        v-for="[it, i] in childrenList"
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
  </div>
</template>
