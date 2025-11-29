<template>
  <view class="page auth-login">
    <view class="page-inner">
      <LoginForm @switch-register="toRegister" />
    </view>
  </view>
  </template>

<script setup>
import LoginForm from '../../components/auth/LoginForm.vue';

function toRegister() {
  uni.navigateTo({ url: '/pages/auth/register' });
}
</script>

<style>
@import '../../io-modules/button/button.css';
@import '../../io-modules/input1/input1.css';
</style>

<style scoped>
.page { min-height: 100vh; padding: 16px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; background: linear-gradient(#f2f2f2, #ffffff); }
.page-inner { width: 100%; max-width: 600px; margin: 0 auto; padding: 16px; box-sizing: border-box; }
</style>
