// Farms Manager - จัดการข้อมูลสวนกาแฟและตำแหน่งบนแผนที่ พร้อมฟีเจอร์ส่งออกข้อมูลเป็นรายงานทางการ
import { Download, FileSpreadsheet, Printer, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import SmartLocationFields from "../components/SmartLocationFields";
import { api, fileUrl } from "../utils/api";
import FarmList from "../components/farms/FarmList";
import FarmForm from "../components/farms/FarmForm";
import FarmExport from "../components/farms/FarmExport";
import { Search } from "lucide-react";
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
  image: null,
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
  const [tab, setTab] = useState("list");
  const [mapFarm, setMapFarm] = useState(null);
  const [selectedFarm, setSelectedFarm] = useState(null);
  const [preview, setPreview] = useState(null);

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

    const fd = new FormData();

    // Object.entries(form).forEach(([key, value]) => {
    //   fd.append(key, value);
    // });
    Object.entries(form).forEach(([key, value]) => {
      if (key === "image") {

        // ส่งเฉพาะตอนเลือกรูปใหม่
        if (value instanceof File) {
          fd.append("image", value);
        }

      } else {
        fd.append(key, value ?? "");
      }
    });

    await api(edit ? `/farms/${edit.farm_id}` : "/farms", {
      method: edit ? "PUT" : "POST",
      body: fd,
    });
    
    setForm(blank);
    setEdit(f.farm_id);
    setPreview(null); // เพิ่มบรรทัดนี้

    await load();
  }

  
  function start(f) {
  setEdit(f.farm_id);

  setPreview(
    f.file_path
      ? `${fileUrl}/${f.file_path}`
      : null
  );

  setForm({
    ...blank,
    ...f,

    // แก้ date
    planting_year: f.planting_year
      ? f.planting_year.slice(0, 10)
      : "",

      // โหลดรูปเดิม
    image: f.file_path
      ? `${fileUrl}/${f.file_path}`
      : "",
  });

  // เปิดแท็บฟอร์มแก้ไข
  setTab("add");
  //เลื่อนขึ้นบน
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}


  async function openFarmDetail(farmId) {
    try {
      setSelectedFarm(await api(`/farms/${farmId}`));
    } catch (error) {
      alert(error.message || "ไม่สามารถโหลดข้อมูลสวนได้");
    }
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
    function openMap(f) {
    setMapFarm(f);
    setTab("map");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

 

  return (
    <main className="shell py-8">
      {/* จัดการสวน */}
      <section className="hero p-7">
        <span className="chip">Farm Management</span>
        <h1 className="mt-4 text-4xl font-black text-coffee md:text-4xl">
          {title}
        </h1>
        <p className="mt-2 max-w-3xl text-muted mb-6">
          {" "}
          เพิ่ม แก้ไข ลบ ดูรายละเอียดสวน
          ตำแหน่งบนแผนที่และส่งออกข้อมูลสวนเป็นไฟล์รายงานทางการ
        </p>

        {/* BUTTON GROUP */}
        <div className="flex flex-wrap  gap-3 mb-4">
          {/* รายการสวน */}
          <button
            onClick={() => setTab("list")}
            className={`px-4 py-2 rounded-xl border transition
              ${
                tab === "list"
                  ? "bg-black text-white"
                  : "bg-white hover:bg-gray-100"
              }`}
          >
            รายการสวน
          </button>
          {/* เพิ่ม */}
          <button
            onClick={() => setTab("add")}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 border transition
              ${
                tab === "add"
                  ? "bg-black text-white"
                  : "bg-white hover:bg-gray-100"
              }`}
          >
            <Plus size={16} />
            เพิ่มสวน
          </button>
          {/* ส่งออก */}
          <button
            onClick={() => setTab("export")}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 border transition
              ${
                tab === "export"
                  ? "bg-black text-white"
                  : "bg-white hover:bg-gray-100"
              }`}
          >
            <Download size={16} />
            ส่งออก
          </button>
          {/* ปุ่มข้อมูล */}
          <button
            className={`btn px-6 rounded-md  ${
              !deleted ? "btn-primary" : "btn-ghost"
            }`}
            onClick={() => setDeleted(false)}
          >
            ข้อมูลปกติ
          </button>

          <button
            className={`btn px-6 rounded-md ${
              deleted ? "btn-primary" : "btn-ghost"
            }`}
            onClick={() => setDeleted(true)}
          >
            ข้อมูลที่ลบ
          </button>
        </div>

        {/* แท็บรายการสวน */}
        {tab === "list" && (
          <>
            {/* ค้นหาสวน */}
            <div className="card mb-4 grid gap-3 p-3 lg:grid-cols-[1fr_auto] relative ">
              <Search
                size={18}
                className="absolute right-20 top-1/2 -translate-y-1/2 text-gray-400 "
              />
              <input
                className="input"
                placeholder="ค้นหาชื่อสวน เจ้าของ อำเภอ ตำบล หรือพันธุ์กาแฟ "
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>


            {/* รายการสวน */}
            <FarmList
              filtered={filtered}
              deleted={deleted}
              load={load}
              start={start}
              openMap={openMap}
              openFarmDetail={openFarmDetail}  
              api={api}
              fileUrl={fileUrl}
            />
          </>
        )}
        {/* แท็บเพิ่มข้อมูล */}
        {tab === "add" && (
          <FarmForm
            owner={owner}
            look={look}
            form={form}
            setForm={setForm}
            save={save}
            edit={edit}
            setEdit={setEdit}
            blank={blank}
            preview={preview}       
            setPreview={setPreview}  
          />
        )}
        {/* แท็บส่งออก */}
        {tab === "export" && (
          <FarmExport
            exportExcel={exportExcel}
            exportCsv={exportCsv}
            printOfficial={printOfficial}
          />
        )}
        {tab === "map" && mapFarm && (
          <section className="card p-5">
            <h2 className="text-2xl font-bold mb-4">
              แผนที่สวนกาแฟ
            </h2>

            <p className="mb-4 text-muted">
              {mapFarm.farm_name}
            </p>

            <iframe
              title="map"
              width="100%"
              height="500"
              className="rounded-2xl"
              loading="lazy"
              src={`https://www.google.com/maps?q=${mapFarm.latitude},${mapFarm.longitude}&output=embed`}
            />
          </section>
        )}
      </section>
      <FarmDetailModal
        farm={selectedFarm}
        onClose={() => setSelectedFarm(null)}
      />
    </main>
  );
}
