<template>
  <view class="landing">
    <view class="center">
      <text class="open">OPEN</text>
      <view class="actions">
        <button class="fancy no-dash" @click="openRegister = true">
          <text class="top-key"></text>
          <text class="text">注册</text>
          <text class="bottom-key-1"></text>
          <text class="bottom-key-2"></text>
        </button>
        <button class="fancy no-dash" @click="openLogin = true">
          <text class="top-key"></text>
          <text class="text">登录</text>
          <text class="bottom-key-1"></text>
          <text class="bottom-key-2"></text>
        </button>
      </view>
    </view>

    <Modal v-model:open="openLogin" title="登录" :width="600">
      <LoginForm @switch-register="switchToRegister" />
    </Modal>
    <Modal v-model:open="openRegister" :width="600">
      <RegisterForm @switch-login="switchToLogin" />
    </Modal>
  </view>
  
</template>

<script setup>
import { ref } from 'vue';
import Modal from '../../components/ui/Modal.vue';
import LoginForm from '../../components/auth/LoginForm.vue';
import RegisterForm from '../../components/auth/RegisterForm.vue';

const openLogin = ref(false);
const openRegister = ref(false);

function switchToRegister() {
  openLogin.value = false;
  setTimeout(() => { openRegister.value = true; }, 150);
}
function switchToLogin() {
  openRegister.value = false;
  setTimeout(() => { openLogin.value = true; }, 150);
}
</script>

<style>
@import '../../io-modules/button/button.css';
</style>

<style scoped>
.landing {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: url('/static/login-bg.jpg') center/cover no-repeat fixed;
  padding: 24px 16px env(safe-area-inset-bottom);
}
.center {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 360px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 24px;
  /* 整体略微上移，并在底部留出约两个按钮高度的空间 */
  margin-bottom: 96px;
}
.open {
  font-size: 64px;
  font-weight: 700;
  letter-spacing: 6px;
  color: rgba(255,255,255,0.96);
  text-shadow: 0 6px 24px rgba(0,0,0,0.35);
  animation: breathe 3.2s ease-in-out infinite;
  text-align: center;
}
.actions {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 24px;
}
.actions .fancy {
  width: 100%;
  float: none;
}

@keyframes breathe {
  0%, 100% { transform: translateY(0) scale(1); opacity: 1; }
  50% { transform: translateY(-2px) scale(1.01); opacity: 0.98; }
}

@media (max-width: 420px) {
  .open { font-size: 44px; letter-spacing: 4px; }
  .center { max-width: 100%; }
}
</style>
