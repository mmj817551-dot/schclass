import { defineStore } from 'pinia';
import {
  listReservations,
  listMyReservations,
  listHistory,
  createReservation,
  deleteReservation,
  getReservation,
} from '../services/reservations.api.js';

function cacheKey({ from, to, roomId }) {
  return `${from || ''}__${to || ''}__${roomId || '*'}`;
}

export const useReservationsStore = defineStore('reservations', {
  state: () => ({
    loading: false,
    rangeCache: {}, // { key: [reservations] }
    myRange: [],
    history: { items: [], meta: null },
    current: null,
  }),
  actions: {
    async loadRange({ from, to, roomId } = {}) {
      if (!from || !to) return [];
      const key = cacheKey({ from, to, roomId });
      this.loading = true;
      try {
        const data = await listReservations({ from, to, roomId });
        this.rangeCache[key] = Array.isArray(data) ? data : [];
        return this.rangeCache[key];
      } finally {
        this.loading = false;
      }
    },
    getCachedRange({ from, to, roomId } = {}) {
      const key = cacheKey({ from, to, roomId });
      return this.rangeCache[key] || [];
    },
    async loadMyRange({ from, to, role } = {}) {
      if (!from || !to) return [];
      this.loading = true;
      try {
        const data = await listMyReservations({ from, to, role });
        this.myRange = Array.isArray(data) ? data : [];
        return this.myRange;
      } finally {
        this.loading = false;
      }
    },
    async loadHistory({ from, to, role } = {}) {
      if (!from || !to) return { items: [] };
      this.loading = true;
      try {
        const data = await listHistory({ from, to, role });
        // normalize to { items, meta }
        if (Array.isArray(data)) {
          this.history = { items: data, meta: null };
        } else if (data && typeof data === 'object') {
          this.history = { items: data.items || data.data || [], meta: data.meta || null };
        } else {
          this.history = { items: [], meta: null };
        }
        return this.history;
      } finally {
        this.loading = false;
      }
    },
    async create(payload) {
      const res = await createReservation(payload);
      // leave cache refresh to caller (after success) to avoid heavy merging
      return res;
    },
    async cancel(id) {
      const res = await deleteReservation(id);
      return res;
    },
    async getDetail(id) {
      this.loading = true;
      try {
        const data = await getReservation(id);
        this.current = data || null;
        return this.current;
      } finally {
        this.loading = false;
      }
    },
    clearCache() {
      this.rangeCache = {};
      this.myRange = [];
      this.history = { items: [], meta: null };
      this.current = null;
    },
  },
});

