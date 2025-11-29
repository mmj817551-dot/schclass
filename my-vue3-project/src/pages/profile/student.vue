<template>
  <view class="page profile-student">
    <view v-if="ui.globalLoading" class="top-loading"></view>

    <view class="header">
      <text class="title">学生中心</text>
      <text class="subtitle">{{ user?.name || '-' }}</text>
    </view>

    <view class="toolbar nav">
      <view class="spacer"></view>
      <view class="fancy" @click="toSystem">
        <text class="top-key"></text>
        <text class="text">返回系统</text>
        <text class="bottom-key-1"></text>
        <text class="bottom-key-2"></text>
      </view>
      <view class="fancy" @click="doLogout">
        <text class="top-key"></text>
        <text class="text">&#x9000;&#x51fa;&#x767b;&#x5f55;</text>
        <text class="bottom-key-1"></text>
        <text class="bottom-key-2"></text>
      </view>
    </view>

    <!-- 总览 -->
    <view class="card" style="margin-top:12px;">
      <view class="row-title">总览</view>
      <view class="filters">
        <view class="filter-item">
          <text class="label">科目</text>
          <picker mode="selector" :range="subjects" @change="onSubjectFilterChange">
            <view class="input-plain picker-input">{{ subjectFilter || '全部科目' }}</view>
          </picker>
        </view>
        <view class="filter-item">
          <text class="label">教师</text>
          <picker mode="selector" :range="teacherNames" @change="onTeacherFilterChange">
            <view class="input-plain picker-input">{{ teacherFilterName || '\u5168\u90e8\u6559\u5e08' }}</view>
          </picker>
        </view>
      </view>
      <view class="toolbar">
        <view class="fancy" @click="prevWeek">
          <text class="top-key"></text>
          <text class="text">{{ T.prevWeek }}</text>
          <text class="bottom-key-1"></text>
          <text class="bottom-key-2"></text>
        </view>
        <view class="fancy" @click="thisWeek">
          <text class="top-key"></text>
          <text class="text">{{ T.thisWeek }}</text>
          <text class="bottom-key-1"></text>
          <text class="bottom-key-2"></text>
        </view>
        <view class="fancy" @click="nextWeek">
          <text class="top-key"></text>
          <text class="text">{{ T.nextWeek }}</text>
          <text class="bottom-key-1"></text>
          <text class="bottom-key-2"></text>
        </view>
        <text class="range-tip">{{ week.from }} ~ {{ week.to }}</text>
      </view>
    </view>

    <!-- 待处理绑定请�?-->
    <view class="card" style="margin-top:12px;">
      <view class="row-title">&#x5f85;&#x5904;&#x7406;&#x7ed1;&#x5b9a;&#x8bf7;&#x6c42;</view>
      <view v-if="pendingBindings.length === 0" class="hint">暂无</view>
      <view v-else class="list">
        <view v-for="b in pendingBindings" :key="b._id" class="item">
          <text>&#x6559;&#x5e08;&#xff1a{{ b.teacher?.name || "-" }}&#xff08{{ b.teacher?.subject || "-" }}&#xff09</text>
          <view style="float:right; display:flex; gap:8px;">
            <button class="fancy" @click="confirmApprove(b._id)">
              <text class="top-key"></text>
              <text class="text">同意</text>
              <text class="bottom-key-1"></text>
              <text class="bottom-key-2"></text>
            </button>
            <button class="fancy" @click="confirmReject(b._id)">
              <text class="top-key"></text>
              <text class="text">拒绝</text>
              <text class="bottom-key-1"></text>
              <text class="bottom-key-2"></text>
            </button>
          </view>
        </view>
      </view>
    </view>

    <!-- 已绑定教师（支持请求解绑�?-->
    <view class="card" style="margin-top:12px;">
      <view class="row-title">&#x5df2;&#x7ed1;&#x5b9a;&#x6559;&#x5e08</view>
      <view v-if="teacherItems.length === 0" class="hint">暂无</view>
      <view v-else class="list">
        <view v-for="t in teacherItems" :key="t.bindingId" class="item">
          <text>{{ t.teacherName }}&#xff08{{ t.subject }}&#xff09</text>
          <view style="display:flex; align-items:center; gap:8px;">
            <text class="badge" :data-status="t.status">{{ statusText(t.status) }}</text>
            <button class="fancy" @click="confirmRequestUnbind(t)">
              <text class="top-key"></text>
              <text class="text">请求解绑</text>
              <text class="bottom-key-1"></text>
              <text class="bottom-key-2"></text>
            </button>
          </view>
        </view>
      </view>
    </view>

    <!-- 本周安排（表格形式） -->
    <view class="card" style="margin-top:12px;">
      <view class="row-title">本周安排</view>
      <view v-if="weekTableEmpty" class="hint">暂无</view>
      <view v-else class="history-schedule-wrapper">
        <view class="history-schedule-header">
          <view class="history-cell history-slot-header">时间段</view>
          <view
            v-for="d in weekDaysForTable"
            :key="d.date"
            class="history-cell history-day-header"
          >
            {{ d.label }}
          </view>
        </view>
        <view
          v-for="row in weekScheduleRows"
          :key="row.slot"
          class="history-schedule-row"
        >
          <view class="history-cell history-slot-label">{{ row.label }}</view>
          <view
            v-for="(cell, idx) in row.cells"
            :key="idx"
            class="history-cell history-schedule-cell"
          >
            {{ cell }}
          </view>
        </view>
      </view>
    </view>


    <!-- 历史记录 -->
    <view class="card" style="margin-top:12px;">
      <view class="row-title">历史记录</view>
      <view class="filters">
        <view class="filter-item">
          <text class="label">月份</text>
          <picker mode="date" fields="month" :value="monthForPicker" @change="onMonthChange">
            <view class="input-plain picker-input">{{ month }}</view>
          </picker>
        </view>
      </view>
      <view v-if="historyScheduleEmpty" class="hint">本月暂无记录</view>
      <view v-else class="history-schedule-wrapper">
        <view class="history-schedule-header">
          <view class="history-cell history-slot-header">&#x65f6;&#x95f4;&#x6bb5;</view>
          <view v-for="d in daysInMonth" :key="d.date" class="history-cell history-day-header">
            {{ d.day }}
          </view>
        </view>
        <view v-for="row in historyScheduleRows" :key="row.slot" class="history-schedule-row">
          <view class="history-cell history-slot-label">{{ row.label }}</view>
          <view v-for="(cell, idx) in row.cells" :key="idx" class="history-cell history-schedule-cell">
            {{ cell }}
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { useProfileStore } from '../../store/profile.js';
import { useBindingsStore } from '../../store/bindings.js';
import { useReservationsStore } from '../../store/reservations.js';
import { useRoomsStore } from '../../store/rooms.js';
import { useConfigStore } from '../../store/config.js';
import { useAuthStore } from '../../store/auth.js';
import { useUiStore } from '../../store/ui.js';
import { setLoadingHooks } from '../../services/http.js';
import { ensureAuth } from '../../utils/authGuard.js';
import { formatDate, parseDate, getWeekRange } from '../../utils/datetime.js';
import { SLOTS } from '../../constants/dicts.js';

