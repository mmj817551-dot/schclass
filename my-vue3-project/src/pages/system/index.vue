<template>
  <view class="page system-index">
    <view v-if="ui.globalLoading" class="top-loading"></view>
    <view class="header">
      <text class="title">{{ T.title }}</text>
      <text class="subtitle">{{ T.weekRange }}：{{ week.from }} ~ {{ week.to }}</text>
      <view class="toolbar week-toolbar">
        <view class="animated-button week-btn week-btn--prev" @click="prevWeek">
          <svg class="arr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path
              d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z">
            </path>
          </svg>
          <span class="text">上一周</span>
          <span class="circle"></span>
          <svg class="arr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path
              d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z">
            </path>
          </svg>
        </view>

        <!-- 本周：只有文字，没有箭头 -->
        <view class="animated-button week-btn week-btn--current" @click="thisWeek">
          <span class="text">本周</span>
        </view>

        <!-- 下一周：保持原来的按钮逻辑 -->
        <view class="animated-button week-btn week-btn--next" @click="nextWeek">
          <svg xmlns="http://www.w3.org/2000/svg" class="arr-2" viewBox="0 0 24 24">
            <path
              d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z">
            </path>
          </svg>
          <span class="text">下一周</span>
          <span class="circle"></span>
          <svg xmlns="http://www.w3.org/2000/svg" class="arr-1" viewBox="0 0 24 24">
            <path
              d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z">
            </path>
          </svg>
        </view>
      </view>
    </view>

    <view class="toolbar nav">
      <view class="spacer"></view>
      <view class="fancy" v-if="isTeacher" @click="toCreate"><text class="top-key"></text><text class="text">{{ T.create
          }}</text><text class="bottom-key-1"></text><text class="bottom-key-2"></text></view>
      <view class="fancy" @click="toProfile"><text class="top-key"></text><text class="text">{{ T.profile }}</text><text
          class="bottom-key-1"></text><text class="bottom-key-2"></text></view>
      <view class="fancy" @click="doLogout"><text class="top-key"></text><text class="text">{{ T.logout }}</text><text
          class="bottom-key-1"></text><text class="bottom-key-2"></text></view>
    </view>
    <view v-if="navigating" class="overlay">
      <view class="loader">
        <view class="text"><span>Loading</span></view>
        <view class="text"><span>Loading</span></view>
        <view class="text"><span>Loading</span></view>
        <view class="text"><span>Loading</span></view>
        <view class="text"><span>Loading</span></view>
        <view class="text"><span>Loading</span></view>
        <view class="text"><span>Loading</span></view>
        <view class="text"><span>Loading</span></view>
        <view class="text"><span>Loading</span></view>
        <view class="line"></view>
      </view>
    </view>
    <view v-if="loadingAll" class="loader-wrap">
      <view class="loader">
        <view class="text"><span>Loading</span></view>
        <view class="text"><span>Loading</span></view>
        <view class="text"><span>Loading</span></view>
        <view class="text"><span>Loading</span></view>
        <view class="text"><span>Loading</span></view>
        <view class="text"><span>Loading</span></view>
        <view class="text"><span>Loading</span></view>
        <view class="text"><span>Loading</span></view>
        <view class="text"><span>Loading</span></view>
        <view class="line"></view>
      </view>
    </view>
    <view v-else>
      <view class="section">
        <text class="section-title">{{ T.smallRooms }}</text>
        <view class="grid">
          <view v-for="r in smallRooms" :key="r._id" class="room-card" @click="openRoom(r)">
            <text class="card-title">{{ r.name }}</text>
            <view class="room-stats">
              <text class="card-sub">{{ T.capacityOne }}</text>
              <text class="card-meta">{{ T.thisWeekCount }}{{ countByRoom[r._id] || 0 }}</text>
            </view>
          </view>
        </view>
      </view>
      <view class="section">
        <text class="section-title">{{ T.largeRooms }}</text>
        <view class="grid">
          <view v-for="r in largeRooms" :key="r._id" class="room-card" @click="openRoom(r)">
            <text class="card-title">{{ r.name }}</text>
            <view class="room-stats">
              <text class="card-sub">{{ T.capacity }}{{ r.capacity }}</text>
              <text class="card-meta">{{ T.thisWeekCount }}{{ countByRoom[r._id] || 0 }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { useRoomsStore } from '../../store/rooms.js';
import { useReservationsStore } from '../../store/reservations.js';
import { useConfigStore } from '../../store/config.js';
import { useUiStore } from '../../store/ui.js';
import { useAuthStore } from '../../store/auth.js';
import { setLoadingHooks } from '../../services/http.js';
import { errorMessage } from '../../utils/errors.js';
import { formatDate, getWeekRange, parseDate } from '../../utils/datetime.js';
import { ensureAuth } from '../../utils/authGuard.js';

const T = {
  title: '\u7cfb\u7edf\u603b\u89c8',
  weekRange: '\u5468\u89c6\u56fe',
  prevWeek: '\u4e0a\u4e00\u5468',
  thisWeek: '\u672c\u5468',
  nextWeek: '\u4e0b\u4e00\u5468',
  create: '\u65b0\u5efa\u9884\u7ea6',
  profile: '\u4e2a\u4eba\u4e2d\u5fc3',
  logout: '\u9000\u51fa\u767b\u5f55',
  smallRooms: '\u5c0f\u6559\u5ba4',
  largeRooms: '\u5927\u6559\u5ba4',
  capacityOne: '\u5bb9\u91cf\uff1a1',
  capacity: '\u5bb9\u91cf\uff1a',
  thisWeekCount: '\u672c\u5468\u9884\u7ea6\uff1a',
};

const roomsStore = useRoomsStore();
const resvStore = useReservationsStore();
const cfgStore = useConfigStore();
const ui = useUiStore();
const authStore = useAuthStore();

const isTeacher = computed(() => authStore.role === 'teacher');

const todayStr = formatDate(new Date());
const baseDate = ref(todayStr);

const week = computed(() => getWeekRange(baseDate.value, cfgStore.weekStart || 'monday'));

const loadingAll = ref(true);
const navigating = ref(false);

function withLoader(fn) {
  try {
    navigating.value = true;
  } catch (_) {}
  try {
    const ret = fn && fn();
    setTimeout(() => {
      navigating.value = false;
    }, 300);
    return ret;
  } catch (e) {
    navigating.value = false;
    throw e;
  }
}

const smallRooms = computed(() => roomsStore.smallRooms || []);
const largeRooms = computed(() => roomsStore.largeRooms || []);

const countByRoom = computed(() => {
  const list = resvStore.getCachedRange({ from: week.value.from, to: week.value.to }) || [];
  const map = {};
  list.forEach((item) => {
    const rid = item.roomId || (item.room && item.room._id);
    if (!rid) return;
    map[rid] = (map[rid] || 0) + (Array.isArray(item.slots) ? item.slots.length : 1);
  });
  return map;
});

async function ensureInit() {
  if (!cfgStore.loaded && !cfgStore.loading) {
    try {
      await cfgStore.load();
    } catch (e) {
      uni.showToast({ title: errorMessage(e, '配置加载失败'), icon: 'none' });
    }
  }
  if (!roomsStore.rooms.length && !roomsStore.loading) {
    try {
      await roomsStore.load();
    } catch (e) {
      uni.showToast({ title: errorMessage(e, '教室加载失败'), icon: 'none' });
    }
  }
}

async function loadWeekData() {
  loadingAll.value = true;
  try {
    await resvStore.loadRange({ from: week.value.from, to: week.value.to });
  } finally {
    loadingAll.value = false;
  }
}

function shiftDays(dateStr, days) {
  const d = parseDate(dateStr);
  d.setDate(d.getDate() + days);
  return formatDate(d);
}

function prevWeek() {
  baseDate.value = shiftDays(baseDate.value, -7);
}
function nextWeek() {
  baseDate.value = shiftDays(baseDate.value, 7);
}
function thisWeek() {
  baseDate.value = todayStr;
}

function openRoom(room) {
  uni.navigateTo({
    url: `/pages/system/room-detail?roomId=${encodeURIComponent(room._id)}&date=${week.value.from}`,
  });
}

function toCreate() {
  withLoader(() => uni.navigateTo({ url: '/pages/reservation/create' }));
}
function toProfile() {
  const r = authStore.role;
  const url = r === 'teacher' ? '/pages/profile/teacher' : '/pages/profile/student';
  withLoader(() => uni.navigateTo({ url }));
}
function doLogout() {
  try {
    authStore.logout();
  } catch (_) {}
  withLoader(() => uni.reLaunch({ url: '/pages/index/index' }));
}

watch(week, () => {
  loadWeekData();
});

onLoad(async () => {
  if (!ensureAuth()) return;
  await ensureInit();
  await loadWeekData();
});
onMounted(async () => {
  if (!cfgStore.loaded) await ensureInit();
  if (!resvStore.getCachedRange({ from: week.value.from, to: week.value.to }).length) {
    await loadWeekData();
  }
  setLoadingHooks(
    () => ui.begin(),
    () => ui.end(),
  );
});
</script>

<style>
@import '../../io-modules/card/card.css';
@import '../../io-modules/button/button.css';
@import '../../io-modules/loader/loader.css';
@import '../../io-modules/card1/card1.css';
@import '../../io-modules/buttonweek/buttonweek.css';
</style>

<style scoped>
.page { padding: 16px; }
.title { font-size: 20px; font-weight: 600; }
.subtitle { color: #666; display: block; margin-top: 4px; }
.toolbar { margin-top: 8px; display: flex; gap: 8px; }
.section { margin-top: 16px; }
.section-title { font-weight: 600; display: block; margin-bottom: 8px; }
.grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
.card-title {
  font-weight: 700;
  font-size: 20px;
  color: #ffffff;
  text-align: center;
}
.room-stats {
  margin-top: 8px;
  display: flex;
  justify-content: space-around;
  align-items: center;
}
.card-sub,
.card-meta {
  color: #f3f4f6;
  font-size: 15px;
}
	.placeholder { color: #999; background: #fafafa; padding: 12px; border-radius: 8px; margin-top: 12px; }
	.loader-wrap { display:flex; align-items:center; justify-content:center; height: 120px; }
	.top-loading { position: fixed; left: 0; right: 0; top: 0; height: 2px; background: linear-gradient(90deg,#111,#aaa,#111); z-index: 9999; opacity: 0.9; }
	.overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.3); display:flex; align-items:center; justify-content:center; z-index: 9998; }
	.spacer { flex: 1; }

  /* 顶部周切换按钮：等宽且居中 */
  .header .toolbar {
    justify-content: center;
  }
  
  .week-toolbar {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 24px; /* 按钮之间的间距，可随便调 */
  }
  .week-toolbar .animated-button {
    padding: 9px 60px;  /* 调整高度和宽度 */
    font-size: 16px;    /* 文字大小 */
  }

  .header .toolbar .fancy .text {
    text-align: center;
    padding-left: 0;
  }
	</style>
