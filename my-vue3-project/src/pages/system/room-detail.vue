<template>
  <view class="page room-detail">
    <view v-if="ui.globalLoading" class="top-loading"></view>

    <!-- 头部：房间名居中 + 按钮 + 周视图信息 -->
    <view class="header">
      <text class="title">{{ room?.name || '-' }}</text>

      <view class="toolbar">
        <view class="fancy no-dash" @click="prevWeek">
          <text class="top-key"></text>
          <text class="text">{{ T.prevWeek }}</text>
          <text class="bottom-key-1"></text>
          <text class="bottom-key-2"></text>
        </view>
        <view class="fancy no-dash" @click="thisWeek">
          <text class="top-key"></text>
          <text class="text">{{ T.thisWeek }}</text>
          <text class="bottom-key-1"></text>
          <text class="bottom-key-2"></text>
        </view>
        <view class="fancy no-dash" @click="nextWeek">
          <text class="top-key"></text>
          <text class="text">{{ T.nextWeek }}</text>
          <text class="bottom-key-1"></text>
          <text class="bottom-key-2"></text>
        </view>
      </view>

      <!-- 周视图信息，放在“本周”按钮正下方 -->
      <text class="week-range">
        {{ T.weekRange }}: {{ week.from }} ~ {{ week.to }}
      </text>
    </view>

    <view v-if="loading" class="loader-wrap">
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
      <view v-if="!resvList.length" class="placeholder">{{ T.noResv }}</view>
      <view v-else class="week-list">
        <view
          v-for="(d, idx) in weekDays"
          :key="d.date"
          class="week-day-section"
        >
          <!-- 周一 ~ 周日 彩色行 -->
          <view :class="['week-day-header', 'week-day-header--' + idx]">
            <text class="week-label">{{ d.label }}</text>
            <text class="week-date">{{ d.date }}</text>
          </view>

          <!-- 没有预约：显示“暂无”，居中 -->
          <view
            v-if="!(resvByDate[d.date] && resvByDate[d.date].length)"
            class="week-empty"
          >
            {{ '暂无' }}
          </view>

          <!-- 有预约：显示当日所有 card -->
          <view v-else>
            <view
              v-for="(item, i) in resvByDate[d.date]"
              :key="item._id || i"
              class="card card-fit week-card"
            >
              <text class="row-title">{{ item.subject || T.subject }}</text>
              <text class="row-meta">
                {{ T.teacher }}{{ item.teacher?.name || item.teacherName || '-' }}
              </text>
              <text class="row-meta">
                {{ T.studentCount }}{{ (item.studentIds && item.studentIds.length) || 0 }}
              </text>
              <text class="row-meta">
                {{ T.slots }}{{ slotsText(item.slots) }}
              </text>
              <text class="row-meta">
                具体时间：{{ intervalsText(item.intervals) }}
              </text>

              <view v-if="canCancel(item)" class="row-actions">
                <view class="button" @click.stop="cancelReservation(item)">
                  <svg class="svgIcon" viewBox="0 0 448 512">
                    <path
                      d="M135.2 17.7C140.6 7.4 151.3 0 163.1 0H284c11.8 0 22.5 7.4 27.9 17.7L320 32h96c17.7 
                         0 32 14.3 32 32s-14.3 32-32 32H32C14.3 96 0 81.7 0 64S14.3 32 32 32h96l7.2-14.3zM32 
                         128H416L402.3 467c-.7 24.3-20.5 45-44.8 45H90.5c-24.3 0-44.1-20.7-44.8-45L32 128z"
                    />
                  </svg>
                </view>
              </view>
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
import { useAuthStore } from '../../store/auth.js';
import { formatDate, getWeekRange, parseDate, groupByDate } from '../../utils/datetime.js';
import { useUiStore } from '../../store/ui.js';
import { setLoadingHooks } from '../../services/http.js';
import { errorMessage } from '../../utils/errors.js';

const T = {
  title: '\u6559\u5ba4\u8be6\u60c5',
  weekRange: '\u5468\u89c6\u56fe',
  prevWeek: '\u4e0a\u4e00\u5468',
  thisWeek: '\u672c\u5468',
  nextWeek: '\u4e0b\u4e00\u5468',
  noResv: '\u672c\u5468\u6682\u65e0\u9884\u7ea6',
  subject: '\u79d1\u76ee',
  teacher: '\u6559\u5e08\uff1a',
  studentCount: '\u5b66\u751f\u6570\uff1a',
  slots: '\u65f6\u6bb5\uff1a',
};

