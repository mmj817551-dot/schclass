import { get, post, del } from './http.js';

export async function createReservation(payload) {
  // payload: { roomId, subject, studentIds:[], slots:[{date,slot}] }
  const { data } = await post('/reservations', payload);
  return data;
}

export async function getReservation(id) {
  const { data } = await get(`/reservations/${encodeURIComponent(id)}`);
  return data;
}

export async function deleteReservation(id) {
  const { data } = await del(`/reservations/${encodeURIComponent(id)}`);
  return data;
}

export async function listReservations({ from, to, roomId } = {}) {
  const { data } = await get('/reservations', { params: { from, to, roomId } });
  return data;
}

export async function listMyReservations({ from, to, role } = {}) {
  const { data } = await get('/reservations/my', { params: { from, to, role } });
  return data;
}

export async function listHistory({ from, to, role } = {}) {
  const { data } = await get('/reservations/history', { params: { from, to, role } });
  return data;
}

