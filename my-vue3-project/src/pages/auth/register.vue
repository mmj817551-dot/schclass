<template>
  <view class="page auth-register">
    <view class="page-inner">
      <RegisterForm @switch-login="toLogin" />
    </view>
  </view>
</template>

<script setup>
import RegisterForm from '../../components/auth/RegisterForm.vue';

function toLogin() {
  uni.navigateTo({ url: '/pages/auth/login' });
}
</script>

<style>
@import '../../io-modules/button/button.css';
@import '../../io-modules/card/card.css';
@import '../../io-modules/input1/input1.css';
@import '../../io-modules/switch/switch.css';
</style>

<style scoped>
.page { min-height: 100vh; padding: 16px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; background: linear-gradient(#f2f2f2, #ffffff); }
.page-inner { width: 100%; max-width: 600px; margin: 0 auto; padding: 16px; box-sizing: border-box; }
</style>