const profile = useProfileStore();
const bindings = useBindingsStore();
const resv = useReservationsStore();
const rooms = useRoomsStore();
const cfg = useConfigStore();
const auth = useAuthStore();
const ui = useUiStore();

// 避免编码问题：使�?Unicode 文案
const T = {
  prevWeek: '\u4e0a\u4e00\u5468',
  thisWeek: '\u672c\u5468',
  nextWeek: '\u4e0b\u4e00\u5468',
};

const user = computed(() => profile.user);
const subjects = computed(() => cfg.subjects || []);

const subjectFilter = ref('');
const teacherFilterName = ref('');

const todayStr = formatDate(new Date());
const baseDate = ref(todayStr);
const week = computed(() => getWeekRange(baseDate.value, cfg.weekStart || 'monday'));

function shiftDays(dateStr, days) {
  const d = parseDate(dateStr);
  d.setDate(d.getDate() + days);
  return formatDate(d);
}
function prevWeek() { baseDate.value = shiftDays(baseDate.value, -7); loadWeek(); }
function nextWeek() { baseDate.value = shiftDays(baseDate.value, 7); loadWeek(); }
function thisWeek() { baseDate.value = todayStr; loadWeek(); }

const pendingBindings = computed(() => bindings.pendingForStudent || []);
const bindingItems = computed(() => bindings.myBindings || []);
const teacherItems = computed(() =>
  (bindingItems.value || []).map((b) => ({
    bindingId: b._id,
    teacherId: b.teacher?._id || b.teacherId,
    teacherName: b.teacher?.name || '-',
    subject: b.teacher?.subject || '-',
    status: b.status || 'approved',
  })),
);
// 仅包含已绑定教师名称，用于筛�?
const teacherNames = computed(() => {
  const names = (teacherItems.value || [])
    .filter((t) => t.status === 'approved')
    .map((t) => t.teacherName)
    .filter(Boolean);
  return Array.from(new Set(names));
});

