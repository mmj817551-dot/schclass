<template>
  <view class="page profile-teacher">
    <view v-if="ui.globalLoading" class="top-loading"></view>

    <view class="header">
      <text class="title">{{ '\u6559\u5e08\u4e2d\u5fc3' }}</text>
      <text class="subtitle">
        {{ (user?.name || '-') + ' / ' + (user?.subject || '\u672a\u8bbe\u7f6e\u79d1\u76ee') }}
      </text>
    </view>

    <view class="toolbar nav">
      <view class="spacer"></view>
      <view class="fancy" @click="toSystem">
        <text class="top-key"></text>
        <text class="text">{{ '\u8fd4\u56de\u7cfb\u7edf' }}</text>
        <text class="bottom-key-1"></text>
        <text class="bottom-key-2"></text>
      </view>
      <view class="fancy" @click="toCreate">
        <text class="top-key"></text>
        <text class="text">{{ '\u65b0\u5efa\u9884\u7ea6' }}</text>
        <text class="bottom-key-1"></text>
        <text class="bottom-key-2"></text>
      </view>
      <view class="fancy" @click="doLogout">
        <text class="top-key"></text>
        <text class="text">{{ '\u9000\u51fa\u767b\u5f55' }}</text>
        <text class="bottom-key-1"></text>
        <text class="bottom-key-2"></text>
      </view>
    </view>

    <!-- ����ѧ��������� -->
    <view class="card">
      <view class="row-title">
        {{ '\u641c\u7d22\u5b66\u751f\uff08\u59d3\u540d\u6216\u624b\u673a\u53f7\uff09\uff0c\u5e76\u53d1\u8d77\u7ed1\u5b9a' }}
      </view>
      <view>
        <input
          class="input-plain input-plain--tall"
          type="text"
          v-model="q"
          :placeholder="'\u8bf7\u8f93\u5165\u5173\u952e\u5b57'"
        />
      </view>
      <view class="search-actions">
        <button class="fancy" @click="search">
          <text class="top-key"></text>
          <text class="text">{{ '\u641c\u7d22' }}</text>
          <text class="bottom-key-1"></text>
          <text class="bottom-key-2"></text>
        </button>
      </view>
      <view v-if="searching" class="hint">
        {{ '\u641c\u7d22\u4e2d...' }}
      </view>
      <view v-else-if="results.length" class="list">
        <view v-for="s in results" :key="s._id" class="item">
          <text>{{ (s.name || '-') + ' (' + (s.phone || '-') + ')' }}</text>
          <button class="fancy" @click="bind(s._id)">
            <text class="top-key"></text>
            <text class="text">{{ '\u7ed1\u5b9a' }}</text>
            <text class="bottom-key-1"></text>
            <text class="bottom-key-2"></text>
          </button>
        </view>
      </view>
      <view v-else class="hint">
        {{ '\u8bf7\u8f93\u5165\u5173\u952e\u5b57\u540e\u641c\u7d22\u5b66\u751f' }}
      </view>
    </view>

    <!-- �ҵ�ѧ���б� -->
    <view class="card" style="margin-top:12px;">
      <view class="row-title">{{ '\u6211\u7684\u5b66\u751f' }}</view>
      <view v-if="students.length === 0" class="hint">
        {{ '\u6682\u65e0\u5b66\u751f' }}
      </view>
      <view v-else class="list">
        <view v-for="s in students" :key="s._id" class="item">
          <text>{{ (s.name || '-') + ' (' + (s.phone || '-') + ')' }}</text>
          <text class="badge" :data-status="s.status">{{ statusText(s.status) }}</text>
        </view>
      </view>
    </view>

    <!-- ������� -->
    <view class="card" style="margin-top:12px;">
      <view class="row-title">{{ '\u89e3\u7ed1\u8bf7\u6c42' }}</view>
      <view v-if="unbinds.length === 0" class="hint">
        {{ '\u6682\u65e0' }}
      </view>
      <view v-else class="list">
        <view v-for="b in unbinds" :key="b._id" class="item">
          <text>{{ '\u5b66\u751f\uff1a' + (b.student?.name || '-') }}</text>
          <view style="float:right; display:flex; gap:8px;">
            <button class="fancy" @click="approveUnbind(b._id)">
              <text class="top-key"></text>
              <text class="text">{{ '\u540c\u610f' }}</text>
              <text class="bottom-key-1"></text>
              <text class="bottom-key-2"></text>
            </button>
            <button class="fancy" @click="rejectUnbind(b._id)">
              <text class="top-key"></text>
              <text class="text">{{ '\u62d2\u7edd' }}</text>
              <text class="bottom-key-1"></text>
              <text class="bottom-key-2"></text>
            </button>
          </view>
        </view>
      </view>
    </view>

    <!-- ���¿γ̱� -->
    <view class="card" style="margin-top:12px;">
      <view class="row-title">{{ '\u672c\u6708\u8bfe\u7a0b\u8868' }}</view>
      <view class="filters">
        <view class="filter-item">
          <text class="label">{{ '\u6708\u4efd' }}</text>
          <picker
            mode="date"
            fields="month"
            :value="monthForPicker"
            @change="onMonthChange"
          >
            <view class="input-plain picker-input">{{ month }}</view>
          </picker>
        </view>
      </view>
      <view v-if="scheduleEmpty" class="hint">
        {{ '\u672c\u6708\u6682\u65e0\u8bfe\u7a0b' }}
      </view>
      <view v-else class="schedule-wrapper">
        <view class="schedule-header">
          <view class="cell slot-header">{{ '\u65f6\u95f4\u6bb5' }}</view>
          <view v-for="d in daysInMonth" :key="d.date" class="cell day-header">
            {{ d.day }}
          </view>
        </view>
        <view v-for="row in scheduleRows" :key="row.slot" class="schedule-row">
          <view class="cell slot-label">{{ row.label }}</view>
          <view
            v-for="(cell, idx) in row.cells"
            :key="idx"
            class="cell schedule-cell"
          >
            <text v-if="cell">{{ cell }}</text>
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
import { searchStudents } from '../../services/users.api.js';
import { errorMessage } from '../../utils/errors.js';
import { useUiStore } from '../../store/ui.js';
import { setLoadingHooks } from '../../services/http.js';
import { ensureAuth } from '../../utils/authGuard.js';
import { useAuthStore } from '../../store/auth.js';
import { SLOTS } from '../../constants/dicts.js';
import { formatDate } from '../../utils/datetime.js';

