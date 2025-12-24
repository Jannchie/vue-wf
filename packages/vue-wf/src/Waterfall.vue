<script setup lang="ts">
import type { ComputedRef, MaybeRef } from 'vue'
import { useElementBounding, useParentElement, useScroll, useWindowSize } from '@vueuse/core'
import { cloneVNode, computed, Fragment, ref, unref, useAttrs } from 'vue'
import { useClientWidth } from './useClientWidth'

type ItemPadding = number | {
  x?: number
  y?: number
}
type LayoutMode = 'waterfall' | 'square'

const props = defineProps<{
  gap?: MaybeRef<number>
  wrapperWidth?: MaybeRef<number>
  itemWidth?: MaybeRef<number>
  cols?: MaybeRef<number>
  paddingX?: MaybeRef<number>
  paddingY?: MaybeRef<number>
  items: MaybeRef<{ width: number, height?: number }[]>
  is?: MaybeRef<any>
  itemPadding?: MaybeRef<ItemPadding>
  /**
   * @deprecated Use itemPadding.y instead.
   */
  yGap?: MaybeRef<number>
  rangeExpand?: MaybeRef<number>
  scrollElement?: MaybeRef<HTMLElement | Window | Document | null>
  layout?: MaybeRef<LayoutMode>
}>()
const slots = defineSlots<{
  default: (properties_?: any) => any
}>()
const rangeExpand = computed(() => unref(props.rangeExpand) ?? 0)
const gap = computed(() => unref(props.gap) ?? 0)
const paddingX = computed(() => unref(props.paddingX) ?? 0)
const paddingY = computed(() => unref(props.paddingY) ?? 0)
const wrapper = ref<HTMLElement | null>(null)
const parent = useParentElement(wrapper)
const scrollElement = computed(() => unref(props.scrollElement) ?? parent.value ?? null)
const scrollElementForBounds = computed<HTMLElement | null>(() => {
  const target = unref(scrollElement)
  if (typeof HTMLElement !== 'undefined' && target instanceof HTMLElement) {
    return target
  }
  if (typeof document !== 'undefined') {
    return document.documentElement
  }
  return null
})
const clientWidth = useClientWidth(wrapper)
const attrs = useAttrs()
const cols = computed(() => {
  return unref(props.cols) ?? 6
})
const itemPadding = computed(() => {
  const resolved = unref(props.itemPadding)
  if (typeof resolved === 'number') {
    return {
      x: resolved,
      y: resolved,
    }
  }
  const legacyYGap = props.yGap === undefined ? 0 : (unref(props.yGap) ?? 0)
  return {
    x: resolved?.x ?? 0,
    y: resolved?.y ?? legacyYGap,
  }
})
const layoutMode = computed<LayoutMode>(() => {
  const mode = unref(props.layout)
  if (mode === 'square') {
    return mode
  }
  return 'waterfall'
})

function isArray<T>(value: any): value is T[] {
  return Array.isArray(value)
}

function flattenSlotChildren(children: any): any[] {
  if (!children) {
    return []
  }
  if (isArray(children)) {
    const result: any[] = []
    for (const child of children) {
      result.push(...flattenSlotChildren(child))
    }
    return result
  }
  if (children.type === Fragment && isArray(children.children)) {
    return flattenSlotChildren(children.children)
  }
  return [children]
}

const contentWidth = computed(() => {
  if (props.itemWidth !== undefined) {
    return (unref(props.itemWidth) + itemPadding.value.x) * cols.value + gap.value * (cols.value - 1) + paddingX.value * 2
  }
  if (props.wrapperWidth !== undefined) {
    return unref(props.wrapperWidth)
  }
  if (Number.isFinite(clientWidth.value)) {
    return clientWidth.value
  }
  return wrapper.value?.clientWidth ?? wrapper.value?.parentElement?.clientWidth ?? 0
})

const normalizedItems = computed(() => {
  const rawItems = unref(props.items)
  if (!isArray(rawItems)) {
    console.warn('[Waterfall] `items` must be an array of objects with numeric `width` and `height`.')
    return []
  }
  return rawItems.map((item, index) => {
    const width = Number((item as Record<string, any>)?.width)
    const heightValue = Number((item as Record<string, any>)?.height)
    const hasWidth = Number.isFinite(width)
    const hasHeight = Number.isFinite(heightValue)
    if (!hasWidth) {
      console.warn(`[Waterfall] items[${index}] is missing a numeric width.`, item)
    }
    if (!hasHeight && layoutMode.value === 'waterfall') {
      console.warn(`[Waterfall] items[${index}] is missing a numeric height.`, item)
    }
    let resolvedHeight = 0
    if (hasHeight) {
      resolvedHeight = heightValue
    }
    else if (layoutMode.value === 'square' && hasWidth) {
      resolvedHeight = width
    }
    return {
      width: hasWidth ? width : 0,
      height: resolvedHeight,
    }
  })
})

const itemWidth = computed(() => {
  if (props.itemWidth) {
    return unref(props.itemWidth)
  }
  return (contentWidth.value - paddingX.value * 2 - gap.value * (cols.value - 1) - itemPadding.value.x * cols.value) / cols.value
})
const layoutItemWidth = computed(() => itemWidth.value + itemPadding.value.x)

const boundings = computed(() => {
  const itemsValue = normalizedItems.value
  if (layoutMode.value === 'square') {
    const height = itemWidth.value + itemPadding.value.y
    return itemsValue.map(() => ({
      width: layoutItemWidth.value,
      height,
    }))
  }
  return itemsValue.map((d) => {
    if (d.width === 0 || itemWidth.value === 0) {
      return {
        width: layoutItemWidth.value,
        height: itemWidth.value + itemPadding.value.y,
      }
    }
    const scale = itemWidth.value / d.width
    const height = d.height * scale + itemPadding.value.y
    return {
      width: layoutItemWidth.value,
      height,
    }
  })
})