const roomsStore = useRoomsStore();
const resvStore = useReservationsStore();
const cfgStore = useConfigStore();
const ui = useUiStore();
const authStore = useAuthStore();

const roomId = ref('');
const baseDate = ref(formatDate(new Date()));
const room = computed(() => roomsStore.byId?.[roomId.value]);
const week = computed(() => getWeekRange(baseDate.value, cfgStore.weekStart || 'monday'));
const loading = ref(true);

const isTeacher = computed(() => authStore.role === 'teacher');

const resvListRaw = computed(() => roomsStore.reservationsByRoom[roomId.value] || []);

// 
function earliestKey(r) {
  const arr = Array.isArray(r.intervals) ? r.intervals : [];
  let best = null;
  arr.forEach((iv) => {
    if (!iv || !iv.date || !iv.start) return;
    const key = `${iv.date} ${iv.start}`;
    if (!best || key < best) best = key;
  });
  return best;
}
function compareByEarliest(a, b) {
  const ka = earliestKey(a);
  const kb = earliestKey(b);
  if (!ka && !kb) return 0;
  if (!ka) return 1;
  if (!kb) return -1;
  return ka < kb ? -1 : ka > kb ? 1 : 0;
}

const resvList = computed(() => {
  const list = resvListRaw.value || [];
  return list.slice().sort(compareByEarliest);
});

// 当前周的 7 天（从 week.from 起），用于渲染列头
const weekDays = computed(() => {
  const out = [];
  const start = parseDate(week.value.from);
  const labels = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  for (let i = 0; i < 7; i += 1) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const dateStr = formatDate(d);
    const label = labels[d.getDay()] || '';
    out.push({ date: dateStr, label });
  }
  return out;
});

function primaryDate(item) {
  if (!item) return '';
  // 优先使用 intervals 的日期
  const ivs = Array.isArray(item.intervals) ? item.intervals : [];
  for (let i = 0; i < ivs.length; i += 1) {
    const iv = ivs[i];
    if (iv && iv.date) return iv.date;
  }
  // 退回 slots（当前业务约束为不可跨天）
  const slots = Array.isArray(item.slots) ? item.slots : [];
  for (let i = 0; i < slots.length; i += 1) {
    const s = slots[i];
    if (s && s.date) return s.date;
  }
  return '';
}

const resvByDate = computed(() => {
  const map = {};
  const list = resvList.value || [];
  list.forEach((item) => {
    const d = primaryDate(item);
    if (!d) return;
    if (!map[d]) map[d] = [];
    map[d].push(item);
  });
  return map;
});

function shiftDays(dateStr, days) { const d = parseDate(dateStr); d.setDate(d.getDate() + days); return formatDate(d); }
function prevWeek() { baseDate.value = shiftDays(baseDate.value, -7); }
function nextWeek() { baseDate.value = shiftDays(baseDate.value, 7); }
function thisWeek() { baseDate.value = formatDate(new Date()); }

function slotsText(slots = []) {
  const byDate = groupByDate(slots);
  const parts = Object.keys(byDate)
    .sort()
    .map((d) => `${d}\uff1a${byDate[d].join('\u3001')}`);
  return parts.join('\uff1b');
}

function intervalsText(intervals = []) {
  const arr = Array.isArray(intervals) ? intervals : [];
  if (!arr.length) return '-';
  const map = {};
  arr.forEach((iv) => {
    if (!iv || !iv.date || !iv.start || !iv.end) return;
    if (!map[iv.date]) map[iv.date] = [];
    map[iv.date].push(`${iv.start}~${iv.end}`);
  });
  const dates = Object.keys(map).sort();
  return dates.map((d) => `${d} ${map[d].join('\u3001')}`).join('\uff1b ');
}

async function ensureInit() {
  if (!cfgStore.loaded && !cfgStore.loading) {
    try { await cfgStore.load(); } catch (e) { uni.showToast({ title: errorMessage(e,'配置加载失败'), icon: 'none' }); }
  }
  if (!roomsStore.rooms.length && !roomsStore.loading) {
    try { await roomsStore.load(); } catch (e) { uni.showToast({ title: errorMessage(e,'教室加载失败'), icon: 'none' }); }
  }
}

async function loadWeek() {
  if (!roomId.value) return;
  loading.value = true;
  try {
    await roomsStore.loadRoomReservations(roomId.value, { from: week.value.from, to: week.value.to });
  } finally {
    loading.value = false;
  }
}

function canCancel(item) {
  const meId = authStore.user && authStore.user._id;
  const teacherId = item && (item.teacherId || (item.teacher && item.teacher._id));
  return isTeacher.value && !!meId && !!teacherId && String(meId) === String(teacherId);
}