async function confirmApprove(id) {
  const ok = await new Promise((resolve) => {
    uni.showModal({
      title: '\u786e\u8ba4',
      content: '\u540c\u610f\u8be5\u6559\u5e08\u7684\u7ed1\u5b9a\u8bf7\u6c42\uff1f',
      success: (res) => resolve(!!res.confirm),
    });
  });
  if (!ok) return;
  try {
    await bindings.approveBind(id);
    await bindings.loadPending();
    uni.showToast({ title: '\u5df2\u540c\u610f', icon: 'success' });
  } catch (e) {
    uni.showToast({ title: '\u64cd\u4f5c\u5931\u8d25', icon: 'none' });
  }
}

async function confirmReject(id) {
  const ok = await new Promise((resolve) => {
    uni.showModal({
      title: '\u786e\u8ba4',
      content: '\u62d2\u7edd\u8be5\u6559\u5e08\u7684\u7ed1\u5b9a\u8bf7\u6c42\uff1f',
      success: (res) => resolve(!!res.confirm),
    });
  });
  if (!ok) return;
  try {
    await bindings.rejectBind(id);
    await bindings.loadPending();
    uni.showToast({ title: '\u5df2\u62d2\u7edd', icon: 'success' });
  } catch (e) {
    uni.showToast({ title: '\u64cd\u4f5c\u5931\u8d25', icon: 'none' });
  }
}

async function confirmRequestUnbind(t) {
  const ok = await new Promise((resolve) => {
    uni.showModal({
      title: '\u786e\u8ba4',
      content: `\u5411\u201c${t.teacherName || '-'}\u201d\u53d1\u8d77\u89e3\u7ed1\uff1f`,
      success: (res) => resolve(!!res.confirm),
    });
  });
  if (!ok) return;
  try {
    await bindings.requestUnbind(t.bindingId);
    await bindings.loadMine();
    uni.showToast({ title: '\u5df2\u53d1\u8d77', icon: 'success' });
  } catch (e) {
    uni.showToast({ title: '\u64cd\u4f5c\u5931\u8d25', icon: 'none' });
  }
}

function onSubjectFilterChange(e) {
  const idx = Number(e?.detail?.value);
  subjectFilter.value = subjects.value[idx] || '';
}
function onTeacherFilterChange(e) {
  const idx = Number(e?.detail?.value);
  teacherFilterName.value = teacherNames.value[idx] || '';
}

function roomName(rid) {
  const r = rooms.byId?.[rid] || (rooms.rooms || []).find((x) => x._id === rid);
  return r?.name || '-';
}

// 使用时间间隔 intervals 展示“日�?+ 时间范围�?
function intervalsText(intervals) {
  const arr = Array.isArray(intervals) ? intervals : [];
  if (!arr.length) return '-';
  const map = {};
  arr.forEach((iv) => {
    if (!iv || !iv.date || !iv.start || !iv.end) return;
    if (!map[iv.date]) map[iv.date] = [];
    map[iv.date].push(`${iv.start}~${iv.end}`);
  });
  const dates = Object.keys(map).sort();
  return dates
    .map((d) => `${d} ${map[d].join('\u3001')}`)
    .join('\uff1b ');
}

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

async function ensureInit() {
  if (!cfg.loaded) await cfg.load();
  if (!rooms.rooms?.length) await rooms.load();
  await profile.load();
  await bindings.loadMine();
  await bindings.loadPending();
}

async function loadWeek() {
  const { from, to } = week.value || {};
  if (!from || !to) return;
  try {
    await resv.loadMyRange({ from, to, role: 'student' });
  } catch (e) {
    try { uni.showToast({ title: '\u672c\u5468\u5b89\u6392\u52a0\u8f7d\u5931\u8d25', icon: 'none' }); } catch (_) {}
  }
}

const filteredWeek = computed(() => {
  const list = resv.myRange || [];
  const filtered = list.filter((r) => {
    if (subjectFilter.value && r.subject !== subjectFilter.value) return false;
    if (teacherFilterName.value && (!r.teacher || r.teacher.name !== teacherFilterName.value)) return false;
    return true;
  });
  return filtered.slice().sort(compareByEarliest);
});
// ================= 本周表格 =================

