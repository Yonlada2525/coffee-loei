
import { Download, FileSpreadsheet, Printer } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { api } from '../utils/api';
import { exportCsv, exportExcel, printOfficialReport } from '../utils/exporters';
import RestoreCountdown from '../components/RestoreCountdown';
import { dateOnly, number } from '../utils/format';

const blank = {
  farm_id: '',
  coffee_id: '',
  harvest_year: '2025-01-01',
  jan_quantity: 0,
  feb_quantity: 0,
  mar_quantity: 0
};

const headers = ['สวน', 'พันธุ์กาแฟ', 'ปีเก็บเกี่ยว', 'มกราคม(กก.)', 'กุมภาพันธ์(กก.)', 'มีนาคม(กก.)', 'รวม(กก.)'];
const rowValues = (item) => [
  item.farm_name,
  item.coffee_name,
  dateOnly(item.harvest_year),
  item.jan_quantity,
  item.feb_quantity,
  item.mar_quantity,
  item.quantity_kg
];

export default function ProductionsPage({ owner = false }) {
  const [rows, setRows] = useState([]);
  const [farms, setFarms] = useState([]);
  const [coffees, setCoffees] = useState([]);
  const [form, setForm] = useState(blank);
  const [editId, setEditId] = useState(null);
  const [deleted, setDeleted] = useState(false);
  const [loading, setLoading] = useState(false);

  const endpoint = owner ? '/productions/mine' : '/productions';

  async function loadRows() {
    setLoading(true);
    try {
      const data = await api(`${endpoint}${deleted ? '?deleted=1' : ''}`);
      setRows(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let alive = true;
    async function loadLookups() {
      const [farmRows, coffeeRows] = await Promise.all([
        api(owner ? '/farms/mine' : '/farms'),
        api('/coffee-types')
      ]);
      if (alive) {
        setFarms(farmRows);
        setCoffees(coffeeRows);
      }
    }
    loadLookups().catch(console.error);
    return () => { alive = false; };
  }, [owner]);

  useEffect(() => { loadRows().catch(console.error); }, [deleted, owner]);

  const total = (item) => Number(item.jan_quantity || 0) + Number(item.feb_quantity || 0) + Number(item.mar_quantity || 0);
  const exportRows = useMemo(() => rows.map(rowValues), [rows]);
  const baseName = owner ? 'รายงานผลผลิตสวนของฉัน' : 'รายงานผลผลิตทุกสวน';

  async function save(event) {
    event.preventDefault();
    await api(editId ? `/productions/${editId}` : '/productions', {
      method: editId ? 'PUT' : 'POST',
      body: { ...form, quantity_kg: total(form) }
    });
    setForm(blank);
    setEditId(null);
    loadRows();
  }

  function startEdit(item) {
    setEditId(item.production_id);
    setForm({
      farm_id: item.farm_id || '',
      coffee_id: item.coffee_id || '',
      harvest_year: dateOnly(item.harvest_year),
      jan_quantity: item.jan_quantity || 0,
      feb_quantity: item.feb_quantity || 0,
      mar_quantity: item.mar_quantity || 0
    });
  }

  return (
    <main className="shell py-8">
      <section className="hero p-7">
        <span className="chip">ผลผลิตกาแฟ</span>
        <h1 className="mt-4 text-4xl font-black text-coffee">จัดการผลผลิตและรายงาน</h1>
        <p className="mt-2 text-muted">{owner ? 'จัดการผลผลิตเฉพาะสวนของตนเอง และดูสรุปข้อมูลในรูปแบบตาราง' : 'จัดการและตรวจสอบข้อมูลผลผลิตของทุกสวนในระบบ'}</p>
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-3">
        <form onSubmit={save} className="card grid gap-3 p-5">
          <h2 className="text-xl font-black text-coffee">{editId ? 'แก้ไข' : 'เพิ่ม'}ผลผลิต</h2>

          <div>
            <label className="label">สวนกาแฟ</label>
            <select className="select" value={form.farm_id} onChange={(e) => setForm({ ...form, farm_id: e.target.value })} required>
              <option value="">เลือกสวน</option>
              {farms.map((farm) => <option key={farm.farm_id} value={farm.farm_id}>{farm.farm_name}</option>)}
            </select>
          </div>

          <div>
            <label className="label">พันธุ์กาแฟ</label>
            <select className="select" value={form.coffee_id} onChange={(e) => setForm({ ...form, coffee_id: e.target.value })} required>
              <option value="">เลือกพันธุ์กาแฟ</option>
              {coffees.map((coffee) => <option key={coffee.coffee_id} value={coffee.coffee_id}>{coffee.coffee_name}</option>)}
            </select>
          </div>

          <div>
            <label className="label">ปีเก็บเกี่ยว</label>
            <input className="input" type="date" value={form.harvest_year} onChange={(e) => setForm({ ...form, harvest_year: e.target.value })} />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div><label className="label">ม.ค.</label><input className="input" type="number" value={form.jan_quantity} onChange={(e) => setForm({ ...form, jan_quantity: e.target.value })} /></div>
            <div><label className="label">ก.พ.</label><input className="input" type="number" value={form.feb_quantity} onChange={(e) => setForm({ ...form, feb_quantity: e.target.value })} /></div>
            <div><label className="label">มี.ค.</label><input className="input" type="number" value={form.mar_quantity} onChange={(e) => setForm({ ...form, mar_quantity: e.target.value })} /></div>
          </div>

          <div className="soft p-4"><b className="text-coffee">รวมอัตโนมัติ: {number(total(form))} กก.</b></div>
          <button className="btn btn-primary">{editId ? 'บันทึกการแก้ไข' : 'เพิ่มข้อมูลผลผลิต'}</button>
          {editId && <button type="button" className="btn btn-ghost" onClick={() => { setEditId(null); setForm(blank); }}>ยกเลิก</button>}
        </form>

        <div className="lg:col-span-2">
          <div className="mb-3 flex flex-wrap gap-3">
            <button className={!deleted ? 'btn btn-primary' : 'btn btn-ghost'} onClick={() => setDeleted(false)}>ข้อมูลปกติ</button>
            <button className={deleted ? 'btn btn-primary' : 'btn btn-ghost'} onClick={() => setDeleted(true)}>ข้อมูลที่ลบ</button>
            <button className="btn btn-mint" onClick={() => exportExcel(baseName, headers, exportRows, baseName)}><FileSpreadsheet size={18} />Excel</button>
            <button className="btn btn-rose" onClick={() => exportCsv(baseName, headers, exportRows)}><Download size={18} />CSV</button>
            <button className="btn btn-primary" onClick={() => printOfficialReport(baseName, headers, exportRows)}><Printer size={18} />รายงาน/PDF</button>
          </div>

          <div className="card p-4">
            <h2 className="mb-4 text-2xl font-black text-coffee">ตารางข้อมูลผลผลิต</h2>
            {loading ? <p className="p-4 text-brown">กำลังโหลด...</p> : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>สวน</th><th>ปี</th><th>ม.ค.</th><th>ก.พ.</th><th>มี.ค.</th><th>รวม</th><th>จัดการ</th></tr></thead>
                  <tbody>
                    {rows.map((item) => (
                      <tr key={item.production_id}>
                        <td><b>{item.farm_name}</b><br /><span className="chip">{item.coffee_name || '-'}</span></td>
                        <td>{dateOnly(item.harvest_year)}</td>
                        <td>{number(item.jan_quantity)}</td>
                        <td>{number(item.feb_quantity)}</td>
                        <td>{number(item.mar_quantity)}</td>
                        <td><b>{number(item.quantity_kg)}</b></td>
                        <td>
                          {deleted ? (
                            <div className="flex flex-wrap gap-2"><RestoreCountdown days={item.restore_days_left} /><button className="btn btn-mint" onClick={() => api(`/productions/${item.production_id}/restore`, { method: 'PATCH' }).then(loadRows)}>กู้คืน</button></div>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              <button className="btn btn-rose" onClick={() => startEdit(item)}>แก้ไข</button>
                              <button className="btn btn-ghost" onClick={() => confirm('ลบข้อมูลผลผลิตนี้?') && api(`/productions/${item.production_id}`, { method: 'DELETE' }).then(loadRows)}>ลบ</button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
