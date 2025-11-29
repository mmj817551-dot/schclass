import { post, get } from './http.js';

export async function register(payload) {
  // payload: { role, name, phone, password, subject? }
  const { data } = await post('/auth/register', payload);
  return data;
}

export async function login(payload) {
  // payload: { phone, password }
  const { data } = await post('/auth/login', payload);
  return data;
}

export async function getMe() {
  const { data } = await get('/users/me');
  return data;
}

