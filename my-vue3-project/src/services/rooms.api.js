import { get } from './http.js';

export async function listRooms() {
  const { data } = await get('/rooms');
  return data;
}

export async function listRoomReservations(roomId, { from, to } = {}) {
  const { data } = await get(`/rooms/${encodeURIComponent(roomId)}/reservations`, { params: { from, to } });
  return data;
}

