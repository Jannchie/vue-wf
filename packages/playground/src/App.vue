<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { Waterfall } from 'vue-wf'

type LayoutMode = 'waterfall' | 'square'

interface ControlState {
  cols: number
  gap: number
  paddingX: number
  paddingY: number
  itemPaddingX: number
  itemPaddingY: number
  rangeExpand: number
}

interface DemoItem {
  width: number
  height: number
  src?: string
}

type NumberControlKey = 'cols' | 'gap' | 'paddingX' | 'paddingY' | 'itemPaddingX' | 'itemPaddingY' | 'rangeExpand'

const baseWidth = 600
const heroHeight = 800
const placeholders = ref(Array.from({ length: 100 }))
const ratios = [0.65, 0.8, 0.95, 1.05, 1.2, 1.35, 1.5]
const heights = ratios.map(ratio => ratio * baseWidth)
const loadedSet = ref<Set<number>>(new Set([0]))
const layoutMode = ref<LayoutMode>('waterfall')

const controls = reactive<ControlState>({
  cols: 4,
  gap: 12,
  paddingX: 0,
  paddingY: 0,
  itemPaddingX: 0,
  itemPaddingY: 0,
  rangeExpand: 0,
})

interface RangeField {
  key: NumberControlKey
  label: string
  min: number
  max: number
  step: number
  unit?: string
}

const layoutModes: LayoutMode[] = ['waterfall', 'square']
const numberFields: RangeField[] = [
  { key: 'cols', label: 'Columns', min: 1, max: 12, step: 1 },
  { key: 'gap', label: 'Gap', min: 0, max: 72, step: 2, unit: 'px' },
  { key: 'paddingX', label: 'Padding X', min: 0, max: 120, step: 4, unit: 'px' },
  { key: 'paddingY', label: 'Padding Y', min: 0, max: 120, step: 4, unit: 'px' },
  { key: 'itemPaddingX', label: 'Item Padding X', min: 0, max: 48, step: 2, unit: 'px' },
  { key: 'itemPaddingY', label: 'Item Padding Y', min: 0, max: 64, step: 2, unit: 'px' },
  { key: 'rangeExpand', label: 'Range Expand', min: 0, max: 800, step: 20, unit: 'px' },
]

const heroItem = computed<DemoItem>(() => ({
  width: baseWidth,
  height: heroHeight,
}))

const galleryItems = computed<DemoItem[]>(() => placeholders.value.map(() => {
  const height = heights[Math.floor(Math.random() * heights.length)]
  return {
    width: baseWidth,
    height,
    src: `https://picsum.photos/${baseWidth}/${height}?random=${Math.random()}`,
  }
}))

const items = computed<DemoItem[]>(() => [
  heroItem.value,
  ...galleryItems.value,
])

const itemPadding = computed(() => ({
  x: controls.itemPaddingX,
  y: controls.itemPaddingY,
}))

const isLoaded = (index: number) => index === 0 || loadedSet.value.has(index)
function markLoaded(index: number) {
  if (index === 0) {
    return
  }
  const next = new Set(loadedSet.value)
  next.add(index)
  loadedSet.value = next
}

watch(items, () => {
  loadedSet.value = new Set([0])
})

function setLayoutMode(mode: LayoutMode) {
  layoutMode.value = mode
}
</script>

<template>
  <div class="page">
    <div class="panel-shell">
      <div class="control-panel">
        <div class="panel-header">
          <p class="eyebrow">
            Waterfall playground
          </p>
          <h1>Control panel</h1>
          <p class="hint">
            Adjust props in real time to see how the layout adapts.
          </p>
        </div>
        <div class="layout-row">
          <div class="layout-label">
            <span class="layout-title">
              Layout mode
            </span>
            <span class="layout-desc">
              Switch between masonry and square tiles.
            </span>
          </div>
          <div class="layout-switch">
            <button
              v-for="mode in layoutModes"
              :key="mode"
              type="button"
              class="toggle"
              :class="{ active: layoutMode === mode }"
              @click="setLayoutMode(mode)"
            >
              {{ mode === 'waterfall' ? 'Waterfall' : 'Square' }}
            </button>
          </div>
        </div>
        <div class="control-grid">
          <label
            v-for="field in numberFields"
            :key="field.key"
            class="field"
          >
            <div class="field-header">
              <span>{{ field.label }}</span>
              <span class="field-value">
                {{ controls[field.key] }}{{ field.unit ?? '' }}
              </span>
            </div>
            <div class="range-row">
              <input
                v-model.number="controls[field.key]"
                type="range"
                :min="field.min"
                :max="field.max"
                :step="field.step"
              >
            </div>
          </label>
        </div>
        <div class="panel-footer">
          <span class="pill">
            Item padding: {{ itemPadding.x }}px x {{ itemPadding.y }}px
          </span>
          <span class="pill">
            Photos: {{ items.length - 1 }}
          </span>
          <span class="pill">
            Range expand: {{ controls.rangeExpand }}px
          </span>
        </div>
      </div>
    </div>
    <Waterfall
      :items="items"
      :cols="controls.cols"
      :gap="controls.gap"
      :padding-x="controls.paddingX"
      :padding-y="controls.paddingY"
      :item-padding="itemPadding"
      :range-expand="controls.rangeExpand"
      :layout="layoutMode"
    >
      <div
        v-for="item, i in items"
        :key="i"
        class="wf-item"
      >
        <div
          v-if="i === 0"
          class="hero-shell"
          :style="{ aspectRatio: `${baseWidth}/${heroHeight}` }"
        >
          <div class="hero-content">
            <div class="hero-text">
              <h1 class="hero-title">
                Waterfall playground
              </h1>
              <div class="hero-meta">
                <a
                  class="meta-pill"
                  href="https://github.com/jannchie/vue-wf"
                  target="_blank"
                  rel="noreferrer"
                >
                  Repository: jannchie/vue-wf
                </a>
              </div>
            </div>
          </div>
        </div>
        <div
          v-else
          class="photo-shell"
          :style="{ aspectRatio: `${baseWidth}/${item.height}` }"
        >
          <img
            :src="item.src"
            class="photo"
            loading="lazy"
            @load="markLoaded(i)"
            @error="markLoaded(i)"
          >
          <div
            v-if="!isLoaded(i)"
            class="photo-overlay"
          >
            Photo #{{ i }}
          </div>
        </div>
      </div>
    </Waterfall>
  </div>
