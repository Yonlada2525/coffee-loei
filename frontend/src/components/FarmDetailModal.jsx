import { MapPin, X } from 'lucide-react';
import { fileUrl } from '../utils/api';

export default function FarmDetailModal({ farm, onClose }) {
  if (!farm) return null;

  const images = farm.media?.length ? farm.media : (farm.file_path ? [{ file_path: farm.file_path }] : []);
  const mapsUrl = farm.latitude && farm.longitude
    ? `https://www.google.com/maps?q=${farm.latitude},${farm.longitude}`
    : '';

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 backdrop-blur-sm">
      <section className="max-h-[92vh] w-full max-w-5xl overflow-auto rounded-[2rem] bg-white p-5 shadow-2xl">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[rgba(122,79,56,.14)] pb-4">
          <div>
            <p className="chip">รายละเอียดสวนกาแฟ</p>
            <h2 className="mt-3 text-3xl font-black text-coffee">{farm.farm_name || '-'}</h2>
            <p className="mt-1 text-muted">
              {farm.village || '-'} ต.{farm.sub_district || '-'} อ.{farm.district || '-'} จ.เลย {farm.postal_code || ''}
            </p>
          </div>
          <button className="btn btn-ghost !w-auto" onClick={onClose} type="button"><X size={18} />ปิด</button>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
          <div>
            <h3 className="mb-3 text-lg font-black text-coffee">รูปภาพสวนที่อัปโหลด</h3>
            {images.length ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {images.map((item, index) => (
                  <img
                    key={`${item.file_path}-${index}`}
                    className="h-56 w-full rounded-3xl bg-rose2 object-cover"
                    src={fileUrl(item.file_path)}
                    alt={`รูปสวนกาแฟ ${farm.farm_name || ''}`}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-[rgba(122,79,56,.22)] bg-rose2/40 p-8 text-center text-muted">
                ยังไม่มีรูปภาพที่อัปโหลดสำหรับสวนนี้
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
              <p className="mt-1 text-muted">ละติจูด: {farm.latitude || '-'} | ลองจิจูด: {farm.longitude || '-'}</p>
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
