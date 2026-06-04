import { useEffect, useState } from "react";
import { API, asset } from "../services/api";
export default function MediaManage() {
  const [farms, setFarms] = useState([]),
    [rows, setRows] = useState([]);
  const load = () => {
    API.get("/farms/mine").then(setFarms);
    API.get("/media").then(setRows);
  };
  useEffect(load, []);
  async function submit(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await API.post("/media", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    e.currentTarget.reset();
    load();
  }
  return (
    <div className="shell">
      <section className="hero p-6">
        <h1 className="text-4xl font-black text-coffee">รูปภาพสวน</h1>
        <p className="text-[#786a62] mt-2">อัปโหลดรูปประกอบข้อมูลสวนกาแฟ</p>
      </section>
      <form
        onSubmit={submit}
        className="card p-5 mt-8 grid md:grid-cols-3 gap-4"
      >
        <label>
          <span className="label">เลือกสวน</span>
          <select name="farm_id" className="select">
            {farms.map((f) => (
              <option value={f.farm_id} key={f.farm_id}>
                {f.farm_name}
              </option>
            ))}
          </select>
        </label>
        <label className="md:col-span-2">
          <span className="label">ไฟล์รูป</span>
          <input name="file" type="file" accept="image/*" className="input" />
        </label>
        <button className="btn btn-primary md:col-span-3">อัปโหลด</button>
      </form>
      <section className="grid md:grid-cols-3 gap-5 mt-8">
        {rows.map((m) => (
          <div className="card p-3" key={m.media_id}>
            <img className="image-card" src={asset(m.file_path)} />
            <p className="font-bold mt-2 text-coffee">{m.farm_name}</p>
            <button
              className="btn btn-ghost mt-3"
              onClick={async () => {
                await API.delete("/media/" + m.media_id);
                load();
              }}
            >
              ลบ
            </button>
          </div>
        ))}
      </section>
    </div>
  );
}
