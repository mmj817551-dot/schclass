import { useUiStore } from '../store/ui.js';

// 在页面跳转时统一插入 0.5s 的 loading 动画（配合各页面的 ui.globalLoading 使用）
export function setupNavLoader() {
  if (typeof uni === 'undefined' || typeof uni.addInterceptor !== 'function') return;

  const methods = ['navigateTo', 'redirectTo', 'reLaunch', 'switchTab', 'navigateBack'];

  methods.forEach((name) => {
    uni.addInterceptor(name, {
      invoke(args) {
        try {
          const ui = useUiStore();
          ui.begin();
          setTimeout(() => {
            try { ui.end(); } catch (_) {}
          }, 500);
        } catch (_) {}
        return args;
      },
    });
  });
}