const profile = useProfileStore();
const bindings = useBindingsStore();
const resvStore = useReservationsStore();
const roomsStore = useRoomsStore();
const cfgStore = useConfigStore();
const ui = useUiStore();
const auth = useAuthStore();

const user = computed(() => profile.user);
const bindingsList = computed(() => bindings.myBindings || []);
const students = computed(() =>
  (bindingsList.value || [])
    .map((b) => ({
      _id: b.student?._id || b.studentId,
      name: b.student?.name,
      phone: b.student?.phone,
      status: b.status || 'approved',
    }))
    .filter((x) => x && x._id),
);
const unbinds = computed(() => bindings.pendingUnbindForTeacher || []);

const q = ref('');
const results = ref([]);
const searching = ref(false);
const pendingActions = ref(new Set());

async function ensureInit() {
  await profile.load();
  await bindings.loadMine();
  await bindings.loadPendingUnbindForTeacher();
  if (!roomsStore.rooms.length) {
    await roomsStore.load();
  }
  await loadMonth();
}

async function search() {
  if (searching.value) return;
  if (!q.value) {
    results.value = [];
    return;
  }
  searching.value = true;
  try {
    const { data } = await searchStudents({
      name: q.value,
      phone: q.value,
      page: 1,
      pageSize: 20,
    });
    results.value = Array.isArray(data) ? data : [];
  } finally {
    searching.value = false;
  }
}

