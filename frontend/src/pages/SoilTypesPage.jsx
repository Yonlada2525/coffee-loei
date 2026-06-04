
import { Download, FileSpreadsheet, Printer } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { api } from '../utils/api';
import { exportCsv, exportExcel, printOfficialReport } from '../utils/exporters';
import RestoreCountdown from '../components/RestoreCountdown';

const blank = { soil_type_name: '' };
const headers = ['ประเภทดิน'];
const rowValues = (item) => [item.soil_type_name];

export default function SoilTypesPage() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(blank);
  const [editId, setEditId] = useState(null);
  const [deleted, setDeleted] = useState(false);
  const exportRows = useMemo(() => rows.map(rowValues), [rows]);
  const load = () => api(`/soil-types${deleted ? '?deleted=1' : ''}`).then(setRows);

  useEffect(() => { load(); }, [deleted]);

  async function save(event) {
    event.preventDefault();
    await api(editId ? `/soil-types/${editId}` : '/soil-types', { method: editId ? 'PUT' : 'POST', body: form });
    setForm(blank);
    setEditId(null);
    load();
  }

  return (
    <main className="shell py-8">
      <section className="hero p-7">
        <span className="chip">ประเภทดิน</span>
        <h1 className="mt-4 text-4xl font-black text-coffee">จัดการประเภทดิน</h1>
      </section>
      <section className="mt-8 grid gap-5 lg:grid-cols-3">
        <form onSubmit={save} className="card grid gap-3 p-5">
          <h2 className="text-xl font-black text-coffee">{editId ? 'แก้ไข' : 'เพิ่ม'}ประเภทดิน</h2>
          <input className="input" placeholder="ชื่อประเภทดิน" value={form.soil_type_name} onChange={(e) => setForm({ soil_type_name: e.target.value })} required />
          <button className="btn btn-primary">{editId ? 'บันทึก' : 'เพิ่มข้อมูล'}</button>
        </form>
        <div className="lg:col-span-2">
          <div className="mb-3 flex flex-wrap gap-3">
            <button className={!deleted ? 'btn btn-primary' : 'btn btn-ghost'} onClick={() => setDeleted(false)}>ข้อมูลปกติ</button>
            <button className={deleted ? 'btn btn-primary' : 'btn btn-ghost'} onClick={() => setDeleted(true)}>ข้อมูลที่ลบ</button>
            <button className="btn btn-mint" onClick={() => exportExcel('รายงานประเภทดิน', headers, exportRows, 'รายงานข้อมูลประเภทดิน')}><FileSpreadsheet size={18} />Excel</button>
            <button className="btn btn-rose" onClick={() => exportCsv('รายงานประเภทดิน', headers, exportRows)}><Download size={18} />CSV</button>
            <button className="btn btn-primary" onClick={() => printOfficialReport('รายงานข้อมูลประเภทดิน', headers, exportRows)}><Printer size={18} />รายงาน/PDF</button>
          </div>
          <div className="table-wrap"><table><thead><tr><th>ประเภทดิน</th><th>จัดการ</th></tr></thead><tbody>{rows.map((item) => <tr key={item.soil_type_id}><td><b>{item.soil_type_name}</b></td><td>{deleted ? <div className="flex flex-wrap gap-2"><RestoreCountdown days={item.restore_days_left} /><button className="btn btn-mint" onClick={() => api(`/soil-types/${item.soil_type_id}/restore`, { method: 'PATCH' }).then(load)}>กู้คืน</button></div> : <div className="flex flex-wrap gap-2"><button className="btn btn-rose" onClick={() => { setEditId(item.soil_type_id); setForm(item); }}>แก้ไข</button><button className="btn btn-ghost" onClick={() => confirm('ลบข้อมูลนี้?') && api(`/soil-types/${item.soil_type_id}`, { method: 'DELETE' }).then(load)}>ลบ</button></div>}</td></tr>)}</tbody></table></div>
        </div>
      </section>
    </main>
  );
}