</template>

<style scoped>
.page {
  width: 100dvw;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  gap: 18px;
  overflow: auto;
  padding: 24px;
  box-sizing: border-box;
  background: #f5f5f5;
  color: #111;
}

.wf-item {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
}

.panel-shell {
  width: 100%;
  border-radius: 16px;
  background: #ffffff;
  border: 1px solid #e0e0e0;
  box-shadow: none;
  box-sizing: border-box;
}

.control-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 18px;
  box-sizing: border-box;
}

.panel-header h1 {
  margin: 4px 0;
  font-size: 20px;
  letter-spacing: 0.2px;
}

.panel-header .eyebrow {
  text-transform: uppercase;
  font-size: 12px;
  letter-spacing: 1.6px;
  color: #666;
  margin: 0;
}

.panel-header .hint {
  margin: 4px 0 0;
  color: #555;
  font-size: 13px;
  line-height: 1.4;
}

.layout-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
  border: 1px solid #e6e6e6;
  border-radius: 10px;
  background: #fafafa;
}

.layout-label {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.layout-title {
  font-size: 14px;
  color: #222;
}

.layout-desc {
  font-size: 12px;
  color: #666;
}

.layout-switch {
  display: flex;
  gap: 8px;
}

.toggle {
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid #d0d0d0;
  background: #ffffff;
  color: #222;
  cursor: pointer;
  transition: border-color 0.12s ease, color 0.12s ease, background-color 0.12s ease;
}

.toggle:hover {
  border-color: #b5b5b5;
}

.toggle.active {
  border-color: #1a73e8;
  background: #e8f0fe;
  color: #0b57d0;
}

.hero-shell {
  width: 100%;
  height: 100%;
  border-radius: 16px;
  padding: 22px;
  box-sizing: border-box;
  background: #ffffff;
  border: none;
  box-shadow: none;
  position: relative;
  overflow: hidden;
}

.hero-shell::after {
  content: '';
  position: absolute;
  inset: 0;
  background: transparent;
  pointer-events: none;
}

.hero-content {
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.hero-text {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  text-align: center;
}

.hero-title {
  margin: 0;
  font-size: 28px;
  letter-spacing: 0.2px;
  color: #111;
}

.hero-meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
}

.meta-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  background: #f7f7f7;
  box-shadow: none;
  color: #111;
  text-decoration: none;
  font-size: 14px;
}
.meta-pill:hover {
  border-color: #cfcfcf;
}

.control-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 10px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px;
  border: 1px solid #e6e6e6;
  border-radius: 10px;
  background: #fafafa;
}

.field span {
  font-size: 13px;
  color: #222;
}

.field-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.field-value {
  font-size: 12px;
  color: #555;
}

.range-row input[type="range"] {
  width: 100%;
  appearance: none;
  height: 8px;
  border-radius: 10px;
  background: #d9d9d9;
  outline: none;
  cursor: pointer;
  box-shadow: none;
}

.range-row input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 8px;
  border: 1px solid #bfbfbf;
  background: #ffffff;
  box-shadow: none;
}

.range-row input[type="range"]::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 8px;
  border: 1px solid #bfbfbf;
  background: #ffffff;
  box-shadow: none;
}

.range-row input[type="range"]::-moz-range-track {
  height: 8px;
  border-radius: 10px;
  background: #d9d9d9;
}

.range-row input[type="range"]:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.panel-footer {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.pill {
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid #e0e0e0;
  background: #f2f2f2;
  color: #333;
  font-size: 12px;
  letter-spacing: 0.3px;
}

.photo-shell {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 14px;
  background: #f7f7f7;
  border: 1px solid #e0e0e0;
  box-shadow: none;
  box-sizing: border-box;
}

.photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  filter: saturate(1.05);
}

.photo-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  letter-spacing: 0.4px;
  color: #222;
  background: rgba(255, 255, 255, 0.72);
}
</style>
