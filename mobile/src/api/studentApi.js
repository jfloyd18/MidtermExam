import { API_BASE_URL, USE_METHOD_OVERRIDE } from '../config';

// Talks to the custom PHP REST API (full CRUD)
const ENDPOINT = `${API_BASE_URL}/students.php`;
const HEADERS = { 'Content-Type': 'application/json', Accept: 'application/json' };
const TIMEOUT_MS = 15000;

async function request(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let res;
  try {
    res = await fetch(url, { ...options, headers: HEADERS, signal: controller.signal });
  } catch (e) {
    throw new Error(
      e.name === 'AbortError'
        ? 'The server took too long to respond.'
        : 'Cannot reach the API. Check that XAMPP is running and API_BASE_URL in src/config.js is correct.'
    );
  } finally {
    clearTimeout(timer);
  }

  let body;
  try {
    body = await res.json();
  } catch {
    throw new Error(`Unexpected response from server (${res.status}).`);
  }

  if (res.ok && body.success) return body;

  // Show server-side validation errors if there are any
  if (body.errors && Object.keys(body.errors).length) {
    throw new Error(Object.values(body.errors).join('\n'));
  }
  throw new Error(body.message || `Request failed (${res.status}).`);
}

// READ — GET all
export async function getStudents() {
  const res = await request(ENDPOINT);
  return res.data || [];
}

// READ — GET one
export async function getStudent(id) {
  const res = await request(`${ENDPOINT}?id=${id}`);
  return res.data;
}

// CREATE — POST
export async function createStudent(student) {
  const res = await request(ENDPOINT, { method: 'POST', body: JSON.stringify(student) });
  return res.data;
}

// UPDATE — PUT
export async function updateStudent(id, student) {
  const res = USE_METHOD_OVERRIDE
    ? await request(`${ENDPOINT}?id=${id}`, {
        method: 'POST',
        body: JSON.stringify({ ...student, _method: 'PUT' }),
      })
    : await request(`${ENDPOINT}?id=${id}`, { method: 'PUT', body: JSON.stringify(student) });
  return res.data;
}

// DELETE — DELETE
export async function deleteStudent(id) {
  if (USE_METHOD_OVERRIDE) {
    await request(`${ENDPOINT}?id=${id}`, {
      method: 'POST',
      body: JSON.stringify({ _method: 'DELETE' }),
    });
  } else {
    await request(`${ENDPOINT}?id=${id}`, { method: 'DELETE' });
  }
}