async function bind(studentId) {
  const dup = (bindingsList.value || []).some(
    (b) =>
      (b.studentId === studentId || b.student?._id === studentId) &&
      b.status !== 'unbound',
  );
  if (dup) {
    uni.showToast({
      title: '\u5df2\u5b58\u5728\u7ed1\u5b9a\u6216\u8bf7\u6c42\uff0c\u8bf7\u52ff\u91cd\u590d',
      icon: 'none',
    });
    return;
  }
  try {
    await bindings.requestBind(studentId);
    uni.showToast({
      title: '\u5df2\u53d1\u9001\u7ed1\u5b9a\u8bf7\u6c42',
      icon: 'success',
    });
  } catch (e) {
    uni.showToast({ title: errorMessage(e, '\u64cd\u4f5c\u5931\u8d25'), icon: 'none' });
  }
}

async function approveUnbind(id) {
  if (pendingActions.value.has(id)) return;
  const ok = await new Promise((resolve) => {
    uni.showModal({
      title: '\u786e\u8ba4\u64cd\u4f5c',
      content: '\u540c\u610f\u8be5\u5b66\u751f\u7684\u89e3\u7ed1\u7533\u8bf7\uff1f',
      success: (res) => resolve(!!res.confirm),
    });
  });
  if (!ok) return;
  try {
    pendingActions.value.add(id);
    await bindings.approveUnbind(id);
    uni.showToast({ title: '\u5df2\u540c\u610f', icon: 'success' });
    await bindings.loadPendingUnbindForTeacher();
  } catch (e) {
    uni.showToast({ title: errorMessage(e, '\u64cd\u4f5c\u5931\u8d25'), icon: 'none' });
  } finally {
    pendingActions.value.delete(id);
  }
}

async function rejectUnbind(id) {
  if (pendingActions.value.has(id)) return;
  const ok = await new Promise((resolve) => {
    uni.showModal({
      title: '\u786e\u8ba4\u64cd\u4f5c',
      content: '\u62d2\u7edd\u8be5\u5b66\u751f\u7684\u89e3\u7ed1\u7533\u8bf7\uff1f',
      success: (res) => resolve(!!res.confirm),
    });
  });
  if (!ok) return;
  try {
    pendingActions.value.add(id);
    await bindings.rejectUnbind(id);
    uni.showToast({ title: '\u5df2\u62d2\u7edd', icon: 'success' });
    await bindings.loadPendingUnbindForTeacher();
  } catch (e) {
    uni.showToast({ title: errorMessage(e, '\u64cd\u4f5c\u5931\u8d25'), icon: 'none' });
  } finally {
    pendingActions.value.delete(id);
  }
}

function withLoader(fn) {
  try {
    ui.begin();
  } catch (_) {}
  try {
    if (fn) fn();
  } finally {
    setTimeout(() => {
      try {
        ui.end();
      } catch (_) {}
    }, 200);
  }
}

function toSystem() {
  withLoader(() => uni.reLaunch({ url: '/pages/system/index' }));
}

function toCreate() {
  withLoader(() => uni.navigateTo({ url: '/pages/reservation/create' }));
}

function doLogout() {
  try {
    auth.logout();
  } catch (_) {}
  withLoader(() => uni.reLaunch({ url: '/pages/index/index' }));
}

