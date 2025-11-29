<template>
  <view class="form">
    <view v-if="ui.globalLoading" class="top-loading"></view>

    <view class="input-container">
      <view class="input3-wrap" :class="{ 'is-focus': focused.phone }">
        <input class="input" type="text" v-model="phone" :placeholder="T.phone" @focus="focused.phone = true" @blur="focused.phone = false" />
      </view>
    </view>
    <view class="input-container">
      <view class="input3-wrap" :class="{ 'is-focus': focused.password }">
        <input class="input" type="password" v-model="password" :placeholder="T.password" @focus="focused.password = true" @blur="focused.password = false" />
      </view>
    </view>

    <view class="actions">
      <button class="fancy no-dash" @click="doLogin" :disabled="loading">
        <text class="top-key"></text>
        <text class="text">{{ loading ? T.loggingIn : T.login }}</text>
        <text class="bottom-key-1"></text>
        <text class="bottom-key-2"></text>
      </button>
      <button class="fancy ghost no-dash" @click="$emit('switch-register')">
        <text class="top-key"></text>
        <text class="text">{{ T.toRegister }}</text>
        <text class="bottom-key-1"></text>
        <text class="bottom-key-2"></text>
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { useAuthStore } from '../../store/auth.js';
import { errorMessage } from '../../utils/errors.js';
import { useUiStore } from '../../store/ui.js';
import { setLoadingHooks } from '../../services/http.js';

const emit = defineEmits(['switch-register', 'success']);

const store = useAuthStore();
const ui = useUiStore();
const phone = ref('');
const password = ref('');
const loading = ref(false);
const focused = reactive({ phone: false, password: false });

const T = {
  title: '\u767b\u5f55',
  welcome: '\u6b22\u8fce\u56de\u6765',
  phone: '\u624b\u673a\u53f7',
  password: '\u5bc6\u7801',
  login: '\u767b\u5f55',
  loggingIn: '\u767b\u5f55\u4e2d... ',
  toRegister: '\u53bb\u6ce8\u518c',
  pleasePhonePass: '\u8bf7\u8f93\u5165\u624b\u673a\u53f7\u4e0e\u5bc6\u7801',
  loginOk: '\u767b\u5f55\u6210\u529f',
  loginFail: '\u767b\u5f55\u5931\u8d25',
};

async function doLogin() {
  if (!phone.value || !password.value) {
    return uni.showToast({ title: T.pleasePhonePass, icon: 'none' });
  }
  loading.value = true;
  try {
    await store.login({ phone: phone.value, password: password.value });
    try { await store.loadMe(); } catch (_) {}
    uni.showToast({ title: T.loginOk, icon: 'success' });
    emit('success');
    uni.reLaunch({ url: '/pages/system/index' });
  } catch (e) {
    uni.showToast({ title: errorMessage(e, T.loginFail), icon: 'none' });
  } finally {
    loading.value = false;
  }
}

onMounted(() => { setLoadingHooks(() => ui.begin(), () => ui.end()); });
</script>

<style>
@import '../../io-modules/button/button.css';
@import '../../io-modules/input1/input1.css';
@import '../../io-modules/input3/input3.css';
</style>

<style scoped>
/* input3 适配容器：保证宽度与动效在 uni-app H5 中正常 */
.input3-wrap {
  width: 100%;
  border-radius: 10px;
  background: #1a1a1a;
}
.input3-wrap.is-focus {
  /* 使用 input3 的彩色阴影动效包裹整个输入区域 */
  animation: rotateShadow 2s infinite linear;
}
.input3-wrap .input {
  width: 100%;
  max-width: 100% !important;
  box-sizing: border-box;
  background: transparent;
  padding: 22px 14px; /* 再次提升高度（约为当前的 1.2 倍） */
  color: #fff;
  border: none;
  outline: none;
  border-radius: 10px;
}
.input3-wrap .input::placeholder { color: #bfbfbf; }
/* 深度作用到 uni 内部原生 input（H5） */
:deep(.input3-wrap .uni-input-input) {
  width: 100% !important;
  box-sizing: border-box;
  background: transparent !important;
  padding: 22px 14px !important;
  color: #fff !important;
}
:deep(.input3-wrap .uni-input-input::placeholder) { color: #bfbfbf !important; }

/* 去除浏览器自动填充时的白色底色，保持深色背景 */
.input3-wrap .input:-webkit-autofill,
.input3-wrap .input:-webkit-autofill:hover,
.input3-wrap .input:-webkit-autofill:focus {
  box-shadow: 0 0 0 1000px #1a1a1a inset;
  -webkit-text-fill-color: #fff;
}
:deep(.input3-wrap .uni-input-input:-webkit-autofill),
:deep(.input3-wrap .uni-input-input:-webkit-autofill:hover),
:deep(.input3-wrap .uni-input-input:-webkit-autofill:focus) {
  box-shadow: 0 0 0 1000px #1a1a1a inset;
  -webkit-text-fill-color: #fff !important;
}

.actions {
  margin-top: 32px; /* 加大输入区域与按钮之间的间距 */
  display: flex;
  flex-direction: column;
  gap: 12px;
  justify-content: center;
  align-items: stretch;
}
.ghost { opacity: 0.9; }
.top-loading {
  position: fixed;
  left: 0; right: 0; top: 0; height: 2px;
  background: linear-gradient(90deg, #111, #aaa, #111);
  z-index: 9999; opacity: 0.9;
}
</style>
