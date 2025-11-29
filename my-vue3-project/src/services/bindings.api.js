import { get, post, patch } from './http.js';

// Create binding request (teacher -> student)
export async function createBinding(studentId) {
  const { data } = await post('/bindings', { studentId });
  return data;
}

// Student: list pending binding requests to approve/reject
export async function listPendingForStudent() {
  const { data } = await get('/bindings/pending', { params: { role: 'student' } });
  return data;
}

// Student: approve/reject a binding request
export async function processBinding(bindingId, action) {
  const { data } = await patch(`/bindings/${encodeURIComponent(bindingId)}`, { action });
  return data;
}

export async function listMyBindings() {
  const { data } = await get('/bindings/mine');
  return data;
}

// Student initiates unbind request (requires teacher approval)
export async function requestUnbind(bindingId) {
  const { data } = await post(`/bindings/${encodeURIComponent(bindingId)}/unbind`);
  return data;
}

// Teacher: list pending unbind approvals
export async function listPendingUnbindForTeacher() {
  const { data } = await get('/bindings/pending-unbind');
  return data;
}

// Teacher: approve or reject unbind request
export async function processUnbind(bindingId, action) {
  const { data } = await patch(`/bindings/${encodeURIComponent(bindingId)}/unbind`, { action });
  return data;
}