// ---- �γ̱������ͼ�� ----
const now = new Date();
const month = ref(
  `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
);
const monthForPicker = computed(() => `${month.value}-01`);

function onMonthChange(e) {
  const val = e?.detail?.value;
  if (!val) return;
  month.value = val.slice(0, 7); // YYYY-MM
  loadMonth();
}

async function loadMonth() {
  const [yStr, mStr] = month.value.split('-');
  const y = Number(yStr);
  const m = Number(mStr);
  if (!y || !m) return;
  const from = `${month.value}-01`;
  const lastDay = new Date(y, m, 0).getDate();
  const to = formatDate(new Date(y, m - 1, lastDay));
  try {
    await resvStore.loadHistory({ from, to, role: 'teacher' });
  } catch (e) {
    uni.showToast({ title: '\u8bfe\u7a0b\u52a0\u8f7d\u5931\u8d25', icon: 'none' });
  }
}

const daysInMonth = computed(() => {
  const [yStr, mStr] = month.value.split('-');
  const y = Number(yStr);
  const m = Number(mStr);
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

// (date, slot) -> ѧ�������б�
const scheduleMap = computed(() => {
  const map = {};
  const items = resvStore.history?.items || [];
  const monthPrefix = `${month.value}-`;
  items.forEach((r) => {
    const studentsArr = Array.isArray(r.students) ? r.students : [];
    const names = studentsArr.map((s) => s && s.name).filter(Boolean);
    if (!names.length) return;
    const slots = Array.isArray(r.slots) ? r.slots : [];
    slots.forEach((s) => {
      if (!s || !s.date || !s.slot) return;
      if (!s.date.startsWith(monthPrefix)) return;
      const key = `${s.date}__${s.slot}`;
      if (!map[key]) map[key] = new Set();
      names.forEach((n) => map[key].add(n));
    });
  });
  return map;
});

const scheduleEmpty = computed(() => {
  const m = scheduleMap.value;
  return !m || !Object.keys(m).length;
});

const scheduleRows = computed(() => {
  const cfgMap = cfgStore.slotDisplayMap || {};
  const days = daysInMonth.value;
  return SLOTS.map((slot) => {
    const label = cfgMap[slot] || slot;
    const cells = days.map(({ date }) => {
      const key = `${date}__${slot}`;
      const set = scheduleMap.value[key];
      if (!set) return '';
      const names = Array.from(set);
      return names.join('\u3001');
    });
    return { slot, label, cells };
  });
});

onLoad(async () => {
  if (!ensureAuth()) return;
  try {
    await ensureInit();
  } catch (e) {
    try {
      uni.showToast({ title: '\u6570\u636e\u52a0\u8f7d\u5931\u8d25', icon: 'none' });
    } catch (_) {}
  }
  setLoadingHooks(
    () => {
      try {
        ui.begin();
      } catch (_) {}
    },
    () => {
      try {
        ui.end();
      } catch (_) {}
    },
  );
});

function statusText(s) {
  if (s === 'approved') return '\u5df2\u7ed1\u5b9a';
  if (s === 'pending') return '\u5f85\u786e\u8ba4';
  if (s === 'pending-unbind') return '\u5f85\u89e3\u7ed1';
  if (s === 'unbound') return '\u5df2\u89e3\u7ed1';
  return s || '-';
}
</script>

<style>
@import '../../io-modules/card/card.css';
@import '../../io-modules/button/button.css';
@import '../../io-modules/input2/input2.css';
@import '../../io-modules/input-plain/input-plain.css';
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
  margin-top: 12px;
  display: flex;
  gap: 8px;
}
.toolbar.nav {
  margin-bottom: 16px;
}
.spacer {
  flex: 1;
}
.row-title {
  font-weight: 600;
  margin-bottom: 10px;
  display: block;
}
.list {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.hint {
  color: #888;
  margin-top: 6px;
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
.badge {
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 12px;
  color: #fff;
  background: #666;
}
.badge[data-status='approved'] {
  background: #16a34a;
}
.badge[data-status='pending'] {
  background: #f59e0b;
}
.badge[data-status='pending-unbind'] {
  background: #3b82f6;
}
.badge[data-status='unbound'] {
  background: #6b7280;
}
.filters {
  display: flex;
  gap: 12px;
  margin-top: 6px;
}
.filter-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.label {
  color: #666;
}
.picker-input {
  color: #333;
}
.profile-teacher .input-plain--tall {
  height: 44px;
  line-height: 44px;
  padding-top: 0;
  padding-bottom: 0;
  font-size: 16px;
}
.search-actions {
  margin-top: 12px;
  margin-bottom: 8px;
  display: flex;
  justify-content: flex-end;
}
.schedule-wrapper {
  margin-top: 8px;
  overflow-x: auto;
}
.schedule-header,
.schedule-row {
  display: flex;
}
.cell {
  padding: 4px 6px;
  border: 1px solid #eee;
  min-width: 48px;
  font-size: 12px;
  box-sizing: border-box;
}
.slot-header,
.slot-label {
  width: 72px;
  flex-shrink: 0;
  background: #fafafa;
  font-weight: 600;
}
.day-header {
  text-align: center;
  background: #fafafa;
}
.schedule-cell {
  min-height: 32px;
  color: #333;
}
</style>
