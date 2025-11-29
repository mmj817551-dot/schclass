import { useAuthStore } from '../store/auth.js';

export function ensureAuth() {
  try {
    const store = useAuthStore();
    if (!store.token) {
      try {
        const t = uni.getStorageSync && uni.getStorageSync('auth_token');
        if (t) {
          store.setAuth({ token: t, user: store.user, expiresAt: store.expiresAt });
          store.initHttpAuthBridge();
          return true;
        }
      } catch (_) {}
      uni.reLaunch({ url: '/pages/index/index' });
      return false;
    }
    return true;
  } catch (e) {
    try { uni.reLaunch({ url: '/pages/index/index' }); } catch (_) {}
    return false;
  }
}
