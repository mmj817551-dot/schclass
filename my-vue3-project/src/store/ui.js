import { defineStore } from 'pinia';

export const useUiStore = defineStore('ui', {
  state: () => ({
    pending: 0,
    globalLoading: false,
    message: null, // { type: 'info'|'success'|'warning'|'error', text }
    filters: {
      subject: null,
      roomType: null, // 'small' | 'large' | null
      dateRange: null, // { from, to }
    },
  }),
  actions: {
    begin() {
      this.pending += 1;
      this.globalLoading = this.pending > 0;
    },
    end() {
      this.pending = Math.max(0, this.pending - 1);
      this.globalLoading = this.pending > 0;
    },
    setMessage(msg) {
      this.message = msg || null;
    },
    clearMessage() {
      this.message = null;
    },
    setFilters(patch) {
      this.filters = { ...this.filters, ...(patch || {}) };
    },
    clearFilters() {
      this.filters = { subject: null, roomType: null, dateRange: null };
    },
  },
});

