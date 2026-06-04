import { getStoredSession } from '../context/AuthContext';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const FILE_BASE_URL = import.meta.env.VITE_FILE_BASE_URL || 'http://localhost:5000';

export const fileUrl = (p) => {
  if (!p) return '/assets/images/farm-1.svg';
  if (p.startsWith('http')) return p;
  if (p.startsWith('uploads/')) return `${FILE_BASE_URL}/${p}`;
  return '/' + p.replace(/^frontend\/assets\/images\//, 'assets/images/');
};

export function getSession() {
  return getStoredSession();
}

export function setSession(s) {
  if (s) localStorage.setItem('coffeeSession', JSON.stringify(s));
  else localStorage.removeItem('coffeeSession');
}

export function logout() {
  localStorage.removeItem('coffeeSession');
}

export async function api(path, options = {}) {
  const session = getStoredSession();
  const headers = { ...(options.headers || {}) };
  let body = options.body;

  if (!(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    body = body ? JSON.stringify(body) : undefined;
  }

  if (session?.token) headers.Authorization = `Bearer ${session.token}`;

  let res;
  try {
    res = await fetch(API_URL + path, { ...options, headers, body });
  } catch {
    throw new Error('เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ กรุณาตรวจสอบว่า backend ทำงานอยู่');
  }

  const data = await res.json().catch(() => ({}));

  if (res.status === 401) {
    localStorage.removeItem('coffeeSession');
    window.dispatchEvent(new CustomEvent('coffee:unauthorized'));
  }

  if (!res.ok) throw new Error(data.message || 'เกิดข้อผิดพลาด');
  return data;
}
