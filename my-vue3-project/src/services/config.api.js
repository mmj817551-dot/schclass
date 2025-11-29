import { get, patch } from './http.js';

export async function getConfig() {
  const { data } = await get('/config');
  return data;
}

export async function updateConfig(patchBody) {
  const { data } = await patch('/config', patchBody);
  return data;
}

