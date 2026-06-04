import { Download, FileSpreadsheet, Printer } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import SmartLocationFields from "../components/SmartLocationFields";
import { api, fileUrl } from "../utils/api";
import FarmDetailModal from "../components/FarmDetailModal";
import RestoreCountdown from "../components/RestoreCountdown";

const blank = {
  owner_id: "",
  farm_type_id: "",
  coffee_id: "",
  soil_type_id: "",
  farm_name: "",
  house_no: "",
  village: "",
  sub_district: "",
  district: "",
  postal_code: "",
  area_size: "",
  latitude: "",
  longitude: "",
  water_system: 1,
  description: "",
  altitude: "",
  planting_year: "",
};

const headers = [
  "ชื่อสวน",
  "เจ้าของ",
  "พันธุ์กาแฟ",
  "ประเภทสวน",
  "ประเภทดิน",
  "ที่ตั้ง",
  "พื้นที่(ไร่)",
  "ระบบน้ำ",
  "ความสูง(ม.)",
  "ละติจูด",
  "ลองจิจูด",
];
const rowValues = (f) => [
  f.farm_name || "-",
  f.fullname || "-",
  f.coffee_name || "-",
  f.farm_type_name || "-",
  f.soil_type_name || "-",
  `${f.house_no || ""} ${f.village || ""} ต.${f.sub_district || "-"} อ.${f.district || "-"} จ.เลย ${f.postal_code || ""}`,
  f.area_size || 0,
  Number(f.water_system) ? "มี" : "ไม่มี",
  f.altitude || "-",
  f.latitude || "-",
  f.longitude || "-",
];

