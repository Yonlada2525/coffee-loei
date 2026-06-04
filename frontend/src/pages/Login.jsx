
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PasswordInput from '../components/PasswordInput';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

export default function Login() {
  const [form, setForm] = useState({ role: 'owner', username: '', password: '' });
  const [err, setErr] = useState('');
  const nav = useNavigate();
  const { session, setSession } = useAuth();

  useEffect(() => {
    if (session?.user?.role === 'admin') nav('/admin', { replace: true });
    if (session?.user?.role === 'owner') nav('/owner', { replace: true });
  }, [nav, session]);

  async function submit(e) {
    e.preventDefault();
    setErr('');
    try {
      const data = await api('/auth/login', { method: 'POST', body: form });
      setSession(data);
      nav(data.user.role === 'admin' ? '/admin' : '/owner', { replace: true });
    } catch (x) {
      setErr(x.message);
    }
  }

  return (
    <main className="shell grid gap-8 py-10 md:grid-cols-2 md:items-center">
      <section className="hero official-hero p-8">
        <span className="chip">เข้าสู่ระบบ</span>
        <h1 className="mt-4 text-4xl font-black text-coffee md:text-6xl">ระบบสมาชิก Coffee Loei DB</h1>
        <p className="mt-4 leading-8 text-muted">
          สำหรับผู้ดูแลระบบและเจ้าของสวนกาแฟจังหวัดเลย เพื่อจัดการข้อมูลตามสิทธิ์การใช้งาน
        </p>
        <img src="/assets/images/farm-2.svg" className="mt-8 rounded-[32px] bg-white/60 p-3 shadow-soft" alt="สวนกาแฟจังหวัดเลย" />
      </section>

      <form onSubmit={submit} className="card grid gap-4 p-6 md:p-8">
        <h2 className="text-2xl font-black text-coffee">เข้าสู่ระบบ</h2>
        {err && <div className="rounded-2xl bg-red-50 p-3 font-bold text-red-700">{err}</div>}

        

        <div>
          <label className="label">ชื่อผู้ใช้</label>
          <input className="input" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
        </div>

        <div>
          <label className="label">รหัสผ่าน</label>
          <PasswordInput value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        </div>

        <button className="btn btn-primary">เข้าสู่ระบบ</button>
      </form>
    </main>
  );
}
