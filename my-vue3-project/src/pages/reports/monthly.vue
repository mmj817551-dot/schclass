<template>
  <view class="page reports-monthly">
    <view v-if="ui.globalLoading" class="top-loading"></view>
    <view class="header">
      <text class="title">月报导出</text>
      <text class="subtitle">CSV / PDF · {{ month }}</text>
    </view>

    <view class="card">
      <view class="row-title">选择月份</view>
      <picker mode="date" :value="dateForPicker" @change="onDateChange">
        <view class="picker">{{ month }}</view>
      </picker>
      <view class="actions">
        <button class="fancy" @click="exportCSV"><text class="top-key"></text><text class="text">导出 CSV</text><text class="bottom-key-1"></text><text class="bottom-key-2"></text></button>
        <button class="fancy" @click="exportPDF"><text class="top-key"></text><text class="text">导出 PDF</text><text class="bottom-key-1"></text><text class="bottom-key-2"></text></button>
      </view>
    </view>

    <view v-if="isAdmin" class="card" style="margin-top:12px;">
      <view class="row-title">管理员配置</view>
      <view class="field">
        <text class="label">大教室容量</text>
        <view class="input-container">
          <input class="input-field" type="number" v-model.number="largeCap" placeholder="容量" />
          <label class="input-label">容量</label>
          <span class="input-highlight"></span>
        </view>
      </view>
      <view class="field">
        <text class="label">周起始</text>
        <picker mode="selector" :range="weekStartOptions" @change="(e)=>weekStart=weekStartValues[e.detail.value]">
          <view class="picker">{{ weekStartLabel }}</view>
        </picker>
      </view>
      <view class="field">
        <text class="label">时区</text>
        <picker mode="selector" :range="timezoneOptions" @change="(e)=>timezone=timezoneOptions[e.detail.value]">
          <view class="picker">{{ timezone }}</view>
        </picker>
      </view>
      <view class="actions">
        <button class="fancy" @click="saveConfig"><text class="top-key"></text><text class="text">保存设置</text><text class="bottom-key-1"></text><text class="bottom-key-2"></text></button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { getMonthlyReportUrl } from '../../services/reports.api.js';
import { useAuthStore } from '../../store/auth.js';
import { useConfigStore } from '../../store/config.js';
import { useUiStore } from '../../store/ui.js';
import { setLoadingHooks } from '../../services/http.js';
import { ensureAuth } from '../../utils/authGuard.js';

const auth = useAuthStore();
const cfg = useConfigStore();
const ui = useUiStore();

const isAdmin = computed(() => auth.role === 'admin');

const today = new Date();
const month = ref(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`);
const dateForPicker = computed(() => `${month.value}-01`);

const weekStartOptions = ['周一', '周日'];
const weekStartValues = ['monday', 'sunday'];

const largeCap = ref(10);
const weekStart = ref('monday');
const timezone = ref('Asia/Shanghai');

const weekStartLabel = computed(() => weekStart.value === 'monday' ? '周一起始' : '周日起始');

function onDateChange(e) {
  const val = e.detail.value; // YYYY-MM-DD
  month.value = val.slice(0, 7);
}

function openURL(url) {
  // Prefer H5 window.open; fallback to uni.downloadFile
  try {
    if (typeof window !== 'undefined' && window.open) {
      window.open(url, '_blank');
      return;
    }
  } catch (_) {}
  if (typeof uni !== 'undefined' && typeof uni.downloadFile === 'function') {
    uni.showLoading({ title: '导出中' });
    uni.downloadFile({
      url,
      success: (res) => {
        if (res.statusCode === 200) {
          if (url.includes('format=pdf') && typeof uni.openDocument === 'function') {
            uni.openDocument({ filePath: res.tempFilePath });
          } else {
            uni.showToast({ title: '已下载', icon: 'success' });
          }
        } else {
          uni.showToast({ title: '下载失败', icon: 'none' });
        }
      },
      fail: () => uni.showToast({ title: '下载失败', icon: 'none' }),
      complete: () => { try { uni.hideLoading(); } catch (_) {} },
    });
  }
}

function exportCSV() {
  const url = getMonthlyReportUrl({ month: month.value, format: 'csv' });
  openURL(url);
}
function exportPDF() {
  const url = getMonthlyReportUrl({ month: month.value, format: 'pdf' });
  openURL(url);
}

async function loadConfig() {
  await cfg.load();
  largeCap.value = cfg.largeRoomCapacity || 10;
  weekStart.value = cfg.weekStart || 'monday';
  timezone.value = cfg.timezone || 'Asia/Shanghai';
}

async function saveConfig() {
  try {
    await cfg.update({ largeRoomCapacity: Number(largeCap.value) || 10, weekStart: weekStart.value, timezone: timezone.value });
    uni.showToast({ title: '已保存', icon: 'success' });
  } catch (e) {
    uni.showToast({ title: e?.message || '保存失败', icon: 'none' });
  }
}

onMounted(() => { loadConfig(); setLoadingHooks(() => ui.begin(), () => ui.end()); });
onLoad(() => { if (!ensureAuth()) return; });
</script>

<style>
@import '../../io-modules/card/card.css';
@import '../../io-modules/button/button.css';
@import '../../io-modules/input1/input1.css';
</style>

<style scoped>
.page { padding: 16px; }
.title { font-size: 20px; font-weight: 600; }
.subtitle { color: #666; display: block; margin-top: 4px; }
.card { margin-top: 12px; padding: 12px; border-radius: 12px; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
.row-title { font-weight: 600; margin-bottom: 8px; display: block; }
.picker { color: #333; margin-top: 6px; }
.actions { margin-top: 12px; display: flex; gap: 8px; }
.field { margin-top: 8px; }
.label { color: #666; display: block; margin-bottom: 4px; }
.top-loading { position: fixed; left: 0; right: 0; top: 0; height: 2px; background: linear-gradient(90deg,#111,#aaa,#111); z-index: 9999; opacity: 0.9; }
</style>
