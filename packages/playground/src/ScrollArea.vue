<script setup lang="ts">
import type { MaybeComputedElementRef } from '@vueuse/core'
import { tryOnMounted, unrefElement, useElementBounding, useElementHover, useEventListener, useMediaQuery, useMouse, useParentElement, useResizeObserver, useScroll } from '@vueuse/core'
import { computed, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    height?: number
    barWidth?: number
    threshold?: number
  }>(),
  {
    barWidth: 8,
    threshold: 100,
  },
)
function useClientHeight(target: MaybeComputedElementRef, options: {
  initialWidth?: number
  initialHeight?: number
  listenOrientation?: boolean
} = {}) {
  const {
    initialWidth = Number.POSITIVE_INFINITY,
    listenOrientation = true,
  } = options

  const clientHeight = ref(initialWidth)
  const el = computed(() => unrefElement(target))
  const update = () => {
    if (el.value) {
      clientHeight.value = el.value.clientHeight
    }
  }

  update()
  tryOnMounted(update)
  useEventListener('resize', update, { passive: true })
  useResizeObserver(() => el.value, update)

  if (listenOrientation) {
    const matches = useMediaQuery('(orientation: portrait)')
    watch(matches, () => update())
  }

  return clientHeight
}

const parentElement = useParentElement()
const parentBounds = useElementBounding(parentElement)
const scrollBarIndicatorRef = ref<HTMLElement | null>()
const scrollBarIndicatorBounds = useElementBounding(() => scrollBarIndicatorRef.value)

const height = computed(() => props.height || parentBounds.height.value)
const scrollDomRef = ref<HTMLElement | null>()
const clientHeight = useClientHeight(() => scrollDomRef.value)
const { x, y } = useScroll(() => scrollDomRef.value)
const scrollableLength = computed(() => {
  return (scrollDomRef.value?.scrollHeight ?? 0) - (clientHeight.value ?? 0)
})
const barProgress = computed(() => y.value / scrollableLength.value || 0)
const scrollBarData = computed(() => {
  if (!scrollDomRef.value) {
    return null
  }
  const barHeight = clientHeight.value / scrollDomRef.value.scrollHeight * clientHeight.value
  const barTop = barProgress.value * (clientHeight.value)
  return {
    x: x.value,
    y: y.value,
    barHeight,
    barTop,
  }
})
const dragging = ref(false)
const dragStartY = ref(0)
const prevUserSelect = ref('')
const startScrollTop = ref(0)
const mouse = useMouse({ type: 'client' })
useEventListener(() => scrollBarIndicatorRef.value, 'pointerdown', (e) => {
  dragging.value = true
  dragStartY.value = e.clientY
  startScrollTop.value = y.value
  prevUserSelect.value = document.body.style.userSelect
  document.body.style.userSelect = 'none'
})

useEventListener(() => document, 'pointermove', () => {
  if (!dragging.value) {
    return
  }
  if ((props.threshold < scrollBarIndicatorBounds.left.value - mouse.x.value) || (mouse.x.value - scrollBarIndicatorBounds.right.value > props.threshold)) {
    y.value = startScrollTop.value
    return
  }
  const diff = mouse.y.value - dragStartY.value
  const progress = diff / clientHeight.value
  y.value = startScrollTop.value + progress * scrollableLength.value
})

useEventListener(() => document, 'pointerup', () => {
  dragging.value = false
  document.body.style.userSelect = prevUserSelect.value
})

defineExpose({
  $el: scrollDomRef,
})
const hover = useElementHover(() => scrollBarIndicatorRef.value)
</script>

<template>
  <div
    :style="{
      height: `${height}px`,
    }"
    style="overflow: hidden; max-height:fit-content"
  >
    <div
      v-if="scrollBarData"
      style="height: 100%;"
      :style="{
        right: '0px',
        zIndex: 999,
        width: `${barWidth}px`,
        backgroundColor: '#DDD0',
        height: '100%',
        position: 'absolute',
      }"
    >
      <div
        v-show="scrollBarData.barHeight < clientHeight"
        ref="scrollBarIndicatorRef"
        :style="{
          position: 'absolute',
          right: '0px',
          width: `${barWidth}px`,
          top: `${scrollBarData.barTop}px`,
          height: `${scrollBarData.barHeight}px`,
          backgroundColor: '#777A',
          filter: hover || dragging ? 'brightness(1.2)' : 'brightness(1)',
          borderRadius: '5px',
          zIndex: 999,
        }"
      />
    </div>
    <div
      ref="scrollDomRef"
      :style="{
        paddingRight: `${barWidth}px`,
        scrollbarWidth: 'none',
        height: '100%',
        overflowY: 'scroll',
        lineHeight: '0px',
      }"
    >
      <slot />
    </div>
  </div>
</template>
