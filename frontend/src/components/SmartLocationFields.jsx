import { LOEI_LOCATIONS } from '../data/loeiLocations';

function getAllVillageOptions() {
  const options = [];
  Object.entries(LOEI_LOCATIONS).forEach(([district, subDistricts]) => {
    subDistricts.forEach((item) => {
      (item.villages || []).forEach((village) => {
        options.push({
          key: `${district}|${item.subDistrict}|${village}`,
          district,
          subDistrict: item.subDistrict,
          village,
          postalCode: item.postalCode || '',
        });
      });
    });
  });
  return options;
}

const ALL_VILLAGES = getAllVillageOptions();

export default function SmartLocationFields({ form, setForm }) {
  const districts = Object.keys(LOEI_LOCATIONS);
  const subs = form.district ? LOEI_LOCATIONS[form.district] || [] : [];
  const subObj = subs.find((x) => x.subDistrict === form.sub_district);
  const villages = subObj?.villages || [];

  const selectedVillageKey = form.district && form.sub_district && form.village
    ? `${form.district}|${form.sub_district}|${form.village}`
    : '';

  function changeVillageFromAll(value) {
    if (!value) {
      setForm({ ...form, district: '', sub_district: '', village: '', postal_code: '' });
      return;
    }
    const found = ALL_VILLAGES.find((item) => item.key === value);
    if (!found) return;
    setForm({
      ...form,
      district: found.district,
      sub_district: found.subDistrict,
      village: found.village,
      postal_code: found.postalCode,
    });
  }

  function changeDistrict(value) {
    setForm({
      ...form,
      district: value,
      sub_district: '',
      village: '',
      postal_code: '',
    });
  }

  function changeSubDistrict(value) {
    const found = subs.find((x) => x.subDistrict === value);
    setForm({
      ...form,
      sub_district: value,
      village: '',
      postal_code: found?.postalCode || '',
    });
  }

  function changeVillage(value) {
    setForm({
      ...form,
      village: value,
      postal_code: subObj?.postalCode || form.postal_code || '',
    });
  }

  return (
    <div className="grid gap-4">
      {/* <div>
        <label className="label">เลือกหมู่บ้าน / ชุมชน</label>
        <select
          className="select"
          value={selectedVillageKey}
          onChange={(event) => changeVillageFromAll(event.target.value)}
        >
          <option value="">เลือกหมู่บ้านเพื่อกรอกอำเภอ ตำบล และรหัสไปรษณีย์อัตโนมัติ</option>
          {ALL_VILLAGES.map((item) => (
            <option key={item.key} value={item.key}>
              {item.village} — ต.{item.subDistrict} อ.{item.district} {item.postalCode}
            </option>
          ))}
        </select>
        <p className="mt-2 text-xs text-muted">เลือกหมู่บ้านก่อน ระบบจะเติมอำเภอ ตำบล และรหัสไปรษณีย์ให้ทันที</p>
      </div> */}

      <div className="grid gap-4 md:grid-cols-4">
        <div>
          <label className="label">อำเภอ</label>
          <select className="select" value={form.district || ''} onChange={(event) => changeDistrict(event.target.value)}>
            <option value="">เลือกอำเภอ</option>
            {districts.map((district) => <option key={district}>{district}</option>)}
          </select>
        </div>

        <div>
          <label className="label">ตำบล</label>
          <select className="select" value={form.sub_district || ''} onChange={(event) => changeSubDistrict(event.target.value)} disabled={!form.district}>
            <option value="">เลือกตำบล</option>
            {subs.map((item) => <option key={item.subDistrict}>{item.subDistrict}</option>)}
          </select>
        </div>

        <div>
          <label className="label">หมู่บ้าน</label>
          <select className="select" value={form.village || ''} onChange={(event) => changeVillage(event.target.value)} disabled={!form.sub_district}>
            <option value="">เลือกหมู่บ้าน</option>
            {villages.map((village) => <option key={village}>{village}</option>)}
          </select>
        </div>

        <div>
          <label className="label">รหัสไปรษณีย์</label>
          <input className="input bg-rose2" value={form.postal_code || ''} readOnly placeholder="อัตโนมัติ" />
        </div>
      </div>
    </div>
  );
}
