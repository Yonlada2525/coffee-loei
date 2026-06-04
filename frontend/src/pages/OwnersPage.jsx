
import { Download, FileSpreadsheet, Printer } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import PasswordInput from '../components/PasswordInput';
import { api } from '../utils/api';
import { exportCsv, exportExcel, printOfficialReport } from '../utils/exporters';
import RestoreCountdown from '../components/RestoreCountdown';

const blank = { username: '', password: '', fullname: '', phone: '', email: '', address: '', status: 'approved' };
const headers = ['ชื่อผู้ใช้', 'ชื่อ-นามสกุล', 'เบอร์โทรศัพท์', 'อีเมล', 'ที่อยู่', 'สถานะ'];
const rowValues = (o) => [o.username, o.fullname, o.phone, o.email, o.address, o.status];

export default function OwnersPage() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(blank);
  const [edit, setEdit] = useState(null);
  const [deleted, setDeleted] = useState(false);
  const exportRows = useMemo(() => rows.map(rowValues), [rows]);
  const load = () => api(`/owners${deleted ? '?deleted=1' : ''}`).then(setRows);

  useEffect(() => { load(); }, [deleted]);

  async function save(e) {
    e.preventDefault();
    if (edit) await api(`/owners/${edit}`, { method: 'PUT', body: form });
    else await api('/owners', { method: 'POST', body: form });
    setForm(blank);
    setEdit(null);
    load();
  }

  function start(owner) {
    setEdit(owner.owner_id);
    setForm({ ...owner, password: '' });
  }

  return (
    <main className="shell py-8">
      <section className="hero p-7">
        <span className="chip">จัดการผู้ใช้</span>
        <h1 className="mt-4 text-4xl font-black text-coffee">จัดการเจ้าของสวน</h1>
        <p className="mt-2 text-muted">เพิ่ม แก้ไข ลบ ตรวจสอบสถานะ และส่งออกข้อมูลเจ้าของสวน</p>
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-3">
        <form onSubmit={save} className="card grid gap-3 p-5">
          <h2 className="text-xl font-black text-coffee">{edit ? 'แก้ไข' : 'เพิ่ม'}เจ้าของสวน</h2>
          <input className="input" placeholder="ชื่อผู้ใช้" value={form.username || ''} onChange={(e) => setForm({ ...form, username: e.target.value })} required disabled={!!edit} />
          <PasswordInput value={form.password || ''} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder={edit ? 'เว้นว่างหากไม่เปลี่ยนรหัสผ่าน' : 'รหัสผ่าน'} />
          <input className="input" placeholder="ชื่อ-นามสกุล" value={form.fullname || ''} onChange={(e) => setForm({ ...form, fullname: e.target.value })} required />
          <input className="input" placeholder="เบอร์โทรศัพท์" value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input className="input" placeholder="อีเมล" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <textarea className="textarea" placeholder="ที่อยู่" value={form.address || ''} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <select className="select" value={form.status || 'approved'} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="approved">อนุมัติ</option>
            <option value="pending">รอตรวจสอบ</option>
            <option value="rejected">ไม่อนุมัติ</option>
          </select>
          <button className="btn btn-primary">{edit ? 'บันทึกแก้ไข' : 'เพิ่มข้อมูล'}</button>
          {edit && <button type="button" className="btn btn-ghost" onClick={() => { setEdit(null); setForm(blank); }}>ยกเลิก</button>}
        </form>

        <div className="lg:col-span-2">
          <div className="mb-3 flex flex-wrap gap-3">
            <button className={!deleted ? 'btn btn-primary' : 'btn btn-ghost'} onClick={() => setDeleted(false)}>ข้อมูลปกติ</button>
            <button className={deleted ? 'btn btn-primary' : 'btn btn-ghost'} onClick={() => setDeleted(true)}>ข้อมูลที่ลบ</button>
            <button className="btn btn-mint" onClick={() => exportExcel('รายงานเจ้าของสวน', headers, exportRows, 'รายงานข้อมูลเจ้าของสวน')}><FileSpreadsheet size={18} />Excel</button>
            <button className="btn btn-rose" onClick={() => exportCsv('รายงานเจ้าของสวน', headers, exportRows)}><Download size={18} />CSV</button>
            <button className="btn btn-primary" onClick={() => printOfficialReport('รายงานข้อมูลเจ้าของสวน', headers, exportRows)}><Printer size={18} />รายงาน/PDF</button>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>ชื่อ</th><th>ติดต่อ</th><th>สถานะ</th><th>จัดการ</th></tr></thead>
              <tbody>
                {rows.map((o) => (
                  <tr key={o.owner_id}>
                    <td><b>{o.fullname}</b><br />{o.username}</td>
                    <td>{o.phone || '-'}<br />{o.email || '-'}</td>
                    <td><span className="chip">{o.status}</span></td>
                    <td>
                      <div className="flex flex-wrap gap-2">
                        {deleted
                          ? <><RestoreCountdown days={o.restore_days_left} /><button className="btn btn-mint" onClick={() => api(`/owners/${o.owner_id}/restore`, { method: 'PATCH' }).then(load)}>กู้คืน</button></>
                          : <><button className="btn btn-rose" onClick={() => start(o)}>แก้ไข</button><button className="btn btn-ghost" onClick={() => confirm('ลบเจ้าของสวนนี้?') && api(`/owners/${o.owner_id}`, { method: 'DELETE' }).then(load)}>ลบ</button></>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
