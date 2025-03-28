<script setup lang="ts">
import type { ComputedRef, MaybeRef } from 'vue'
import { useElementBounding, useMutationObserver, useParentElement, useResizeObserver, useScroll } from '@vueuse/core'
import { computed, nextTick, onMounted, ref, unref, watch } from 'vue'
import { useClientWidth } from './useClientWidth'

const props = defineProps<{
  gap?: MaybeRef<number>
  wrapperWidth?: MaybeRef<number>
  itemWidth?: MaybeRef<number>
  cols?: MaybeRef<number>
  paddingX?: MaybeRef<number>
  paddingY?: MaybeRef<number>
  items?: MaybeRef<{ width: number, height: number }[]>
  is?: MaybeRef<any>
  yGap?: MaybeRef<number>
  rangeExpand?: MaybeRef<number>
  scrollElement?: MaybeRef<HTMLElement | null>
  autoMeasure?: MaybeRef<boolean>
  resizeDebounce?: MaybeRef<number>
}>()

const slots = defineSlots<{
  default: (props?: any) => any
}>()
const rangeExpand = computed(() => unref(props.rangeExpand) ?? 0)
const gap = computed(() => unref(props.gap) ?? 16)
const paddingX = computed(() => unref(props.paddingX) ?? 0)
const paddingY = computed(() => unref(props.paddingY) ?? 0)
const yGap = computed(() => unref(props.yGap) ?? 0)
const resizeDebounce = computed(() => unref(props.resizeDebounce) ?? 200)
const wrapper = ref<HTMLElement | null>(null)
const parent = useParentElement(wrapper)
const scrollElement = computed(() => unref(props.scrollElement) ?? parent.value)
const cols = computed(() => {
  return unref(props.cols) ?? 3
})

const autoMeasure = computed(() => unref(props.autoMeasure) ?? !props.items)

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

// 存储自动测量的元素尺寸
const measuredItems = ref<{ width: number, height: number }[]>([])
const isInitialMeasureDone = ref(false)
const renderedItemRefs = ref<HTMLElement[]>([])

// 计算最终使用的items
const finalItems = computed(() => {
  if (autoMeasure.value) {
    return measuredItems.value
  }
  return unref(props.items) || []
})

