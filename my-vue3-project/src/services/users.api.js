import { get } from './http.js';

export async function searchStudents({ name, phone, page = 1, pageSize = 20 } = {}) {
  const { data, meta } = await get('/users/students/search', { params: { name, phone, page, pageSize } });
  return { data, meta };
}

export async function getTeacherStudents(teacherId) {
  const { data } = await get(`/teachers/${encodeURIComponent(teacherId)}/students`);
  return data;
}

export async function getStudentTeachers(studentId) {
  // Optional helper if backend provides endpoint
  const { data } = await get(`/students/${encodeURIComponent(studentId)}/teachers`);
  return data;
}

