
import { useEffect, useMemo, useState } from 'react';
import { api, fileUrl } from '../utils/api';
import FarmDetailModal from '../components/FarmDetailModal';
import { LOEI_LOCATIONS } from '../data/loeiLocations';

export default function FarmsPublic() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState('');
  const [district, setDistrict] = useState('');
  const [coffee, setCoffee] = useState('');
  const [selectedFarm, setSelectedFarm] = useState(null);

  useEffect(() => {
    let alive = true;
    api('/farms').then((data) => { if (alive) setRows(data); }).catch(console.error);
    return () => { alive = false; };
  }, []);

  const coffeeOptions = useMemo(() => [...new Set(rows.map((f) => f.coffee_name).filter(Boolean))], [rows]);
  const data = useMemo(() => {
    const keyword = q.trim().toLowerCase();
    return rows.filter((f) => {
      const text = [f.farm_name, f.fullname, f.coffee_name, f.farm_type_name, f.soil_type_name, f.district, f.sub_district, f.village, f.postal_code].join(' ').toLowerCase();
      return (!district || f.district === district) && (!coffee || f.coffee_name === coffee) && (!keyword || text.includes(keyword));
    });
  }, [rows, q, district, coffee]);

  async function openFarmDetail(farmId) {
    try {
      setSelectedFarm(await api(`/farms/${farmId}`));
    } catch (error) {
      alert(error.message || 'ไม่สามารถโหลดข้อมูลสวนได้');
    }
  }

  return (
    <main className="shell py-8">
      <section className="hero p-7">
        <span className="chip">ค้นหาข้อมูลสวนกาแฟ</span>
        <h1 className="mt-4 text-4xl font-black text-coffee">ข้อมูลสวนกาแฟจังหวัดเลย</h1>
        <p className="mt-2 text-muted">ค้นหาตามชื่อพันธุ์กาแฟ ชื่อสวน เจ้าของสวน สถานที่ อำเภอ ตำบล หมู่บ้าน หรือรหัสไปรษณีย์</p>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <input className="input md:col-span-2" placeholder="ค้นหาชื่อสวน/พันธุ์กาแฟ/สถานที่" value={q} onChange={(e) => setQ(e.target.value)} />
          <select className="select" value={district} onChange={(e) => setDistrict(e.target.value)}>
            <option value="">ทุกอำเภอ</option>
            {Object.keys(LOEI_LOCATIONS).map((d) => <option key={d}>{d}</option>)}
          </select>
          <select className="select" value={coffee} onChange={(e) => setCoffee(e.target.value)}>
            <option value="">ทุกพันธุ์กาแฟ</option>
            {coffeeOptions.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
      </section>

      <div className="mt-5 text-sm font-bold text-brown">พบข้อมูล {data.length.toLocaleString('th-TH')} รายการ</div>

      <section className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {data.map((f, i) => (
          <article className="card overflow-hidden p-4 transition hover:-translate-y-1" key={f.farm_id}>
            <img className="h-52 w-full rounded-3xl bg-rose2 object-cover" src={fileUrl(f.file_path || `frontend/assets/images/farm-${i % 5 + 1}.svg`)} alt={f.farm_name} />
            <h3 className="mt-4 text-xl font-black text-coffee">{f.farm_name}</h3>
            <p className="mt-1 leading-6 text-muted">{f.village || '-'} ต.{f.sub_district || '-'} อ.{f.district || '-'} จ.เลย {f.postal_code || ''}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="chip">{f.coffee_name || 'ไม่ระบุพันธุ์'}</span>
              <span className="chip">{f.area_size || 0} ไร่</span>
              <span className="chip">{f.fullname || 'เจ้าของสวน'}</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="soft p-3"><b className="text-coffee">ประเภทสวน</b><p className="text-muted">{f.farm_type_name || '-'}</p></div>
              <div className="soft p-3"><b className="text-coffee">ประเภทดิน</b><p className="text-muted">{f.soil_type_name || '-'}</p></div>
            </div>
            <button className="btn btn-primary mt-4" type="button" onClick={() => openFarmDetail(f.farm_id)}>ดูข้อมูลสวน</button>
          </article>
        ))}
      </section>
      <FarmDetailModal farm={selectedFarm} onClose={() => setSelectedFarm(null)} />
    </main>
  );
}