const boundings = computed(() => {
  const itemsVal = finalItems.value
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

const allSlots = computed(() => {
  return slots.default?.() ?? []
})

const contentHeight = computed(() => {
  if (!isArray(layoutData.value)) {
    return 0
  }

  if (layoutData.value.length === 0) {
    // 当没有布局数据时，尝试更准确地估计
    if (autoMeasure.value && allSlots.value.length > 0) {
      if (isInitialMeasureDone.value && measuredItems.value.length > 0) {
        // 如果已完成测量但layoutData还没更新，使用测量结果估计
        const itemCount = measuredItems.value.length
        const columnsNeeded = Math.min(cols.value, itemCount)
        const itemsPerColumn = Math.ceil(itemCount / columnsNeeded)

        // 计算每列的大致高度
        const averageHeight = measuredItems.value.reduce((sum, item) =>
          sum + (item.height * itemWidth.value / item.width), 0) / itemCount

        return itemsPerColumn * (averageHeight + gap.value) + paddingY.value * 2
      }
      else {
        // 测量未完成，返回最小高度，避免过度估计
        return paddingY.value * 2
      }
    }
    return paddingY.value * 2 // 最小高度
  }

  return Math.max(...layoutData.value.map(it => it.y + it.height)) + paddingY.value * 2
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
const measureDom = ref<HTMLElement>()

// 防抖函数
function debounce(fn: (...args: any[]) => void, wait: number) {
  let timer: ReturnType<typeof setTimeout> | null = null
  return function (...args: any[]) {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      fn(...args)
    }, wait)
  }
}

// 延迟执行测量的函数
const debouncedMeasure = debounce(() => {
  measureElements()
}, resizeDebounce.value)

// 重新测量元素尺寸的方法
function measureElements() {
  if (!autoMeasure.value) {
    return
  }

  let newMeasuredItems: { width: number, height: number }[] = []
  let measurementSuccessful = false

  if (measureDom.value && measureDom.value.children.length > 0) {
    const elements = measureDom.value.children
    newMeasuredItems = Array.from(elements).map((el: Element) => {
      const htmlEl = el as HTMLElement
      const width = htmlEl.offsetWidth || itemWidth.value
      const height = htmlEl.offsetHeight || width

      if (htmlEl.offsetWidth > 0 && htmlEl.offsetHeight > 0) {
        measurementSuccessful = true
      }

      return { width, height }
    })
  }
  else if (renderedItemRefs.value.length > 0) {
    newMeasuredItems = renderedItemRefs.value.map((el) => {
      const width = el.offsetWidth || itemWidth.value
      const height = el.offsetHeight || width

      if (el.offsetWidth > 0 && el.offsetHeight > 0) {
        measurementSuccessful = true
      }

      return { width, height }
    })
  }

  if (newMeasuredItems.length > 0) {
    measuredItems.value = newMeasuredItems

    // 只有真正测量成功才标记为完成
    if (measurementSuccessful) {
      isInitialMeasureDone.value = true
    }
  }
}

// 注册元素引用的方法
function registerItemRef(el: HTMLElement, index: number) {
  if (!el) {
    return
  }

  // 确保数组长度足够
  while (renderedItemRefs.value.length <= index) {
    renderedItemRefs.value.push(null as unknown as HTMLElement)
  }

  // 更新引用
  renderedItemRefs.value[index] = el

  // 监听该元素的尺寸变化
  if (autoMeasure.value) {
    useResizeObserver(el, debouncedMeasure)

    // 监听图片加载完成
    const images = el.querySelectorAll('img')
    if (images.length > 0) {
      images.forEach((img) => {
        if (img.complete) {
          debouncedMeasure()
        }
        else {
          img.addEventListener('load', debouncedMeasure)
          img.addEventListener('error', debouncedMeasure)
        }
      })
    }
  }
}

// 为了监听DOM变化，使用MutationObserver
if (typeof window !== 'undefined') {
  useMutationObserver(measureDom, () => {
    if (autoMeasure.value) {
      debouncedMeasure()
    }
  }, {
    attributes: true,
    childList: true,
    subtree: true,
    characterData: true,
  })
}

// 当组件被挂载后，进行初始测量
onMounted(() => {
  if (autoMeasure.value) {
    nextTick(() => {
      measureElements()

      // 监听wrapper尺寸变化
      if (wrapper.value) {
        useResizeObserver(wrapper, debouncedMeasure)
      }
    })
  }
})

// 监听插槽内容变化
watch(allSlots, () => {
  if (autoMeasure.value) {
    nextTick(() => {
      debouncedMeasure()
    })
  }
}, { deep: true })

// 监听itemWidth变化
watch(itemWidth, () => {
  if (autoMeasure.value) {
    nextTick(() => {
      debouncedMeasure()
    })
  }
})

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
  measuredItems,
  measureElements,
  isInitialMeasureDone,
  refreshLayout: debouncedMeasure,
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
    <!-- Measurement container (only in auto-measure mode) -->
    <div
      v-if="autoMeasure"
      ref="measureDom"
      class="vue-wf-waterfall-measure"
      :style="{
        display: 'flex',
        position: 'absolute',
        visibility: isInitialMeasureDone ? 'hidden' : 'visible',
        pointerEvents: 'none',
        zIndex: -1,
        width: `${itemWidth}px`,
        opacity: 0.01,
        left: 0,
        top: 0,
        overflow: 'hidden',
      }"
    >
      <component
        :is="slot"
        v-for="(slot, i) in allSlots.slice(0, measuredItems.length || allSlots.length)"
        :key="`measure-${i}`"
      />
    </div>

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
        :ref="el => registerItemRef(el as HTMLElement, i as number)"
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
