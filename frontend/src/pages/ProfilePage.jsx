
import { useEffect, useState } from 'react';
import PasswordInput from '../components/PasswordInput';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

export default function ProfilePage({ admin = false }) {
  const [form, setForm] = useState({ username: '', fullname: '', phone: '', email: '', address: '', password: '', status: '' });
  const [saving, setSaving] = useState(false);
  const { session, updateUser } = useAuth();

  useEffect(() => {
    let alive = true;
    async function load() {
      const res = await api('/auth/me');
      if (!alive) return;
      setForm({
        username: res.user.username || '',
        fullname: res.user.fullname || '',
        phone: res.user.phone || '',
        email: res.user.email || '',
        address: res.user.address || '',
        status: res.user.status || '',
        password: ''
      });
    }
    load().catch(console.error);
    return () => { alive = false; };
  }, []);

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const body = { ...form };
      if (!body.password) delete body.password;
      const res = await api('/auth/me', { method: 'PUT', body });
      updateUser({ fullname: res.user.fullname, email: res.user.email, phone: res.user.phone, address: res.user.address });
      alert('บันทึกข้อมูลบัญชีสำเร็จ');
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="shell py-8">
      <section className="hero p-7">
        <span className="chip">ตั้งค่าบัญชี</span>
        <h1 className="mt-4 text-4xl font-black text-coffee">ข้อมูลบัญชีพื้นฐาน</h1>
        <p className="mt-2 text-muted">แก้ไขข้อมูลบัญชีที่ใช้ในระบบ</p>
      </section>

      <form onSubmit={save} className="card mt-8 grid gap-4 p-6 lg:grid-cols-2">
        <div>
          <label className="label">ชื่อผู้ใช้</label>
          <input className="input bg-white/60" value={form.username} disabled />
        </div>
        <div>
          <label className="label">ชื่อ-นามสกุล</label>
          <input className="input" value={form.fullname} onChange={(e) => setForm({ ...form, fullname: e.target.value })} required />
        </div>
        {!admin && (
          <div>
            <label className="label">เบอร์โทรศัพท์</label>
            <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
        )}
        <div>
          <label className="label">อีเมล</label>
          <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        {!admin && (
          <>
            <div>
              <label className="label">สถานะบัญชี</label>
              <input className="input bg-white/60" value={form.status || '-'} disabled />
            </div>
            <div className="lg:col-span-2">
              <label className="label">ที่อยู่</label>
              <textarea className="textarea" rows="3" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
          </>
        )}
        <div className="lg:col-span-2">
          <label className="label">เปลี่ยนรหัสผ่าน</label>
          <PasswordInput value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="เว้นว่างหากไม่ต้องการเปลี่ยน" />
        </div>
        <div className="lg:col-span-2">
          <button disabled={saving} className="btn btn-primary">บันทึกข้อมูลบัญชี</button>
        </div>
      </form>
    </main>
  );
}