// 一周 7 天（从 week.from 起）
const weekDaysForTable = computed(() => {
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

// 把 "08:00" 写成 “8点开始”
function shortTimeForDate(intervals, dateStr) {
  const arr = Array.isArray(intervals) ? intervals : [];
  const times = arr
    .filter((iv) => iv && iv.date === dateStr && iv.start)
    .map((iv) => iv.start)
    .sort();
  if (!times.length) return '';
  const hourStr = String(times[0]).split(':')[0] || '0';
  const hour = parseInt(hourStr, 10);
  if (Number.isNaN(hour)) return '';
  return `${hour}点开始`;
}

// 本周表格数据：key = date__slot，value = [ '科目/教室/时间', ... ]
const weekScheduleMap = computed(() => {
  const map = {};
  const list = filteredWeek.value || [];
  list.forEach((r) => {
    const slots = Array.isArray(r.slots) ? r.slots : [];
    if (!slots.length) return;
    const subject = r.subject || '-';
    const roomLabel = roomName(r.roomId);

    slots.forEach((s) => {
      if (!s || !s.date || !s.slot) return;
      const key = `${s.date}__${s.slot}`;
      const timeLabel = shortTimeForDate(r.intervals, s.date);
      const parts = [subject, roomLabel];
      if (timeLabel) parts.push(timeLabel);
      const label = parts.join('/'); // “科目/教室/8点开始”

      if (!map[key]) map[key] = [];
      map[key].push(label);
    });
  });
  return map;
});

const weekTableEmpty = computed(() => {
  const m = weekScheduleMap.value;
  return !m || !Object.keys(m).length;
});

// 生成表格的行：纵轴 SLOTS，横轴 weekDaysForTable
const weekScheduleRows = computed(() => {
  const cfgMap = cfg.slotDisplayMap || {};
  const days = weekDaysForTable.value;
  return SLOTS.map((slot) => {
    const label = cfgMap[slot] || slot;
    const cells = days.map(({ date }) => {
      const key = `${date}__${slot}`;
      const arr = weekScheduleMap.value[key];
      if (!arr || !arr.length) return '';
      // 多条课就用顿号连接
      return arr.join('、');
    });
    return { slot, label, cells };
  });
});


// 历史
const month = ref(`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`);
const monthForPicker = computed(() => `${month.value}-01`);

function onMonthChange(e) {
  const val = e?.detail?.value;
  if (!val) return;
  month.value = val.slice(0, 7); // YYYY-MM
  loadMonth();
}

async function loadMonth() {
  const y = Number(month.value.slice(0, 4));
  const m = Number(month.value.slice(5, 7));
  if (!y || !m) return;
  const from = `${y}-${String(m).padStart(2, '0')}-01`;
  const toDate = new Date(y, m, 0);
  const to = formatDate(toDate);
  try {
    await resv.loadHistory({ from, to, role: 'student' });
  } catch (e) {
    try { uni.showToast({ title: '\u5386\u53f2\u8bb0\u5f55\u52a0\u8f7d\u5931\u8d25', icon: 'none' }); } catch (_) {}
  }
}

const filteredHistory = computed(() => {
  const list = resv.history?.items || [];
  return list.slice().sort(compareByEarliest);
});

const daysInMonth = computed(() => {
  const parts = (month.value || '').split('-');
  if (parts.length < 2) return [];
  const y = Number(parts[0]);
  const m = Number(parts[1]);
  if (!y || !m) return [];
  const lastDay = new Date(y, m, 0).getDate();
  const list = [];
  for (let d = 1; d <= lastDay; d += 1) {
    const dayStr = String(d);
    const dateStr = `${month.value}-${String(d).padStart(2, '0')}`;
    list.push({ day: dayStr, date: dateStr });
  }
  return list;
});

const historyScheduleMap = computed(() => {
  const map = {};
  const items = resv.history?.items || [];
  const monthPrefix = `${month.value}-`;
  items.forEach((r) => {
    const slots = Array.isArray(r.slots) ? r.slots : [];
    if (!slots.length) return;
    const subject = r.subject || '-';
    const teacherName = (r.teacher && r.teacher.name) || '-';
    const label = `${subject} / ${teacherName}`;
    slots.forEach((s) => {
      if (!s || !s.date || !s.slot) return;
      if (!s.date.startsWith(monthPrefix)) return;
      const key = `${s.date}__${s.slot}`;
      if (!map[key]) map[key] = new Set();
      map[key].add(label);
    });
  });
  return map;
});

const historyScheduleEmpty = computed(() => {
  const m = historyScheduleMap.value;
  return !m || !Object.keys(m).length;
});

const historyScheduleRows = computed(() => {
  const cfgMap = cfg.slotDisplayMap || {};
  const days = daysInMonth.value;
  return SLOTS.map((slot) => {
    const label = cfgMap[slot] || slot;
    const cells = days.map(({ date }) => {
      const key = `${date}__${slot}`;
      const set = historyScheduleMap.value[key];
      if (!set) return '';
      const names = Array.from(set);
      return names.join('\u3001');
    });
    return { slot, label, cells };
  });
});

function withLoader(fn) {
  try { ui.begin(); } catch (_) {}
  try { if (fn) fn(); } finally {
    setTimeout(() => { try { ui.end(); } catch (_) {} }, 200);
  }
}
function toSystem() { withLoader(() => uni.reLaunch({ url: '/pages/system/index' })); }
function doLogout() {
  try { auth.logout(); } catch (_) {}
  withLoader(() => uni.reLaunch({ url: '/pages/index/index' }));
}

function openReservation(r) {
  if (!r || !r._id) return;
  uni.navigateTo({ url: `/pages/reservation/detail?id=${encodeURIComponent(r._id)}` });
}

onLoad(async () => {
  if (!ensureAuth()) return;
  try {
    await ensureInit();
    await loadWeek();
    await loadMonth();
  } catch (e) {
    try { uni.showToast({ title: '\u6570\u636e\u52a0\u8f7d\u5931\u8d25', icon: 'none' }); } catch (_) {}
  }
  setLoadingHooks(
    () => { try { ui.begin(); } catch (_) {} },
    () => { try { ui.end(); } catch (_) {} },
  );
});
</script>

<style>
@import '../../io-modules/card/card.css';
@import '../../io-modules/button/button.css';
@import '../../io-modules/input-plain/input-plain.css';
@import '../../io-modules/input2/input2.css';
@import '../../io-modules/buttonweek/buttonweek.css';
</style>

<style scoped>
.page {
  padding: 16px;
  max-width: 480px;
  margin: 0 auto;
}
.title {
  font-size: 20px;
  font-weight: 600;
}
.subtitle {
  color: #666;
  display: block;
  margin-top: 4px;
}
.toolbar {
  margin-top: 8px;
  display: flex;
  gap: 8px;
}
.spacer { flex: 1; }
.row-title { font-weight: 600; margin-bottom: 8px; display: block; }
.list { margin-top: 8px; display: flex; flex-direction: column; gap: 8px; }
.item { display: flex; align-items: center; justify-content: space-between; }
.item-col { display: flex; flex-direction: column; gap: 4px; padding: 8px 0; }
.filters { display: flex; gap: 12px; margin-top: 6px; }
.filter-item { display: flex; flex-direction: column; gap: 4px; }
.label { color: #666; }
.picker-input { color: #333; }
.hint { color: #888; margin-top: 6px; }
.badge { padding: 2px 8px; border-radius: 999px; font-size: 12px; color: #fff; background: #666; }
.badge[data-status='approved'] { background: #16a34a; }
.badge[data-status='pending'] { background: #f59e0b; }
.badge[data-status='pending-unbind'] { background: #3b82f6; }
.badge[data-status='unbound'] { background: #6b7280; }
.top-loading { position: fixed; left: 0; right: 0; top: 0; height: 2px; background: linear-gradient(90deg, #111, #aaa, #111); z-index: 9999; opacity: 0.9; }
.range-tip { margin-left: auto; color: #666; }
.schedule-list { margin-top: 8px; display: flex; flex-direction: column; gap: 8px; }
.schedule-row { padding: 8px 10px; border-radius: 8px; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.06); overflow-x: auto; white-space: nowrap; }
.schedule-cell { font-size: 14px; color: #333; }
.history-schedule-wrapper { margin-top: 8px; overflow-x: auto; }
.history-schedule-header, .history-schedule-row { display: flex; }
.history-cell {
  padding: 6px 8px;
  border: 1px solid #eee;
  min-width: 0;             /* 取消原来的 48px，改用固定列宽控制 */
  font-size: 12px;
  box-sizing: border-box;
}
.history-slot-header,
.history-slot-label {
  width: 72px;              /* 时间段列固定宽度 */
  flex-shrink: 0;
  background: #fafafa;
  font-weight: 600;
  text-align: center;
}
/* 右侧按天的列（周一 ~ 周日 / 1~31 日） */
.history-day-header,
.history-schedule-cell {
  flex: 0 0 80px;           /* 每一列 80px，横向对齐 */
  min-width: 80px;
}
/* 表头单元格额外样式 */
.history-day-header {
  text-align: center;
  background: #fafafa;
}
/* 表格内容行：高度略加大，看起来更整齐 */
.history-schedule-cell {
  min-height: 40px;
  color: #333;
  text-align: center;         /* 如果要“科目/教室/时间”居中，可改为 center */
}
</style>
