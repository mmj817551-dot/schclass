<template>
  <view class="page reservation-create">
    <view v-if="ui.globalLoading" class="top-loading"></view>

    <view class="header">
      <text class="title">新建预约</text>
      <text class="subtitle">选择教室、时间、学生与科目</text>
    </view>

    <view class="form">
      <view v-if="initializing" class="loader-wrap">
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

      <view class="field">
        <text class="label">教室</text>
        <picker mode="selector" :range="roomNames" @change="onRoomChange">
          <view class="input-plain picker-input">{{ roomLabel }}</view>
        </picker>
      </view>

      <view class="field">
        <text class="label">科目</text>
        <picker mode="selector" :range="subjects" @change="onSubjectChange">
          <view class="input-plain picker-input">{{ subject || '请选择科目' }}</view>
        </picker>
      </view>

      <view class="field">
        <text class="label">选择日期</text>
        <picker mode="date" :value="startDate" @change="(e) => (startDate = e.detail.value)">
          <view class="input-plain picker-input">{{ startDate }}</view>
        </picker>
      </view>

      <view class="field">
        <text class="label">起始时间</text>
        <picker mode="time" :value="startTime" @change="onStartTimeChange">
          <view class="input-plain picker-input">{{ startTime }}</view>
        </picker>
        <text class="hint">结束时间会自动为起始时间的 2 小时后：{{ endTime }}</text>
      </view>

      <view class="field">
        <text class="label">学生</text>
        <view v-if="!myStudents.length" class="hint">
          当前还没有可选学生，请先绑定学生后选择学生
        </view>
        <view v-else>
          <view v-if="isLargeRoom">
            <checkbox-group @change="onStudentsChange">
              <label v-for="s in myStudents" :key="s._id" class="choice">
                <checkbox :value="s._id" /> {{ s.name }}
              </label>
            </checkbox-group>
            <text class="hint">最多可选 {{ capacityHint }} 人</text>
          </view>
          <view v-else>
            <radio-group @change="onStudentChange">
              <label v-for="s in myStudents" :key="s._id" class="choice">
                <radio :value="s._id" /> {{ s.name }}
              </label>
            </radio-group>
          </view>
        </view>
      </view>
    </view>

    <view class="actions">
      <button class="button" @click="handleSubmitClick" :disabled="submitting">
        <span>{{ submitting ? '提交中...' : '提交预约' }}</span>
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { useRoomsStore } from '../../store/rooms.js';
import { useReservationsStore } from '../../store/reservations.js';
import { useBindingsStore } from '../../store/bindings.js';
import { useConfigStore } from '../../store/config.js';
import { useAuthStore } from '../../store/auth.js';
import { useUiStore } from '../../store/ui.js';
import { setLoadingHooks } from '../../services/http.js';
import { ensureAuth } from '../../utils/authGuard.js';
import { SLOTS } from '../../constants/dicts.js';
import { errorMessage } from '../../utils/errors.js';
import { formatDate } from '../../utils/datetime.js';

const roomsStore = useRoomsStore();
const resvStore = useReservationsStore();
const bindStore = useBindingsStore();
const cfgStore = useConfigStore();
const authStore = useAuthStore();
const ui = useUiStore();

const today = formatDate(new Date());

const selectedRoomId = ref('');
const subject = ref('');
const startDate = ref(today);
const startTime = ref('08:00');
const selectedStudents = ref([]);
const submitting = ref(false);
const initializing = ref(true);

const subjects = computed(() => cfgStore.subjects || []);
const rooms = computed(() => roomsStore.rooms || []);
const roomNames = computed(() => rooms.value.map((r) => r.name));

const roomLabel = computed(() => {
  const r = rooms.value.find((x) => x._id === selectedRoomId.value);
  return r ? r.name : '请选择教室';
});

const isLargeRoom = computed(() => {
  const r = rooms.value.find((x) => x._id === selectedRoomId.value);
  return r && r.type === 'large';
});

const capacityHint = computed(() => {
  const r = rooms.value.find((x) => x._id === selectedRoomId.value);
  if (r && typeof r.capacity === 'number') return r.capacity;
  if (typeof cfgStore.largeRoomCapacity === 'number') return cfgStore.largeRoomCapacity;
  return 10;
});

const myStudents = computed(() => {
  const list = bindStore.myBindings || [];
  if (!Array.isArray(list)) return [];
  return list
    .map((b) => b.student || b)
    .filter((s) => s && s._id);
});

const endTime = computed(() => addHours(startTime.value, 2));

function onRoomChange(e) {
  const idx = Number(e?.detail?.value);
  const r = rooms.value[idx];
  selectedRoomId.value = (r && r._id) || '';
  selectedStudents.value = [];
}

function onSubjectChange(e) {
  const idx = Number(e?.detail?.value);
  subject.value = subjects.value[idx];
}

function onStudentsChange(e) {
  selectedStudents.value = (e && e.detail && e.detail.value) || [];
}

function onStudentChange(e) {
  const id = e && e.detail && e.detail.value;
  selectedStudents.value = id ? [id] : [];
}

function onStartTimeChange(e) {
  startTime.value = (e && e.detail && e.detail.value) || '08:00';
}

async function ensureInit() {
  initializing.value = true;
  try {
    if (!cfgStore.loaded) await cfgStore.load();
    if (!roomsStore.rooms.length) await roomsStore.load();
    if (!bindStore.myBindings.length) await bindStore.loadMine();
    await loadOccupancy();
  } finally {
    initializing.value = false;
  }
}

// 
const occupiedCounts = ref({}); // key: `${date}__${slot}`

