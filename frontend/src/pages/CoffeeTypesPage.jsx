
import { Download, FileSpreadsheet, Printer } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { api } from '../utils/api';
import { exportCsv, exportExcel, printOfficialReport } from '../utils/exporters';
import RestoreCountdown from '../components/RestoreCountdown';

const blank = { coffee_name: '', process_type: 'Washed', description: '' };
const headers = ['พันธุ์กาแฟ', 'วิธีแปรรูป', 'รายละเอียด'];
const rowValues = (c) => [c.coffee_name, c.process_type, c.description];

export default function CoffeeTypesPage() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(blank);
  const [edit, setEdit] = useState(null);
  const [deleted, setDeleted] = useState(false);
  const exportRows = useMemo(() => rows.map(rowValues), [rows]);
  const load = () => api(`/coffee-types${deleted ? '?deleted=1' : ''}`).then(setRows);

  useEffect(() => { load(); }, [deleted]);

  async function save(e) {
    e.preventDefault();
    await api(edit ? `/coffee-types/${edit}` : '/coffee-types', { method: edit ? 'PUT' : 'POST', body: form });
    setForm(blank);
    setEdit(null);
    load();
  }

  return (
    <main className="shell py-8">
      <section className="hero p-7">
        <span className="chip">ข้อมูลกาแฟ</span>
        <h1 className="mt-4 text-4xl font-black text-coffee">จัดการพันธุ์กาแฟ</h1>
        <p className="mt-2 text-muted">เพิ่ม แก้ไข ลบ และส่งออกข้อมูลพันธุ์กาแฟ</p>
      </section>
      <section className="mt-8 grid gap-5 lg:grid-cols-3">
        <form onSubmit={save} className="card grid gap-3 p-5">
          <h2 className="text-xl font-black text-coffee">{edit ? 'แก้ไข' : 'เพิ่ม'}พันธุ์กาแฟ</h2>
          <input className="input" placeholder="ชื่อพันธุ์กาแฟ" value={form.coffee_name} onChange={(e) => setForm({ ...form, coffee_name: e.target.value })} required />
          <select className="select" value={form.process_type} onChange={(e) => setForm({ ...form, process_type: e.target.value })}>{['Washed', 'Honey', 'Natural', 'Mixed'].map((x) => <option key={x}>{x}</option>)}</select>
          <textarea className="textarea" placeholder="รายละเอียด" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <button className="btn btn-primary">{edit ? 'บันทึก' : 'เพิ่มข้อมูล'}</button>
          {edit && <button type="button" className="btn btn-ghost" onClick={() => { setEdit(null); setForm(blank); }}>ยกเลิก</button>}
        </form>
        <div className="lg:col-span-2">
          <div className="mb-3 flex flex-wrap gap-3">
            <button className={!deleted ? 'btn btn-primary' : 'btn btn-ghost'} onClick={() => setDeleted(false)}>ข้อมูลปกติ</button>
            <button className={deleted ? 'btn btn-primary' : 'btn btn-ghost'} onClick={() => setDeleted(true)}>ข้อมูลที่ลบ</button>
            <button className="btn btn-mint" onClick={() => exportExcel('รายงานพันธุ์กาแฟ', headers, exportRows, 'รายงานข้อมูลพันธุ์กาแฟ')}><FileSpreadsheet size={18} />Excel</button>
            <button className="btn btn-rose" onClick={() => exportCsv('รายงานพันธุ์กาแฟ', headers, exportRows)}><Download size={18} />CSV</button>
            <button className="btn btn-primary" onClick={() => printOfficialReport('รายงานข้อมูลพันธุ์กาแฟ', headers, exportRows)}><Printer size={18} />รายงาน/PDF</button>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>พันธุ์กาแฟ</th><th>กระบวนการ</th><th>รายละเอียด</th><th>จัดการ</th></tr></thead>
              <tbody>{rows.map((c) => <tr key={c.coffee_id}><td><b>{c.coffee_name}</b></td><td>{c.process_type}</td><td>{c.description || '-'}</td><td>{deleted ? <div className="flex flex-wrap gap-2"><RestoreCountdown days={c.restore_days_left} /><button className="btn btn-mint" onClick={() => api(`/coffee-types/${c.coffee_id}/restore`, { method: 'PATCH' }).then(load)}>กู้คืน</button></div> : <div className="flex flex-wrap gap-2"><button className="btn btn-rose" onClick={() => { setEdit(c.coffee_id); setForm(c); }}>แก้ไข</button><button className="btn btn-ghost" onClick={() => confirm('ลบข้อมูลนี้?') && api(`/coffee-types/${c.coffee_id}`, { method: 'DELETE' }).then(load)}>ลบ</button></div>}</td></tr>)}</tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
