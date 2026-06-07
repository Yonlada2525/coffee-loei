import SmartLocationFields from "../SmartLocationFields";
import { useRef, useEffect } from "react";

export default function FarmForm({
  owner,
  look,
  form,
  setForm,
  save,
  edit,
  setEdit,
  blank,
  preview,
  setPreview,
}) {
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!edit && !form.image && fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [edit, form.image]);

  return (
    <form onSubmit={save} className="card grid gap-4 p-5 xl:col-span-1">
      <h2 className="text-xl font-black text-coffee">
        {edit ? "แก้ไขข้อมูลสวน" : "เพิ่มข้อมูลสวนกาแฟ"}
      </h2>

      {/* เจ้าของสวน */}
      {!owner && (
        <div>
          <label className="label">เจ้าของสวน</label>
          <select
            className="select"
            value={form.owner_id || ""}
            onChange={(e) => setForm({ ...form, owner_id: e.target.value })}
            required
          >
            <option value="">เลือกเจ้าของ</option>
            {look.owners.map((o) => (
              <option value={o.owner_id} key={o.owner_id}>{o.fullname}</option>
            ))}
          </select>
        </div>
      )}

      {/* ชื่อสวน */}
      <div>
        <label className="label">ชื่อสวน</label>
        <input
          className="input"
          value={form.farm_name || ""}
          onChange={(e) => setForm({ ...form, farm_name: e.target.value })}
          required
        />
      </div>

      {/* ประเภทสวน / พันธุ์กาแฟ / ประเภทดิน */}
      <div className="grid gap-3 md:grid-cols-3">
        <select
          className="select"
          value={form.farm_type_id || ""}
          onChange={(e) => setForm({ ...form, farm_type_id: e.target.value })}
        >
          <option value="">ประเภทสวน</option>
          {look.farmTypes.map((x) => (
            <option value={x.farm_type_id} key={x.farm_type_id}>{x.farm_type_name}</option>
          ))}
        </select>

        <select
          className="select"
          value={form.coffee_id || ""}
          onChange={(e) => setForm({ ...form, coffee_id: e.target.value })}
        >
          <option value="">พันธุ์กาแฟ</option>
          {look.coffeeTypes.map((x) => (
            <option value={x.coffee_id} key={x.coffee_id}>{x.coffee_name}</option>
          ))}
        </select>

        <select
          className="select"
          value={form.soil_type_id || ""}
          onChange={(e) => setForm({ ...form, soil_type_id: e.target.value })}
        >
          <option value="">ประเภทดิน</option>
          {look.soilTypes.map((x) => (
            <option value={x.soil_type_id} key={x.soil_type_id}>{x.soil_type_name}</option>
          ))}
        </select>
      </div>

      {/* บ้านเลขที่ */}
      <input
        className="input"
        placeholder="บ้านเลขที่"
        value={form.house_no || ""}
        onChange={(e) => setForm({ ...form, house_no: e.target.value })}
      />

      {/* location */}
      <SmartLocationFields form={form} setForm={setForm} />

      {/* พื้นที่ / ความสูง / ปีที่ปลูก */}
      <div className="grid gap-3 md:grid-cols-3">
        <input
          className="input"
          type="number"
          placeholder="พื้นที่ไร่"
          value={form.area_size || ""}
          onChange={(e) => setForm({ ...form, area_size: e.target.value })}
        />
        <input
          className="input"
          type="number"
          placeholder="ความสูง ม."
          value={form.altitude || ""}
          onChange={(e) => setForm({ ...form, altitude: e.target.value })}
        />
        <input
          className="input"
          type="date"
          value={form.planting_year || ""}
          onChange={(e) => setForm({ ...form, planting_year: e.target.value })}
        />
      </div>

      {/* lat / long */}
      <div className="grid gap-3 md:grid-cols-2">
        <input
          className="input"
          placeholder="Latitude"
          value={form.latitude || ""}
          onChange={(e) => setForm({ ...form, latitude: e.target.value })}
        />
        <input
          className="input"
          placeholder="Longitude"
          value={form.longitude || ""}
          onChange={(e) => setForm({ ...form, longitude: e.target.value })}
        />
      </div>

      {/* ระบบน้ำ */}
      <div>
        <label className="label">ระบบน้ำ</label>
        <div className="grid grid-cols-2 rounded-full border border-[rgba(122,79,56,.14)] bg-white p-2">
          <button
            type="button"
            className={`btn ${Number(form.water_system) ? "btn-rose" : "btn-ghost"}`}
            onClick={() => setForm({ ...form, water_system: 1 })}
          >
            มี
          </button>
          <button
            type="button"
            className={`btn ${!Number(form.water_system) ? "btn-rose" : "btn-ghost"}`}
            onClick={() => setForm({ ...form, water_system: 0 })}
          >
            ไม่มี
          </button>
        </div>
      </div>

      {/* รายละเอียด */}
      <textarea
        className="textarea"
        placeholder="รายละเอียดสวน"
        value={form.description || ""}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />

      {/* รูปภาพ */}
      <div>
        <label className="label">รูปภาพสวนกาแฟ</label>
        {preview && (
          <div className="relative mb-3">
            <img
              src={preview}
              alt="preview"
              className="h-48 w-full rounded-2xl border object-cover"
            />
            <button
              type="button"
              className="absolute right-2 top-2 rounded-full bg-white/80 px-2 py-1 text-xs text-rose-500 shadow"
              onClick={() => {
                setPreview(null);
                setForm({ ...form, image: null });
              }}
            >
              ✕ ลบรูป
            </button>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="input"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setForm({ ...form, image: file });
            setPreview(URL.createObjectURL(file));
          }}
        />
      </div>

      {/* ปุ่ม */}
      <div className="grid gap-2 sm:grid-cols-2">
        <button className="btn btn-primary">
          {edit ? "บันทึกแก้ไข" : "เพิ่มสวน"}
        </button>
        {edit && (
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              setEdit(null);
              setForm(blank);
              setPreview(null);
            }}
          >
            ยกเลิก
          </button>
        )}
      </div>
    </form>
  );
}