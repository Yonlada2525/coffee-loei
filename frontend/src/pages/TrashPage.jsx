import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function TrashPage() {
  const { role } = useAuth();
  return (
    <main className="shell py-8">
      <section className="hero p-7">
        <span className="chip">ข้อมูลที่ลบ</span>
        <h1 className="mt-4 text-4xl font-black text-coffee">ดูข้อมูลที่ลบไปแล้ว</h1>
        <p className="mt-2 text-[#786a62]">ข้อมูลที่ลบจะถูกซ่อนแบบ Soft Delete และสามารถกู้คืนได้จากหน้าจัดการแต่ละประเภท</p>
      </section>
      <section className="mt-8 grid gap-5 md:grid-cols-3">
        {role === 'admin' && <Link to="/admin/owners" className="card p-6 transition hover:-translate-y-1"><b className="text-xl text-coffee">เจ้าของสวน</b><p className="mt-2 text-[#786a62]">กดแท็บ “ข้อมูลที่ลบ” เพื่อกู้คืน</p></Link>}
        <Link to={role === 'owner' ? '/owner/farms' : '/admin/farms'} className="card p-6 transition hover:-translate-y-1"><b className="text-xl text-coffee">สวนกาแฟ</b><p className="mt-2 text-[#786a62]">ดูและกู้คืนสวนที่ลบ</p></Link>
        <Link to={role === 'owner' ? '/owner/productions' : '/admin/productions'} className="card p-6 transition hover:-translate-y-1"><b className="text-xl text-coffee">ผลผลิต</b><p className="mt-2 text-[#786a62]">ดูและกู้คืนผลผลิตที่ลบ</p></Link>
        {role === 'owner' && <Link to="/owner/media" className="card p-6 transition hover:-translate-y-1"><b className="text-xl text-coffee">รูปภาพ</b><p className="mt-2 text-[#786a62]">ดูและกู้คืนรูปที่ลบ</p></Link>}
      </section>
    </main>
  );
}
