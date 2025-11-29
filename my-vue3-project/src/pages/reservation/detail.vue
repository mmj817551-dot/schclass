<template>
  <view class="page reservation-detail">
    <view v-if="ui.globalLoading" class="top-loading"></view>
    <view class="header">
      <text class="title">棰勭害璇︽儏</text>
      <text v-if="data" class="subtitle">{{ data.subject }} 路 {{ roomName }}</text>
    </view>
    <view v-if="loading" class="placeholder">鍔犺浇涓?..</view>
    <view v-else-if="!data" class="placeholder">鏈壘鍒拌棰勭害</view>
    <view v-else class="content">
      <view class="card">
        <text class="row">{{ '\u6559\u5e08\uff1a' + (data.teacher?.name || '-') }}</text>
        <text class="row">{{ '\u5b66\u751f\uff1a' + ((data.students || data.studentIds || []).length || 0) + ' \u4eba' }}</text>
        <text class="row">{{ '\u6559\u5ba4\uff1a' + roomName }}</text>
        <text class="row">{{ '\u65f6\u6bb5\uff1a' + slotsText }}</text>
      </view>
      <view v-if="canCancel" class="actions">
        <view class="fancy" @click="cancel" :class="{ disabled: cancelling }">
          <text class="top-key"></text>
          <text class="text">{{ cancelling ? '鍙栨秷涓?..' : '鍙栨秷棰勭害' }}</text>
          <text class="bottom-key-1"></text>
          <text class="bottom-key-2"></text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { useReservationsStore } from '../../store/reservations.js';
import { useRoomsStore } from '../../store/rooms.js';
import { useAuthStore } from '../../store/auth.js';
import { useUiStore } from '../../store/ui.js';
import { setLoadingHooks } from '../../services/http.js';
import { groupByDate } from '../../utils/datetime.js';
import { errorMessage } from '../../utils/errors.js';
import { ensureAuth } from '../../utils/authGuard.js';

const resvStore = useReservationsStore();
const roomsStore = useRoomsStore();
const authStore = useAuthStore();
const ui = useUiStore();

const id = ref('');
const loading = ref(true);
const cancelling = ref(false);

const data = computed(() => resvStore.current);
const roomName = computed(() => {
  const rid = data.value?.roomId || data.value?.room?._id;
  const r = roomsStore.byId?.[rid];
  return r?.name || '-';
});
const slotsText = computed(() => {
  const byDate = groupByDate(data.value?.slots || []);
  const dates = Object.keys(byDate).sort();
  return dates
    .map((d) => `${d}\uff1a${byDate[d].join('\u3001')}`)
    .join('\uff1b');
});
const canCancel = computed(() => {
  const meId = authStore.user?._id;
  const teacherId = data.value?.teacherId || data.value?.teacher?._id;
  return !!meId && meId === teacherId; // 教师本人可取消
});
async function loadDetail(){
  loading.value = true;
  try{
    await roomsStore.load(); // ensure room names available
    await resvStore.getDetail(id.value);
  } finally{
    loading.value = false;
  }
}

async function cancel(){
  if (!id.value) return;
  cancelling.value = true;
  try{
    await resvStore.cancel(id.value);
    uni.showToast({ title: '\u5df2\u53d6\u6d88', icon: 'success' });
    setTimeout(() => { uni.navigateBack(); }, 400);
  } catch(e){
    uni.showToast({ title: errorMessage(e, '鍙栨秷澶辫触'), icon: 'none' });
  } finally{
    cancelling.value = false;
  }
}

onLoad(async (query) => {
  if (!ensureAuth()) return;
  id.value = query?.id || '';
  await loadDetail();
});

onMounted(() => {
  setLoadingHooks(() => ui.begin(), () => ui.end());
});
</script>

<style>
@import '../../io-modules/button/button.css';
</style>

<style scoped>
.page { padding: 16px; }
.title { font-size: 20px; font-weight: 600; }
.subtitle { color: #666; display: block; margin-top: 4px; }
.placeholder { color: #999; background: #fafafa; padding: 12px; border-radius: 8px; margin-top: 12px; }
.content { margin-top: 12px; display: flex; flex-direction: column; gap: 12px; }
.card { background: #fff; border-radius: 12px; padding: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
.row { display: block; color: #333; margin: 4px 0; }
.actions { margin-top: 8px; }
.disabled { pointer-events: none; opacity: 0.6; }
.top-loading { position: fixed; left: 0; right: 0; top: 0; height: 2px; background: linear-gradient(90deg,#111,#aaa,#111); z-index: 9999; opacity: 0.9; }
</style>