function downloadFile(filename, content, type) {
  const blob = new Blob(["\ufeff" + content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function FarmsManager({ owner = false }) {
  const [rows, setRows] = useState([]);
  const [look, setLook] = useState({
    owners: [],
    farmTypes: [],
    coffeeTypes: [],
    soilTypes: [],
  });
  const [form, setForm] = useState(blank);
  const [edit, setEdit] = useState(null);
  const [deleted, setDeleted] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [selectedFarm, setSelectedFarm] = useState(null);

  const title = owner
    ? "จัดการสวนกาแฟของตนเอง"
    : "จัดการข้อมูลสวนกาแฟและตำแหน่งบนแผนที่";
  const endpoint = owner ? "/farms/mine" : "/farms";

  async function load() {
    const data = await api(`${endpoint}${deleted ? "?deleted=1" : ""}`);
    setRows(data);
  }

  useEffect(() => {
    let alive = true;
    async function loadLookups() {
      const [farmTypes, coffeeTypes, soilTypes, owners] = await Promise.all([
        api("/farm-types"),
        api("/coffee-types"),
        api("/soil-types"),
        owner ? Promise.resolve([]) : api("/owners"),
      ]);
      if (alive) setLook({ farmTypes, coffeeTypes, soilTypes, owners });
    }
    loadLookups().catch(console.error);
    return () => {
      alive = false;
    };
  }, [owner]);

  useEffect(() => {
    load().catch(console.error);
  }, [deleted, owner]);

  const filtered = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((f) =>
      [
        f.farm_name,
        f.fullname,
        f.district,
        f.sub_district,
        f.village,
        f.coffee_name,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [rows, keyword]);

  async function save(e) {
    e.preventDefault();
    await api(edit ? `/farms/${edit}` : "/farms", {
      method: edit ? "PUT" : "POST",
      body: form,
    });
    setForm(blank);
    setEdit(null);
    await load();
  }

  async function openFarmDetail(farmId) {
    try {
      setSelectedFarm(await api(`/farms/${farmId}`));
    } catch (error) {
      alert(error.message || "ไม่สามารถโหลดข้อมูลสวนได้");
    }
  }

  function start(f) {
    setEdit(f.farm_id);
    setForm({
      ...blank,
      ...f,
      planting_year: (f.planting_year || "").slice(0, 10),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function exportCsv() {
    const lines = [headers, ...filtered.map(rowValues)].map((r) =>
      r.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(","),
    );
    downloadFile(
      `รายงานข้อมูลสวนกาแฟ_${owner ? "เจ้าของสวน" : "ทั้งหมด"}.csv`,
      lines.join("\n"),
      "text/csv;charset=utf-8",
    );
  }

  function exportExcel() {
    const table = `<table><thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${filtered
      .map(
        (f) =>
          `<tr>${rowValues(f)
            .map((v) => `<td>${v}</td>`)
            .join("")}</tr>`,
      )
      .join("")}</tbody></table>`;
    downloadFile(
      `รายงานข้อมูลสวนกาแฟ_${owner ? "เจ้าของสวน" : "ทั้งหมด"}.xls`,
      table,
      "application/vnd.ms-excel;charset=utf-8",
    );
  }

  function printOfficial() {
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>รายงานข้อมูลสวนกาแฟ</title><style>body{font-family:Arial,'Tahoma',sans-serif;padding:30px;color:#211}h1{color:#4b2f24;margin-bottom:4px}.meta{color:#666;margin-bottom:20px}table{width:100%;border-collapse:collapse;font-size:12px}th,td{border:1px solid #cdb8ae;padding:8px;text-align:left;vertical-align:top}th{background:#fff1f6;color:#4b2f24}.sign{margin-top:50px;text-align:right}</style></head><body><h1>รายงานข้อมูลสวนกาแฟจังหวัดเลย</h1><div class="meta">ระบบ Coffee Loei DB | วันที่ออกรายงาน ${new Date().toLocaleDateString("th-TH")} | จำนวน ${filtered.length} รายการ</div><table><thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${filtered
      .map(
        (f) =>
          `<tr>${rowValues(f)
            .map((v) => `<td>${v}</td>`)
            .join("")}</tr>`,
      )
      .join(
        "",
      )}</tbody></table><div class="sign">ลงชื่อ........................................ ผู้จัดทำรายงาน</div><script>window.print()</script></body></html>`;
    const w = window.open("", "_blank");
    w.document.write(html);
    w.document.close();
  }

  return (
    <main className="shell py-8">
      <section className="hero p-7">
        <span className="chip">Farm Management</span>
        <h1 className="mt-4 text-3xl font-black text-coffee md:text-5xl">
          {title}
        </h1>
        <p className="mt-2 max-w-3xl text-muted">
          เพิ่ม แก้ไข ลบ ดูรายละเอียดสวน ตำแหน่งบนแผนที่
          และส่งออกข้อมูลสวนเป็นไฟล์รายงานทางการ
        </p>
      </section>

      <section className="mt-8 grid gap-5 xl:grid-cols-3">
        <form onSubmit={save} className="card grid gap-4 p-5 xl:col-span-1">
          <h2 className="text-xl font-black text-coffee">
            {edit ? "แก้ไขข้อมูลสวน" : "เพิ่มข้อมูลสวน"}
          </h2>
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
                  <option value={o.owner_id} key={o.owner_id}>
                    {o.fullname}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="label">ชื่อสวน</label>
            <input
              className="input"
              value={form.farm_name || ""}
              onChange={(e) => setForm({ ...form, farm_name: e.target.value })}
              required
            />
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <select
              className="select"
              value={form.farm_type_id || ""}
              onChange={(e) =>
                setForm({ ...form, farm_type_id: e.target.value })
              }
            >
              <option value="">ประเภทสวน</option>
              {look.farmTypes.map((x) => (
                <option value={x.farm_type_id} key={x.farm_type_id}>
                  {x.farm_type_name}
                </option>
              ))}
            </select>
            <select
              className="select"
              value={form.coffee_id || ""}
              onChange={(e) => setForm({ ...form, coffee_id: e.target.value })}
            >
              <option value="">พันธุ์กาแฟ</option>
              {look.coffeeTypes.map((x) => (
                <option value={x.coffee_id} key={x.coffee_id}>
                  {x.coffee_name}
                </option>
              ))}
            </select>
            <select
              className="select"
              value={form.soil_type_id || ""}
              onChange={(e) =>
                setForm({ ...form, soil_type_id: e.target.value })
              }
            >
              <option value="">ประเภทดิน</option>
              {look.soilTypes.map((x) => (
                <option value={x.soil_type_id} key={x.soil_type_id}>
                  {x.soil_type_name}
                </option>
              ))}
            </select>
          </div>
          <input
            className="input"
            placeholder="บ้านเลขที่"
            value={form.house_no || ""}
            onChange={(e) => setForm({ ...form, house_no: e.target.value })}
          />
          <SmartLocationFields form={form} setForm={setForm} />
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
              onChange={(e) =>
                setForm({ ...form, planting_year: e.target.value })
              }
            />
          </div>
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
          <textarea
            className="textarea"
            placeholder="รายละเอียดสวน"
            value={form.description || ""}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <label className="label">รูปภาพสวน</label>
            <input
                type="file"
                name="image"
                accept="image/*"
                onChange={(e) =>
                setForm({ ...form, image: e.target.files[0] })
                }
                className="input"
            />
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
                }}
              >
                ยกเลิก
              </button>
            )}
          </div>
        </form>

        <div className="xl:col-span-2">
          <div className="card mb-4 grid gap-3 p-4 lg:grid-cols-[1fr_auto]">
            <input
              className="input"
              placeholder="ค้นหาชื่อสวน เจ้าของ อำเภอ ตำบล หรือพันธุ์กาแฟ"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              <button className="btn btn-mint" onClick={exportExcel}>
                <FileSpreadsheet size={18} />
                Excel
              </button>
              <button className="btn btn-rose" onClick={exportCsv}>
                <Download size={18} />
                CSV
              </button>
              <button className="btn btn-primary" onClick={printOfficial}>
                <Printer size={18} />
                รายงาน/PDF
              </button>
            </div>
          </div>
          <div className="mb-3 flex flex-wrap gap-3">
            <button
              className={!deleted ? "btn btn-primary" : "btn btn-ghost"}
              onClick={() => setDeleted(false)}
            >
              ข้อมูลปกติ
            </button>
            <button
              className={deleted ? "btn btn-primary" : "btn btn-ghost"}
              onClick={() => setDeleted(true)}
            >
              ข้อมูลที่ลบ
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {filtered.map((f, i) => (
              <article className="card p-4" key={f.farm_id}>
                <img
                  className="h-44 w-full rounded-3xl object-cover"
                  src={fileUrl(
                    f.file_path ||
                      `frontend/assets/images/farm-${(i % 5) + 1}.svg`,
                  )}
                />
                <h3 className="mt-3 text-xl font-black text-coffee">
                  {f.farm_name}
                </h3>
                <p className="text-muted">
                  {f.village} ต.{f.sub_district} อ.{f.district}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="chip">{f.coffee_name || "-"}</span>
                  <span className="chip">{f.area_size || 0} ไร่</span>
                  <span className="chip">{f.fullname || "เจ้าของสวน"}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {deleted && <RestoreCountdown days={f.restore_days_left} />}
                  <button
                    className="btn btn-primary"
                    type="button"
                    onClick={() => openFarmDetail(f.farm_id)}
                  >
                    ดูข้อมูลสวน
                  </button>
                  {deleted ? (
                    <button
                      className="btn btn-mint"
                      onClick={() =>
                        api(`/farms/${f.farm_id}/restore`, {
                          method: "PATCH",
                        }).then(load)
                      }
                    >
                      กู้คืน
                    </button>
                  ) : (
                    <>
                      <button className="btn btn-rose" onClick={() => start(f)}>
                        แก้ไข
                      </button>
                      <button
                        className="btn btn-ghost"
                        onClick={() =>
                          confirm("ลบสวน?") &&
                          api(`/farms/${f.farm_id}`, { method: "DELETE" }).then(
                            load,
                          )
                        }
                      >
                        ลบ
                      </button>
                    </>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <FarmDetailModal
        farm={selectedFarm}
        onClose={() => setSelectedFarm(null)}
      />
    </main>
  );
}