const paddingInner = computed(() => {
  return (clientWidth.value - contentWidth.value) / 2
})
const explicitWrapperWidth = computed(() => {
  if (props.wrapperWidth === undefined) {
    return
  }
  return unref(props.wrapperWidth)
})
const resolvedWrapperWidth = computed(() => {
  if (explicitWrapperWidth.value !== undefined) {
    return explicitWrapperWidth.value
  }
  if (props.itemWidth && props.cols) {
    return contentWidth.value
  }
  return 400
})
const externalStyle = computed(() => {
  const style = (attrs as Record<string, any>).style
  return style
})
const wrapperAttrs = computed(() => {
  const { style, ...rest } = attrs as Record<string, any>
  return rest
})
function calculateWaterfallLayout(
  itemsReference: ComputedRef<{ width: number, height: number }[]>,
  columnCount: MaybeRef<number>,
  gap: MaybeRef<number>,
  paddingX: MaybeRef<number>,
) {
  const items = unref(itemsReference)
  if (items.length === 0) {
    return []
  }
  const totalColumns = Math.max(1, unref(columnCount))
  const visibleColumns = Math.min(totalColumns, items.length)
  const columnHeights = Array.from<number>({ length: totalColumns }).fill(0)
  const itemPositions: {
    x: number
    y: number
    width: number
    height: number
  }[] = []
  const visibleWidth = layoutItemWidth.value * visibleColumns + unref(gap) * (visibleColumns - 1)
  const offset = Math.max(0, contentWidth.value - unref(paddingX) * 2 - visibleWidth) / 2
  for (const item of items) {
    let columnIndex = 0
    let minHeight = columnHeights[0]
    for (let index = 1; index < columnHeights.length; index++) {
      const height = columnHeights[index]
      if (height < minHeight) {
        minHeight = height
        columnIndex = index
      }
    }
    const x = columnIndex * (layoutItemWidth.value + unref(gap)) + unref(paddingX) + offset + unref(paddingInner)
    const y = columnHeights[columnIndex] + unref(paddingY)
    itemPositions.push({ x, y, width: item.width, height: item.height })
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

const itemContentStyle = computed(() => {
  const style: Record<string, string> = {
    width: `${itemWidth.value}px`,
  }
  if (layoutMode.value === 'square') {
    style.height = `${itemWidth.value}px`
  }
  return style
})

function getItemStyle(index: number) {
  if (!isArray(layoutData.value)) {
    return {}
  }
  const current = layoutData.value[index]
  if (!current) {
    return {}
  }
  return {
    left: `${current.x ?? 0}px`,
    top: `${current.y ?? 0}px`,
    width: `${layoutItemWidth.value}px`,
    maxWidth: `${layoutItemWidth.value}px`,
  }
}
const _smooth = ref(false)
const behavior = computed(() => _smooth.value ? 'smooth' : 'auto')
const scroll = useScroll(scrollElement, { behavior })

const scrollBounds = useElementBounding(scrollElementForBounds)
const windowSize = useWindowSize()
const isViewportScroll = computed(() => {
  const target = unref(scrollElement)
  if (!target) {
    return false
  }
  if (globalThis.window !== undefined && target === globalThis.window) {
    return true
  }
  if (typeof document !== 'undefined' && target === document) {
    return true
  }
  if (typeof document !== 'undefined' && target === document.documentElement) {
    return true
  }
  if (typeof document !== 'undefined' && target === document.body) {
    return true
  }
  return false
})
const scrollBoundsLeft = computed(() => (isViewportScroll.value ? 0 : scrollBounds.left.value))
const scrollBoundsTop = computed(() => (isViewportScroll.value ? 0 : scrollBounds.top.value))
const scrollBoundsHeight = computed(() => (
  isViewportScroll.value ? windowSize.height.value : scrollBounds.height.value
))
const wrapperBounds = useElementBounding(wrapper)
const relativeCoords = computed(() => {
  const relativeX = wrapperBounds.left.value - scrollBoundsLeft.value + scroll.x.value
  const relativeY = wrapperBounds.top.value - scrollBoundsTop.value + scroll.y.value
  return {
    x: relativeX,
    y: relativeY,
  }
})

const yRange = computed(() => {
  const yRange = [
    scroll.y.value - rangeExpand.value,
    scroll.y.value + scrollBoundsHeight.value + rangeExpand.value,
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
  const flattened = flattenSlotChildren(allSlots.value)
  const children: any = []
  for (const [index, element] of flattened.entries()) {
    if (!inRange.value[index]) {
      continue
    }
    children.push([cloneVNode(element), index])
  }
  return children
})
const contentDom = ref<HTMLElement>()
defineExpose({
  scroll,
  scrollTo: (top: number, smooth = false) => {
    const previous = _smooth.value
    _smooth.value = smooth
    scroll.y.value = top
    _smooth.value = previous
  },
  wrapper,
  contentDom,
  layoutData,
})
</script>

<template>
  <div
    ref="wrapper"
    v-bind="wrapperAttrs"
    :style="[{
      position: 'relative',
      width: explicitWrapperWidth !== undefined ? `${explicitWrapperWidth}px` : undefined,
      minWidth: explicitWrapperWidth === undefined && resolvedWrapperWidth !== undefined ? `${resolvedWrapperWidth}px` : undefined,
    }, externalStyle]"
  >
    <div
      ref="contentDom"
      :style="{
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
          :style="itemContentStyle"
        />
      </div>
    </div>
  </div>
</template>
