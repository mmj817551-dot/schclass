import { defineStore } from 'pinia';
import { getMe } from '../services/auth.api.js';
import { getTeacherStudents, getStudentTeachers } from '../services/users.api.js';

export const useProfileStore = defineStore('profile', {
  state: () => ({
    loading: false,
    user: null,
    teacher: { subject: null, students: [] },
    student: { teachers: [] },
  }),
  actions: {
    async load() {
      this.loading = true;
      try {
        const meRes = await getMe();
        const user = meRes?.user || meRes || null;
        this.user = user;
        if (!user) return null;

        if (user.role === 'teacher') {
          // load teacher's students
          try {
            const students = await getTeacherStudents(user._id);
            this.teacher = { subject: user.subject || null, students: Array.isArray(students) ? students : [] };
          } catch (_) {
            this.teacher = { subject: user.subject || null, students: [] };
          }
        } else if (user.role === 'student') {
          // load student's teachers (optional endpoint)
          try {
            const teachers = await getStudentTeachers(user._id);
            this.student = { teachers: Array.isArray(teachers) ? teachers : [] };
          } catch (_) {
            this.student = { teachers: [] };
          }
        }
        return this.user;
      } finally {
        this.loading = false;
      }
    },
    clear() {
      this.user = null;
      this.teacher = { subject: null, students: [] };
      this.student = { teachers: [] };
    },
  },
});