async function loadOccupancy() {
  if (!selectedRoomId.value || !startDate.value) return;
  const from = startDate.value;
  const to = startDate.value;

  await roomsStore.loadRoomReservations(selectedRoomId.value, { from, to });
  const list = roomsStore.reservationsByRoom[selectedRoomId.value] || [];
  const counts = {};

  list.forEach((r) => {
    const arr = Array.isArray(r.slots) ? r.slots : [];
    arr.forEach((s) => {
      if (!s || !s.date || !s.slot) return;
      const k = String(s.date) + '__' + String(s.slot);
      const inc = Array.isArray(r.studentIds) && r.studentIds.length ? r.studentIds.length : 1;
      counts[k] = (counts[k] || 0) + inc;
    });
  });

  occupiedCounts.value = counts;
}

watch([selectedRoomId, startDate], () => {
  loadOccupancy();
});

function toMinutes(t) {
  const str = String(t || '00:00');
  const parts = str.split(':');
  const h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  return h * 60 + m;
}

function minutesToTime(total) {
  const h = Math.floor(total / 60);
  const m = total % 60;
  const hStr = String(h).padStart(2, '0');
  const mStr = String(m).padStart(2, '0');
  return `${hStr}:${mStr}`;
}

function addHours(t, hours) {
  return minutesToTime(toMinutes(t) + hours * 60);
}

// 
const slotWindows = [
  [480, 600], // 08:00-10:00
  [600, 720], // 10:00-12:00
  [840, 960], // 14:00-16:00
  [960, 1080], // 16:00-18:00
  [1140, 1260], // 19:00-21:00
];

function nearestSlotIndex(st, et) {
  const mid = (st + et) / 2;
  let bestIdx = 0;
  let bestDiff = Infinity;
  for (let i = 0; i < slotWindows.length; i += 1) {
    const [s, e] = slotWindows[i];
    const center = (s + e) / 2;
    const diff = Math.abs(mid - center);
    if (diff < bestDiff || (diff === bestDiff && i < bestIdx)) {
      bestDiff = diff;
      bestIdx = i;
    }
  }
  return bestIdx;
}

function validate() {
  if (!selectedRoomId.value) return '请选择教室';
  if (!subject.value) return '请选择科目';
  if (!startDate.value) return '请选择日期';
  if (!startTime.value) return '请选择起始时间';

  const st = toMinutes(startTime.value);
  const et = st + 120;

  if (et > 1440) return '时间段不能跨天，请调整起始时间';
  if (!myStudents.value.length) return '请先绑定学生后选择学生';
  if (!selectedStudents.value.length) return '请选择学生';

  if (isLargeRoom.value) {
    const cap = capacityHint.value;
    if (selectedStudents.value.length > cap) {
      return '最多只能选择' + cap + ' 人';
    }
  } else if (selectedStudents.value.length !== 1) {
    return '普通教室一次只能选择 1 名学生';
  }

  return '';
}

function handleSubmitClick() {
  try {
    uni.showToast({ title: '已发起提交', icon: 'none' });
  } catch (_) {}
  submit();
}

async function submit() {
  const err = validate();
  if (err) {
    uni.showToast({ title: err, icon: 'none' });
    return;
  }

  const st = toMinutes(startTime.value);
  const et = st + 120;
  const dateStr = startDate.value;

  const intervals = [
    { date: dateStr, start: startTime.value, end: minutesToTime(et) },
  ];

  const idx = nearestSlotIndex(st, et);
  const slotKey = SLOTS[idx];
  const slotsExpanded = [
    { date: dateStr, slot: slotKey },
  ];

  if (!slotsExpanded.length) {
    uni.showToast({
      title: '无法确定预约时间段，请检查选择日期和时间',
      icon: 'none',
    });
    return;
  }

  const conflicts = slotsExpanded.filter((s) => {
    const key = String(s.date) + '__' + String(s.slot);
    const used = occupiedCounts.value[key] || 0;
    return isLargeRoom.value ? used >= (capacityHint.value || 10) : used > 0;
  });

  if (conflicts.length) {
    uni.showToast({
      title: '有 ' + conflicts.length + ' 个时段已被占用',
      icon: 'none',
    });
    return;
  }

  const payload = {
    roomId: selectedRoomId.value,
    subject: subject.value,
    studentIds: selectedStudents.value,
    slots: slotsExpanded,
    intervals,
  };

  submitting.value = true;
  try {
    await resvStore.create(payload);
    uni.showToast({ title: '预约成功', icon: 'success' });
    if (uni.redirectTo) {
      uni.redirectTo({ url: '/pages/system/index' });
    } else {
      uni.navigateTo({ url: '/pages/system/index' });
    }
  } catch (e) {
    uni.showToast({ title: errorMessage(e, '预约失败'), icon: 'none' });
  } finally {
    submitting.value = false;
  }
}

onLoad(async () => {
  if (!ensureAuth()) return;
  await ensureInit();
});

onMounted(async () => {
  await ensureInit();
  setLoadingHooks(() => ui.begin(), () => ui.end());
});
</script>

<style>
@import '../../io-modules/button/button.css';
@import '../../io-modules/loader/loader.css';
@import '../../io-modules/buttonsent/buttonsent.css';
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
.form {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.field {
  background: #fff;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}
.label {
  display: block;
  color: #555;
  margin-bottom: 6px;
}
.field .input {
  width: 100%;
  max-width: 100%;
}
.picker-input {
  color: #333;
}
.choice {
  display: inline-flex;
  align-items: center;
  margin-right: 12px;
  margin-top: 6px;
}
.actions {
  margin-top: 16px;
}
.loader-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 120px;
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
.hint {
  color: #888;
  margin-top: 4px;
  display: block;
}
</style>
