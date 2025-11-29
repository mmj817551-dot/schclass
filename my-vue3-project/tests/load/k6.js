import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    peak: {
      executor: 'constant-arrival-rate',
      rate: 30, // RPS
      timeUnit: '1s',
      duration: '30s',
      preAllocatedVUs: 50,
      maxVUs: 100,
    },
  },
};

const BASE = __ENV.BASE_URL || 'http://localhost:3000/api';
const TEACHER_PHONE = __ENV.TEACHER_PHONE || '13900093001';
const STUDENT_PHONE = __ENV.STUDENT_PHONE || '13900093002';
const PASSWORD = __ENV.PASSWORD || 'P@ssw0rd';
const D1 = __ENV.D1 || '2025-11-21';

function json(res) {
  try { return res.json(); } catch (_) { return {}; }
}

function login(phone, password) {
  const res = http.post(`${BASE}/auth/login`, JSON.stringify({ phone, password }), { headers: { 'Content-Type': 'application/json' } });
  check(res, { 'login ok': (r) => r.status === 200 && json(r).success });
  return json(res).data;
}

function rooms() {
  const res = http.get(`${BASE}/rooms`);
  check(res, { 'rooms ok': (r) => r.status === 200 && json(r).success });
  const list = json(res).data || [];
  const small = list.find((r) => r.type === 'small');
  return small ? small._id : '';
}

function ensureBinding(teacherToken, studentPhone) {
  // 尝试直接发起绑定；若 409 则忽略
  // 先搜索学生 ID
  const resSearch = http.get(`${BASE}/users/students/search?phone=${encodeURIComponent(studentPhone)}`, { headers: { Authorization: `Bearer ${teacherToken}` } });
  const first = ((json(resSearch).data) || [])[0];
  const studentId = first ? first._id : '';
  if (!studentId) return '';
  const resBind = http.post(`${BASE}/bindings`, JSON.stringify({ studentId }), { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${teacherToken}` } });
  // 200 或 409 均可
  check(resBind, { 'binding ok/dup': (r) => r.status === 200 || r.status === 409 });
  return studentId;
}

export function setup() {
  const t = login(TEACHER_PHONE, PASSWORD);
  const s = login(STUDENT_PHONE, PASSWORD);
  const roomSmall = rooms();
  const studentId = ensureBinding(t.token, STUDENT_PHONE) || (s && s.user && s.user._id) || '';
  return { token: t.token, studentId, roomId: roomSmall };
}

export default function (data) {
  const token = data.token;
  const studentId = data.studentId;
  const roomId = data.roomId;
  const payload = { roomId, subject: '数学', studentIds: [studentId], slots: [{ date: D1, slot: '晚1' }] };
  const res = http.post(`${BASE}/reservations`, JSON.stringify(payload), { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } });
  check(res, { 'create ok or conflict': (r) => r.status === 200 || r.status === 409 });
  sleep(1);
}
