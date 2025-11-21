import type { MaybeComputedElementRef } from '@vueuse/core'
import { tryOnMounted, unrefElement, useEventListener, useMediaQuery, useResizeObserver } from '@vueuse/core'
import { computed, ref, watch } from 'vue'

export function useClientWidth(target: MaybeComputedElementRef, options: {
  initialWidth?: number
  initialHeight?: number
  listenOrientation?: boolean
} = {}) {
  const {
    initialWidth = 0,
    listenOrientation = true,
  } = options

  const clientWidth = ref(initialWidth)
  const element = computed(() => unrefElement(target))
  const update = () => {
    if (element.value) {
      clientWidth.value = element.value.clientWidth
    }
  }

  update()
  tryOnMounted(update)
  useEventListener('resize', update, { passive: true })
  useResizeObserver(() => element.value, update)

  if (listenOrientation) {
    const matches = useMediaQuery('(orientation: portrait)')
    watch(matches, () => update())
  }

  return clientWidth
}
