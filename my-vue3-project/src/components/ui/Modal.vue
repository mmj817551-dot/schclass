<template>
  <view v-if="open" class="modal-root" @touchmove.stop.prevent>
    <view class="overlay" @click="onOverlayClick"></view>
    <view class="container" :style="containerStyle" @click.stop>
      <view class="header">
        <slot v-if="title || $slots.header" name="header">
          <text class="title">{{ title }}</text>
        </slot>
        <button class="close" @click="close" aria-label="Close">×</button>
      </view>
      <view class="body">
        <slot />
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: '' },
  width: { type: [String, Number], default: 420 },
});
const emit = defineEmits(['update:open', 'close']);

const containerStyle = computed(() => {
  let w = typeof props.width === 'number' ? `${props.width}px` : props.width;
  return `max-width:${w};`;
});

function close() {
  emit('update:open', false);
  emit('close');
}
function onOverlayClick() { close(); }
</script>

<style scoped>
.modal-root {
  position: fixed;
  top: 0; right: 0; bottom: 0; left: 0; /* 避免部分端对 inset 兼容性问题 */
  z-index: 900; /* 低于 uni-picker 的 999，确保系统选择器浮在最上层 */
}
.overlay {
  position: fixed; /* 覆盖整屏，避免容器尺寸影响 */
  top: 0; right: 0; bottom: 0; left: 0; /* 不使用 inset 以提升兼容性 */
  width: 100vw; height: 100vh; /* 双重保险，防止特定端尺寸计算异常 */
  background: rgba(0,0,0,0.32);
  opacity: 0;
  animation: fadeIn 180ms cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
  z-index: 1;
}
.container {
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%) scale(0.98);
  width: 92vw;
  max-width: 480px;
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.18);
  background: rgba(255,255,255,0.06);
  -webkit-backdrop-filter: blur(16px) saturate(140%);
  backdrop-filter: blur(16px) saturate(140%);
  box-shadow: 0 10px 30px rgba(0,0,0,0.25);
  color: #111;
  overflow: hidden;
  opacity: 0;
  animation: popIn 220ms cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
  z-index: 2;
}
.header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 14px 40px 10px;
}
.title {
  font-size: 18px;
  font-weight: 600;
}
.close {
  position: absolute;
  top: 8px;
  right: 10px;
  background: transparent;
  border: none;
  font-size: 22px;
  line-height: 1;
  color: rgba(255,255,255,0.86);
  padding: 6px 8px;
}
.close:active { transform: scale(0.96); }
.body { padding: 12px 16px 16px; }

@keyframes fadeIn { to { opacity: 1; } }
@keyframes popIn { to { opacity: 1; transform: translate(-50%, -50%) scale(1); } }

@media (prefers-reduced-motion: reduce) {
  .overlay, .container { animation: none; opacity: 1; transform: translate(-50%, -50%) scale(1); }
}
</style>
