
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PasswordInput from '../components/PasswordInput';
import SmartLocationFields from '../components/SmartLocationFields';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

export default function Register() {
  const [form, setForm] = useState({
    username: '', password: '', fullname: '', phone: '', email: '',
    district: '', sub_district: '', village: '', postal_code: '', house_no: ''
  });
  const nav = useNavigate();
  const { session } = useAuth();

  useEffect(() => {
    if (session?.user?.role === 'admin') nav('/admin', { replace: true });
    if (session?.user?.role === 'owner') nav('/owner', { replace: true });
  }, [nav, session]);

  async function submit(e) {
    e.preventDefault();
    const address = `${form.house_no || ''} ${form.village || ''} ต.${form.sub_district || ''} อ.${form.district || ''} จ.เลย ${form.postal_code || ''}`;
    await api('/auth/register', { method: 'POST', body: { ...form, address } });
    alert('สมัครสมาชิกสำเร็จ กรุณารอผู้ดูแลระบบตรวจสอบบัญชี');
    nav('/login');
  }

  return (
    <main className="shell py-8">
      <section className="hero p-7">
        <span className="chip">ลงทะเบียนเจ้าของสวน</span>
        <h1 className="mt-4 text-4xl font-black text-coffee">สร้างบัญชีเจ้าของสวนกาแฟ</h1>
        <p className="mt-2 text-muted">กรอกข้อมูลพื้นฐานเพื่อส่งคำขอเข้าใช้งานระบบ</p>
      </section>

      <form onSubmit={submit} className="card mt-8 grid gap-4 p-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div><label className="label">ชื่อผู้ใช้</label><input className="input" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required /></div>
          <div><label className="label">รหัสผ่าน</label><PasswordInput value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></div>
          <div><label className="label">ชื่อ-นามสกุล</label><input className="input" value={form.fullname} onChange={(e) => setForm({ ...form, fullname: e.target.value })} required /></div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div><label className="label">บ้านเลขที่</label><input className="input" value={form.house_no} onChange={(e) => setForm({ ...form, house_no: e.target.value })} /></div>
          <div><label className="label">เบอร์โทรศัพท์</label><input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          <div><label className="label">อีเมล</label><input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
        </div>

        <SmartLocationFields form={form} setForm={setForm} />
        <button className="btn btn-primary">ส่งคำขอลงทะเบียน</button>
      </form>
    </main>
  );
}