async function cancelReservation(item) {
  if (!item || !item._id || !canCancel(item)) return;
  const ok = await new Promise((resolve) => {
    uni.showModal({
      title: '确认操作',
      content: '确定要取消该预约吗？',
      success: (res) => resolve(!!res.confirm),
    });
  });
  if (!ok) return;
  try {
    await resvStore.cancel(item._id);
    uni.showToast({ title: '\u5df2\u53d6\u6d88', icon: 'success' });
    await loadWeek();
  } catch (e) {
    uni.showToast({ title: errorMessage(e, '取消失败'), icon: 'none' });
  }
}

watch(week, () => { loadWeek(); });

onLoad(async (query) => { roomId.value = query?.roomId || ''; if (query?.date) baseDate.value = query.date; await ensureInit(); await loadWeek(); });
onMounted(() => { setLoadingHooks(() => ui.begin(), () => ui.end()); });
</script>

<style>
@import '../../io-modules/button/button.css';
@import '../../io-modules/loader/loader.css';
@import '../../io-modules/card/card.css';
@import '../../io-modules/buttondl/buttondl.css';
</style>

<style scoped>
.page {
  padding: 16px;
  max-width: 480px;
  margin: 0 auto;
  background: #f3f4f6; /* 浅灰背景，和白色卡片有对比 */
}
/* 教室名居中显示 */
.title {
  font-size: 20px;
  font-weight: 600;
  display: block;
  text-align: center;
}

/* 周视图信息在按钮下方居中 */
.week-range {
  margin-top: 6px;
  width: 100%;         /* 保证占满整行 */
  display: block;
  text-align: center;  /* 文本居中 */
  font-size: 13px;
  color: #666;
}


.toolbar {
  margin-top: 8px;
  display: flex;
  gap: 8px;
}
.placeholder { color: #999; background: #fafafa; padding: 12px; border-radius: 8px; margin-top: 12px; }
.row-title { font-weight: 600; display: block; }
.row-meta { color:#666; display:block; margin-top:4px; }
.loader-wrap { display:flex; align-items:center; justify-content:center; height: 120px; }
.top-loading { position: fixed; left: 0; right: 0; top: 0; height: 2px; background: linear-gradient(90deg,#111,#aaa,#111); z-index: 9999; opacity: 0.9; }
.row-actions { margin-top: 8px; display: flex; justify-content: flex-end; }

/* */
.header .toolbar {
  justify-content: center;
}
.header .toolbar .fancy {
  float: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 140px;        /* 横向变长 */
  padding: 0.6em 2.4em;    /* 纵向高度约为原来的 0.8 倍 */
}
.header .toolbar .fancy .text {
  text-align: center;
  padding-left: 0;
}

/*  */
.week-strip {
  margin-top: 12px;
  display: flex;
  justify-content: center;
  gap: 8px;
}
.week-strip-col {
  flex: 0 0 90px;
  text-align: center;
}
.week-label {
  font-weight: 700;
  display: block;
  font-size: 16px;
  color: #fff;
}
.week-date {
  margin-top: 2px;
  font-size: 14px;
  color: #b6b1b1;
}
.week-grid-wrapper {
  margin-top: 8px;
  overflow-x: auto;
}
.week-grid {
  display: flex;
  gap: 8px;
  justify-content: center;
  padding-bottom: 4px;
}
.week-col {
  flex: 0 0 110px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.week-card {
  margin: 0;
}

/* 一周纵向分块布局：整页宽度，每天一个分段 */
.week-list {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.week-day-section {
}
.week-day-header {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 4px;
}
.week-card {
  margin-top: 4px;
}

/* 周一 ~ 周日 彩色底：黄 / 蓝 / 绿 / 红 / 黄 / 蓝 / 绿 */
.week-day-header--0 { background: #7a7a41; border-radius: 6px; padding: 4px 8px; }
.week-day-header--1 { background: #4f4fac; border-radius: 6px; padding: 4px 8px; }
.week-day-header--2 { background: #477c47; border-radius: 6px; padding: 4px 8px; }
.week-day-header--3 { background: #9e1b1b; border-radius: 6px; padding: 4px 8px; }
.week-day-header--4 { background: #70700b; border-radius: 6px; padding: 4px 8px; }
.week-day-header--5 { background: #0f0fa5; border-radius: 6px; padding: 4px 8px; }
.week-day-header--6 { background: #108910; border-radius: 6px; padding: 4px 8px; }

.week-empty {
  margin-top: 4px;
  text-align: center;
  font-size: 12px;
  color: #999;
}
</style>






