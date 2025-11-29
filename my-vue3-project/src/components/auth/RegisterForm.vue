<template>
  <view class="form">
    <view v-if="ui.globalLoading" class="top-loading"></view>

    <view class="role-row" @click="onRoleSwitch">
      <text class="role-title">{{ role === 'teacher' ? '教师注册' : '学生注册' }}</text>
      <view class="role-switch">
        <text class="role-label">教师</text>
        <view class="switch-container" :class="{ 'is-student': role === 'student' }">
          <view class="switch-knob"></view>
        </view>
        <text class="role-label">学生</text>
      </view>
    </view>

    <view class="input-container">
      <view class="input3-wrap" :class="{ 'is-focus': focused.name }">
        <input
          class="input"
          type="text"
          v-model="name"
          placeholder="姓名"
          @focus="focused.name = true"
          @blur="focused.name = false"
        />
      </view>
    </view>
    <view class="input-container">
      <view class="input3-wrap" :class="{ 'is-focus': focused.phone }">
        <input
          class="input"
          type="text"
          v-model="phone"
          placeholder="手机号"
          @focus="focused.phone = true"
          @blur="focused.phone = false"
        />
      </view>
    </view>
    <view class="input-container">
      <view class="input3-wrap" :class="{ 'is-focus': focused.password }">
        <input
          class="input"
          type="password"
          v-model="password"
          placeholder="密码"
          @focus="focused.password = true"
          @blur="focused.password = false"
        />
      </view>
    </view>
    <view class="input-container">
      <view class="input3-wrap" :class="{ 'is-focus': focused.confirm }">
        <input
          class="input"
          type="password"
          v-model="confirm"
          placeholder="确认密码"
          @focus="focused.confirm = true"
          @blur="focused.confirm = false"
        />
      </view>
    </view>

    <view class="field subject-field" :class="{ 'is-visible': role === 'teacher' }">
      <text class="label">科目</text>
      <picker mode="selector" :range="subjects" @change="(e) => (subject = subjects[e.detail.value])">
        <view class="subject-input" :class="{ 'is-placeholder': !subject }">
          {{ subject || '请选择科目' }}
        </view>
      </picker>
    </view>

    <view class="actions">
      <button class="fancy no-dash" @click="doRegister" :disabled="loading">
        <text class="top-key"></text>
        <text class="text">{{ loading ? '提交中...' : '注册' }}</text>
        <text class="bottom-key-1"></text>
        <text class="bottom-key-2"></text>
      </button>
      <button class="fancy ghost no-dash" @click="$emit('switch-login')">
        <text class="top-key"></text>
        <text class="text">去登录</text>
        <text class="bottom-key-1"></text>
        <text class="bottom-key-2"></text>
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { useAuthStore } from '../../store/auth.js';
import { useConfigStore } from '../../store/config.js';
import { register as apiRegister } from '../../services/auth.api.js';
import { errorMessage } from '../../utils/errors.js';
import { useUiStore } from '../../store/ui.js';
import { setLoadingHooks } from '../../services/http.js';

const emit = defineEmits(['switch-login', 'success']);

const auth = useAuthStore();
const cfg = useConfigStore();
const ui = useUiStore();

const role = ref('teacher');
const name = ref('');
const phone = ref('');
const password = ref('');
const confirm = ref('');
const subject = ref('');
const loading = ref(false);
const subjects = ref([]);
const focused = reactive({
  name: false,
  phone: false,
  password: false,
  confirm: false,
});

onMounted(async () => {
  try {
    await cfg.load();
    subjects.value = cfg.subjects || [];
  } catch (_) {}
  setLoadingHooks(() => ui.begin(), () => ui.end());
});

async function doRegister() {
  if (!name.value || !phone.value || !password.value || !confirm.value) {
    return uni.showToast({ title: '请完整填写信息', icon: 'none' });
  }
  if (password.value !== confirm.value) {
    return uni.showToast({ title: '两次密码不一致', icon: 'none' });
  }
  loading.value = true;
  try {
    const payload = {
      role: role.value,
      name: name.value,
      phone: phone.value,
      password: password.value,
    };
    if (role.value === 'teacher' && subject.value) {
      payload.subject = subject.value;
    }
    const data = await apiRegister(payload);
    auth.setAuth({ token: data.token, user: data.user, expiresAt: data.expiresAt });
    auth.initHttpAuthBridge();
    uni.showToast({ title: '注册成功', icon: 'success' });
    emit('success');
    uni.reLaunch({ url: '/pages/system/index' });
  } catch (e) {
    uni.showToast({ title: errorMessage(e, '注册失败'), icon: 'none' });
  } finally {
    loading.value = false;
  }
}

function onRoleSwitch() {
  role.value = role.value === 'teacher' ? 'student' : 'teacher';
}
</script>

<style>
@import '../../io-modules/button/button.css';
@import '../../io-modules/input1/input1.css';
@import '../../io-modules/switch/switch.css';
@import '../../io-modules/input3/input3.css';
</style>

<style scoped>
/* input3 容器：保证宽度与彩色动效在 uni-app H5 中正常 */
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
.input3-wrap .input::placeholder {
  color: #bfbfbf;
}
/* 深度作用到 uni 内部原生 input（H5） */
:deep(.input3-wrap .uni-input-input) {
  width: 100% !important;
  box-sizing: border-box;
  background: transparent !important;
  padding: 22px 14px !important;
  color: #fff !important;
}
:deep(.input3-wrap .uni-input-input::placeholder) {
  color: #bfbfbf !important;
}
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

.role-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.role-title {
  font-size: 18px;
  font-weight: 700;
  color: #ffffff;
}
.role-switch {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}
.role-label {
  font-size: 14px;
  color: #f5f5f5;
  display: inline-block;
}
.field {
  margin-top: 12px;
}
.label {
  display: inline-block;
  margin-bottom: 6px;
  font-size: 14px;
  color: #f5f5f5;
}
.subject-input {
  padding: 12px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  background: rgba(0, 0, 0, 0.35);
  color: #f5f5f5;
}
.subject-input.is-placeholder {
  color: #d0d0d0;
}
.subject-field {
  overflow: hidden;
  max-height: 0;
  opacity: 0;
  transform: translateY(-4px);
  transition: max-height 360ms ease, opacity 280ms ease, transform 360ms ease;
}
.subject-field.is-visible {
  max-height: 180px;
  opacity: 1;
  transform: translateY(0);
}
.actions {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  justify-content: center;
  align-items: stretch;
}
.ghost {
  opacity: 0.9;
}
.top-loading {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  height: 2px;
  background: linear-gradient(90deg, #111, #aaa, #111);
  z-index: 9999;
  opacity: 0.9;
}
</style>
