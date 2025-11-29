import { defineStore } from 'pinia';
import {
  createBinding,
  listPendingForStudent,
  processBinding,
  listMyBindings,
  requestUnbind,
  listPendingUnbindForTeacher,
  processUnbind,
} from '../services/bindings.api.js';

export const useBindingsStore = defineStore('bindings', {
  state: () => ({
    loading: false,
    myBindings: [], // normalized: [{ _id, teacher, student }]
    pendingForStudent: [], // to approve/reject
    pendingUnbindForTeacher: [], // teacher approvals for unbind
  }),
  actions: {
    async loadMine() {
      this.loading = true;
      try {
        const data = await listMyBindings();
        this.myBindings = Array.isArray(data) ? data : [];
        return this.myBindings;
      } finally {
        this.loading = false;
      }
    },
    async loadPending() {
      // pending binding requests for student
      const data = await listPendingForStudent();
      this.pendingForStudent = Array.isArray(data) ? data : [];
      return this.pendingForStudent;
    },
    async loadPendingUnbindForTeacher() {
      const data = await listPendingUnbindForTeacher();
      this.pendingUnbindForTeacher = Array.isArray(data) ? data : [];
      return this.pendingUnbindForTeacher;
    },
    async requestBind(studentId) {
      const res = await createBinding(studentId);
      return res;
    },
    async approveBind(bindingId) {
      const res = await processBinding(bindingId, 'approve');
      return res;
    },
    async rejectBind(bindingId) {
      const res = await processBinding(bindingId, 'reject');
      return res;
    },
    async requestUnbind(bindingId) {
      const res = await requestUnbind(bindingId);
      return res;
    },
    async approveUnbind(bindingId) {
      const res = await processUnbind(bindingId, 'approve');
      return res;
    },
    async rejectUnbind(bindingId) {
      const res = await processUnbind(bindingId, 'reject');
      return res;
    },
    clear() {
      this.myBindings = [];
      this.pendingForStudent = [];
      this.pendingUnbindForTeacher = [];
    },
  },
});

