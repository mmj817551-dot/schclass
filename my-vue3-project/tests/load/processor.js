// Artillery processor hooks to perform login & setup
// Node 18+ provides global fetch; if your runtime lacks it, install node-fetch.

async function login(baseUrl, phone, password) {
  const res = await fetch(baseUrl + '/auth/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, password })
  });
  const json = await res.json();
  if (!json.success) throw new Error('Login failed');
  return json.data;
}

async function searchStudent(baseUrl, token, phone) {
  const res = await fetch(baseUrl + `/users/students/search?phone=${encodeURIComponent(phone)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  if (!json.success) throw new Error('Search student failed');
  const first = (json.data || [])[0];
  return first ? first._id : null;
}

async function createBinding(baseUrl, token, studentId) {
  const res = await fetch(baseUrl + '/bindings', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ studentId })
  });
  const json = await res.json();
  // 409 duplicate binding is acceptable in setup phase
  if (!json.success && res.status !== 409) throw new Error('Create binding failed');
  return json;
}

module.exports = {
  // artillery provides 'context' and 'events'
  loginTeacher: async function (context, events, done) {
    try {
      const baseUrl = context.config.target;
      const { teacherPhone, password } = context.vars;
      const data = await login(baseUrl, teacherPhone, password);
      context.vars.teacherToken = data.token;
      context.vars.teacherId = data.user && data.user._id;
      done();
    } catch (e) { done(e); }
  },
  ensureBinding: async function (context, events, done) {
    try {
      const baseUrl = context.config.target;
      const { teacherToken, studentPhone } = context.vars;
      const studentId = await searchStudent(baseUrl, teacherToken, studentPhone);
      context.vars.studentId = studentId;
      if (studentId) await createBinding(baseUrl, teacherToken, studentId);
      done();
    } catch (e) { done(e); }
  },
  recordResult: function (context, events, done) {
    // You can aggregate success/409 counts here if needed
    done();
  }
};
