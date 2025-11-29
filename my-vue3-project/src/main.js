import { createSSRApp } from "vue";
import { createPinia } from 'pinia';
import App from "./App.vue";
import { setupNavLoader } from './utils/navLoader.js';
export function createApp() {
	const app = createSSRApp(App);
	const pinia = createPinia();
	app.use(pinia);
  // 注册全局页面跳转 loading 拦截器
  try { setupNavLoader(); } catch (_) {}
	return { app };
}
