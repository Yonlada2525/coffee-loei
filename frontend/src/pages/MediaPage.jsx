//หน้าเพิ่มรูปภาพสวนกาแฟ

import { Download, Eye, FileSpreadsheet, MapPin, Printer, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { api, fileUrl } from '../utils/api';
import { exportCsv, exportExcel, printOfficialReport } from '../utils/exporters';
import RestoreCountdown from '../components/RestoreCountdown';

function FarmDetailModal({ farm, onClose }) {
  if (!farm) return null;
  const images = farm.media?.length ? farm.media : (farm.file_path ? [{ file_path: farm.file_path }] : []);
  const mapsUrl = farm.latitude && farm.longitude
    ? `https://www.google.com/maps?q=${farm.latitude},${farm.longitude}`
    : '';

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/35 p-4">
      <section className="max-h-[90vh] w-full max-w-5xl overflow-auto rounded-[2rem] bg-white p-5 shadow-2xl">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[rgba(122,79,56,.14)] pb-4">
          <div>
            <p className="chip">ข้อมูลสวนกาแฟ</p>
            <h2 className="mt-3 text-3xl font-black text-coffee">{farm.farm_name || '-'}</h2>
            <p className="mt-1 text-muted">
              {farm.village || '-'} ต.{farm.sub_district || '-'} อ.{farm.district || '-'} จ.เลย {farm.postal_code || ''}
            </p>
          </div>
          <button className="btn btn-ghost !w-auto" onClick={onClose}><X size={18} />ปิด</button>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
          <div>
            <h3 className="mb-3 text-lg font-black text-coffee">รูปภาพสวนที่อัปโหลด</h3>
            {images.length ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {images.map((item, index) => (
                  <img
                    key={`${item.file_path}-${index}`}
                    className="h-56 w-full rounded-3xl object-cover"
                    src={fileUrl(item.file_path)}
                    alt={`รูปสวนกาแฟ ${farm.farm_name || ''}`}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-[rgba(122,79,56,.2)] p-8 text-center text-muted">
                ยังไม่มีรูปภาพของสวนนี้
              </div>
            )}
          </div>

          <div className="grid gap-3">
            <div className="soft p-4">
              <b className="text-coffee">เจ้าของสวน</b>
              <p className="mt-1 text-muted">{farm.fullname || farm.owner_name || '-'}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="soft p-4"><span className="text-xs text-muted">พันธุ์กาแฟ</span><b className="block text-coffee">{farm.coffee_name || '-'}</b></div>
              <div className="soft p-4"><span className="text-xs text-muted">ประเภทสวน</span><b className="block text-coffee">{farm.farm_type_name || '-'}</b></div>
              <div className="soft p-4"><span className="text-xs text-muted">ประเภทดิน</span><b className="block text-coffee">{farm.soil_type_name || '-'}</b></div>
              <div className="soft p-4"><span className="text-xs text-muted">พื้นที่</span><b className="block text-coffee">{farm.area_size || 0} ไร่</b></div>
              <div className="soft p-4"><span className="text-xs text-muted">ระบบน้ำ</span><b className="block text-coffee">{Number(farm.water_system) ? 'มี' : 'ไม่มี'}</b></div>
              <div className="soft p-4"><span className="text-xs text-muted">ความสูง</span><b className="block text-coffee">{farm.altitude || '-'} ม.</b></div>
            </div>
            <div className="soft p-4">
              <b className="text-coffee">พิกัดสวน</b>
              <p className="mt-1 text-muted">Latitude: {farm.latitude || '-'} | Longitude: {farm.longitude || '-'}</p>
              {mapsUrl && <a className="btn btn-primary mt-3 !w-auto" href={mapsUrl} target="_blank" rel="noreferrer"><MapPin size={18} />เปิดตำแหน่ง</a>}
            </div>
            <div className="soft p-4">
              <b className="text-coffee">รายละเอียด</b>
              <p className="mt-1 text-muted">{farm.description || 'ไม่มีรายละเอียดเพิ่มเติม'}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function MediaPage({ admin = false }) {
  const [farms, setFarms] = useState([]);
  const [rows, setRows] = useState([]);
  const [deleted, setDeleted] = useState(false);
  const [selectedFarm, setSelectedFarm] = useState(null);
  const headers = ['สวนกาแฟ', 'ที่อยู่ไฟล์', 'วันที่อัปโหลด'];
  const exportRows = useMemo(() => rows.map((m) => [m.farm_name || 'สวนกาแฟ', m.file_path, m.upload_date || '']), [rows]);

  const loadRows = async () => {
    try {
      const data = await api(`/media${deleted ? '?deleted=1' : ''}`);
      setRows(data);
    } catch (error) {
      console.error(error);
    }
  };

  const loadFarms = async () => {
    try {
      const data = await api(admin ? '/farms' : '/farms/mine');
      setFarms(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => { loadFarms(); }, [admin]);
  useEffect(() => { loadRows(); }, [deleted]);

  const upload = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    await api('/media', { method: 'POST', body: formData });
    event.currentTarget.reset();
    await loadRows();
  };

  const viewFarm = async (farmId) => {
    try {
      const data = await api(`/farms/${farmId}`);
      setSelectedFarm(data);
    } catch (error) {
      const local = rows.find((item) => Number(item.farm_id) === Number(farmId));
      if (local) {
        setSelectedFarm({
          ...local,
          farm_name: local.farm_name || 'ไม่พบข้อมูลสวนกาแฟเดิม',
          description: 'ไม่สามารถโหลดรายละเอียดสวนจากฐานข้อมูลได้ แต่ยังสามารถดูรูปที่อัปโหลดไว้ได้',
          media: rows.filter((item) => Number(item.farm_id) === Number(farmId))
        });
        return;
      }
      alert(error.message || 'ไม่สามารถโหลดข้อมูลสวนได้');
    }
  };

  return (
    <main className="shell py-8">
      <section className="hero p-7">
        <span className="chip">Farm Media</span>
        <h1 className="mt-4 text-4xl font-black text-coffee">รูปภาพสวนกาแฟ</h1>
        <p className="mt-2 max-w-3xl text-muted">อัปโหลดรูปภาพให้เชื่อมกับสวนกาแฟ และกดดูข้อมูลสวนเพื่อแสดงรูปที่อัปโหลด รายละเอียดสวน และพิกัดตำแหน่ง</p>
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-3">
        <form onSubmit={upload} className="card grid gap-3 p-5">
          <h2 className="text-xl font-black text-coffee">อัปโหลดรูป</h2>
          <select name="farm_id" className="select" required>
            <option value="">เลือกสวน</option>
            {farms.map((farm) => <option key={farm.farm_id} value={farm.farm_id}>{farm.farm_name}</option>)}
          </select>
          <input name="file" type="file" accept="image/*" className="input" required />
          <button className="btn btn-primary">อัปโหลด</button>
        </form>

        <div className="lg:col-span-2">
          <div className="mb-3 flex flex-wrap gap-3">
            <button className={!deleted ? 'btn btn-primary' : 'btn btn-ghost'} onClick={() => setDeleted(false)}>ข้อมูลปกติ</button>
            <button className={deleted ? 'btn btn-primary' : 'btn btn-ghost'} onClick={() => setDeleted(true)}>ข้อมูลที่ลบภายใน 30 วัน</button>
            <button className="btn btn-mint" onClick={() => exportExcel('รายงานรูปภาพสวนกาแฟ', headers, exportRows, 'รายงานรูปภาพสวนกาแฟ')}><FileSpreadsheet size={18} />Excel</button>
            <button className="btn btn-rose" onClick={() => exportCsv('รายงานรูปภาพสวนกาแฟ', headers, exportRows)}><Download size={18} />CSV</button>
            <button className="btn btn-primary" onClick={() => printOfficialReport('รายงานรูปภาพสวนกาแฟ', headers, exportRows)}><Printer size={18} />รายงาน/PDF</button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {rows.map((media) => (
              <div className="card p-3" key={media.media_id}>
                <img className="h-40 w-full rounded-3xl object-cover" src={fileUrl(media.file_path)} alt="รูปสวนกาแฟ" />
                <p className="mt-2 text-sm font-bold text-brown">{media.farm_name || 'สวนกาแฟ'}</p>
                <div className="mt-3 grid gap-2">
                  {deleted && <RestoreCountdown days={media.restore_days_left} />}
                  <button className="btn btn-primary" onClick={() => viewFarm(media.farm_id)}><Eye size={18} />ดูข้อมูลสวน</button>
                  {deleted ? (
                    <button className="btn btn-mint" onClick={() => api(`/media/${media.media_id}/restore`, { method: 'PATCH' }).then(loadRows)}>กู้คืน</button>
                  ) : (
                    <button className="btn btn-ghost" onClick={() => api(`/media/${media.media_id}`, { method: 'DELETE' }).then(loadRows)}>ลบ</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FarmDetailModal farm={selectedFarm} onClose={() => setSelectedFarm(null)} />
    </main>
  );
}
