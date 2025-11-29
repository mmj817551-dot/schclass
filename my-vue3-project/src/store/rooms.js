import { defineStore } from 'pinia';
import { listRooms, listRoomReservations } from '../services/rooms.api.js';

export const useRoomsStore = defineStore('rooms', {
  state: () => ({
    rooms: [],
    loading: false,
    reservationsByRoom: {}, // { [roomId]: [{ roomId, slots:[{date,slot}], teacher, studentIds, subject }] }
    lastRange: null, // { from, to }
  }),
  getters: {
    smallRooms: (state) => state.rooms.filter((r) => r.type === 'small' && r.enabled !== false),
    largeRooms: (state) => state.rooms.filter((r) => r.type === 'large' && r.enabled !== false),
    byId: (state) => state.rooms.reduce((acc, r) => { acc[r._id] = r; return acc; }, {}),
  },
  actions: {
    async load() {
      this.loading = true;
      try {
        const data = await listRooms();
        this.rooms = Array.isArray(data) ? data : [];
        return this.rooms;
      } finally {
        this.loading = false;
      }
    },
    async loadRoomReservations(roomId, { from, to } = {}) {
      if (!roomId || !from || !to) return [];
      const res = await listRoomReservations(roomId, { from, to });
      this.reservationsByRoom[roomId] = Array.isArray(res) ? res : [];
      this.lastRange = { from, to };
      return this.reservationsByRoom[roomId];
    },
    clearReservations() {
      this.reservationsByRoom = {};
      this.lastRange = null;
    },
  },
});

