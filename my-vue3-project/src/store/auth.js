// Pinia store skeleton for authentication
// Note: Pinia must be installed and the store registered in app entry for runtime usage.
import { defineStore } from 'pinia';
import { login as apiLogin, getMe } from '../services/auth.api.js';
import { setTokenProvider } from '../services/http.js';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null,
    role: null, // 'teacher' | 'student' | 'admin'
    user: null,
    expiresAt: null,
    loading: false,
  }),
  actions: {
    initHttpAuthBridge() {
      // Bridge http Authorization with current token
      setTokenProvider(() => this.token);
    },
    setAuth({ token, user, expiresAt }) {
      this.token = token || null;
      this.user = user || null;
      this.role = user?.role || null;
      this.expiresAt = expiresAt || null;
      try { if (token) uni.setStorageSync('auth_token', token); } catch (_) {}
    },
    clear() {
      this.token = null;
      this.user = null;
      this.role = null;
      this.expiresAt = null;
      try { uni.removeStorageSync('auth_token'); } catch (_) {}
    },
    async login({ phone, password }) {
      this.loading = true;
      try {
        const res = await apiLogin({ phone, password });
        // expected: { user, token, expiresAt }
        this.setAuth(res);
        this.initHttpAuthBridge();
        return res;
      } finally {
        this.loading = false;
      }
    },
    logout() {
      this.clear();
      this.initHttpAuthBridge();
    },
    async loadMe() {
      if (!this.token) return null;
      this.loading = true;
      try {
        const data = await getMe();
        if (data) {
          this.user = data.user || data;
          this.role = this.user?.role || this.role;
        }
        return data;
      } finally {
        this.loading = false;
      }
    },
  },
});
