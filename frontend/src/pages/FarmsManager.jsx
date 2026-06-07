// // Farms Manager - จัดการข้อมูลสวนกาแฟและตำแหน่งบนแผนที่ พร้อมฟีเจอร์ส่งออกข้อมูลเป็นรายงานทางการ
// import { Download, FileSpreadsheet, Printer, Plus } from "lucide-react";
// import { useEffect, useMemo, useState } from "react";
// import SmartLocationFields from "../components/SmartLocationFields";
// import { api, fileUrl } from "../utils/api";
// import FarmList from "../components/farms/FarmList";
// import FarmForm from "../components/farms/FarmForm";
// import FarmExport from "../components/farms/FarmExport";
// import { Search } from "lucide-react";
// import FarmDetailModal from "../components/FarmDetailModal";
// import RestoreCountdown from "../components/RestoreCountdown";


// const blank = {
//   owner_id: "",
//   farm_type_id: "",
//   coffee_id: "",
//   soil_type_id: "",
//   farm_name: "",
//   house_no: "",
//   village: "",
//   sub_district: "",
//   district: "",
//   postal_code: "",
//   area_size: "",
//   latitude: "",
//   longitude: "",
//   water_system: 1,
//   description: "",
//   image: null,
//   altitude: "",
//   planting_year: "",
// };

// const headers = [
//   "ชื่อสวน",
//   "เจ้าของ",
//   "พันธุ์กาแฟ",
//   "ประเภทสวน",
//   "ประเภทดิน",
//   "ที่ตั้ง",
//   "พื้นที่(ไร่)",
//   "ระบบน้ำ",
//   "ความสูง(ม.)",
//   "ละติจูด",
//   "ลองจิจูด",
// ];
// const rowValues = (f) => [
//   f.farm_name || "-",
//   f.fullname || "-",
//   f.coffee_name || "-",
//   f.farm_type_name || "-",
//   f.soil_type_name || "-",
//   `${f.house_no || ""} ${f.village || ""} ต.${f.sub_district || "-"} อ.${f.district || "-"} จ.เลย ${f.postal_code || ""}`,
//   f.area_size || 0,
//   Number(f.water_system) ? "มี" : "ไม่มี",
//   f.altitude || "-",
//   f.latitude || "-",
//   f.longitude || "-",
// ];

// function downloadFile(filename, content, type) {
//   const blob = new Blob(["\ufeff" + content], { type });
//   const url = URL.createObjectURL(blob);
//   const a = document.createElement("a");
//   a.href = url;
//   a.download = filename;
//   a.click();
//   URL.revokeObjectURL(url);
// }

// export default function FarmsManager({ owner = false }) {
//   const [rows, setRows] = useState([]);
//   const [look, setLook] = useState({
//     owners: [],
//     farmTypes: [],
//     coffeeTypes: [],
//     soilTypes: [],
//   });
//   const [form, setForm] = useState(blank);
//   const [edit, setEdit] = useState(null);
//   const [deleted, setDeleted] = useState(false);
//   const [keyword, setKeyword] = useState("");
//   const [tab, setTab] = useState("list");
//   const [mapFarm, setMapFarm] = useState(null);
//   const [selectedFarm, setSelectedFarm] = useState(null);
//   const [preview, setPreview] = useState(null);

//   const title = owner
//     ? "จัดการสวนกาแฟของตนเอง"
//     : "จัดการข้อมูลสวนกาแฟและตำแหน่งบนแผนที่";
//   const endpoint = owner ? "/farms/mine" : "/farms";

//   async function load() {
//     const data = await api(`${endpoint}${deleted ? "?deleted=1" : ""}`);
//     setRows(data);
//   }

//   useEffect(() => {
//     let alive = true;
//     async function loadLookups() {
//       const [farmTypes, coffeeTypes, soilTypes, owners] = await Promise.all([
//         api("/farm-types"),
//         api("/coffee-types"),
//         api("/soil-types"),
//         owner ? Promise.resolve([]) : api("/owners"),
//       ]);
//       if (alive) setLook({ farmTypes, coffeeTypes, soilTypes, owners });
//     }
//     loadLookups().catch(console.error);
//     return () => {
//       alive = false;
//     };
//   }, [owner]);

//   useEffect(() => {
//     load().catch(console.error);
//   }, [deleted, owner]);

//   const filtered = useMemo(() => {
//     const q = keyword.trim().toLowerCase();
//     if (!q) return rows;
//     return rows.filter((f) =>
//       [
//         f.farm_name,
//         f.fullname,
//         f.district,
//         f.sub_district,
//         f.village,
//         f.coffee_name,
//       ]
//         .join(" ")
//         .toLowerCase()
//         .includes(q),
//     );
//   }, [rows, keyword]);

//   async function save(e) {
//     e.preventDefault();

//     const fd = new FormData();

//     // Object.entries(form).forEach(([key, value]) => {
//     //   fd.append(key, value);
//     // });
//     Object.entries(form).forEach(([key, value]) => {
//       if (key === "image") {

//         // ส่งเฉพาะตอนเลือกรูปใหม่
//         if (value instanceof File) {
//           fd.append("image", value);
//         }

//       } else {
//         fd.append(key, value ?? "");
//       }
//     });

//     await api(edit ? `/farms/${edit.farm_id}` : "/farms", {
//       method: edit ? "PUT" : "POST",
//       body: fd,
//     });
    
//     setForm(blank);
//     setEdit(f.farm_id);
//     setPreview(null); // เพิ่มบรรทัดนี้

//     await load();
//   }

  
//   function start(f) {
//   setEdit(f.farm_id);

//   setPreview(
//     f.file_path
//       ? `${fileUrl}/${f.file_path}`
//       : null
//   );

//   setForm({
//     ...blank,
//     ...f,

//     // แก้ date
//     planting_year: f.planting_year
//       ? f.planting_year.slice(0, 10)
//       : "",

//       // โหลดรูปเดิม
//     image: f.file_path
//       ? `${fileUrl}/${f.file_path}`
//       : "",
//   });

//   // เปิดแท็บฟอร์มแก้ไข
//   setTab("add");
//   //เลื่อนขึ้นบน
//   window.scrollTo({
//     top: 0,
//     behavior: "smooth",
//   });
// }


//   async function openFarmDetail(farmId) {
//     try {
//       setSelectedFarm(await api(`/farms/${farmId}`));
//     } catch (error) {
//       alert(error.message || "ไม่สามารถโหลดข้อมูลสวนได้");
//     }
//   }

//   function exportCsv() {
//     const lines = [headers, ...filtered.map(rowValues)].map((r) =>
//       r.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(","),
//     );
//     downloadFile(
//       `รายงานข้อมูลสวนกาแฟ_${owner ? "เจ้าของสวน" : "ทั้งหมด"}.csv`,
//       lines.join("\n"),
//       "text/csv;charset=utf-8",
//     );
//   }

//   function exportExcel() {
//     const table = `<table><thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${filtered
//       .map(
//         (f) =>
//           `<tr>${rowValues(f)
//             .map((v) => `<td>${v}</td>`)
//             .join("")}</tr>`,
//       )
//       .join("")}</tbody></table>`;
//     downloadFile(
//       `รายงานข้อมูลสวนกาแฟ_${owner ? "เจ้าของสวน" : "ทั้งหมด"}.xls`,
//       table,
//       "application/vnd.ms-excel;charset=utf-8",
//     );
//   }

//   function printOfficial() {
//     const html = `<!doctype html><html><head><meta charset="utf-8"><title>รายงานข้อมูลสวนกาแฟ</title><style>body{font-family:Arial,'Tahoma',sans-serif;padding:30px;color:#211}h1{color:#4b2f24;margin-bottom:4px}.meta{color:#666;margin-bottom:20px}table{width:100%;border-collapse:collapse;font-size:12px}th,td{border:1px solid #cdb8ae;padding:8px;text-align:left;vertical-align:top}th{background:#fff1f6;color:#4b2f24}.sign{margin-top:50px;text-align:right}</style></head><body><h1>รายงานข้อมูลสวนกาแฟจังหวัดเลย</h1><div class="meta">ระบบ Coffee Loei DB | วันที่ออกรายงาน ${new Date().toLocaleDateString("th-TH")} | จำนวน ${filtered.length} รายการ</div><table><thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${filtered
//       .map(
//         (f) =>
//           `<tr>${rowValues(f)
//             .map((v) => `<td>${v}</td>`)
//             .join("")}</tr>`,
//       )
//       .join(
//         "",
//       )}</tbody></table><div class="sign">ลงชื่อ........................................ ผู้จัดทำรายงาน</div><script>window.print()</script></body></html>`;
//     const w = window.open("", "_blank");
//     w.document.write(html);
//     w.document.close();
//     }
//     function openMap(f) {
//     setMapFarm(f);
//     setTab("map");

//     window.scrollTo({
//       top: 0,
//       behavior: "smooth",
//     });
//   }

 

//   return (
//     <main className="shell py-8">
//       {/* จัดการสวน */}
//       <section className="hero p-7">
//         <span className="chip">Farm Management</span>
//         <h1 className="mt-4 text-4xl font-black text-coffee md:text-4xl">
//           {title}
//         </h1>
//         <p className="mt-2 max-w-3xl text-muted mb-6">
//           {" "}
//           เพิ่ม แก้ไข ลบ ดูรายละเอียดสวน
//           ตำแหน่งบนแผนที่และส่งออกข้อมูลสวนเป็นไฟล์รายงานทางการ
//         </p>

//         {/* BUTTON GROUP */}
//         <div className="flex flex-wrap  gap-3 mb-4">
//           {/* รายการสวน */}
//           <button
//             onClick={() => setTab("list")}
//             className={`px-4 py-2 rounded-xl border transition
//               ${
//                 tab === "list"
//                   ? "bg-black text-white"
//                   : "bg-white hover:bg-gray-100"
//               }`}
//           >
//             รายการสวน
//           </button>
//           {/* เพิ่ม */}
//           <button
//             onClick={() => setTab("add")}
//             className={`px-4 py-2 rounded-xl flex items-center gap-2 border transition
//               ${
//                 tab === "add"
//                   ? "bg-black text-white"
//                   : "bg-white hover:bg-gray-100"
//               }`}
//           >
//             <Plus size={16} />
//             เพิ่มสวน
//           </button>
//           {/* ส่งออก */}
//           <button
//             onClick={() => setTab("export")}
//             className={`px-4 py-2 rounded-xl flex items-center gap-2 border transition
//               ${
//                 tab === "export"
//                   ? "bg-black text-white"
//                   : "bg-white hover:bg-gray-100"
//               }`}
//           >
//             <Download size={16} />
//             ส่งออก
//           </button>
//           {/* ปุ่มข้อมูล */}
//           <button
//             className={`btn px-6 rounded-md  ${
//               !deleted ? "btn-primary" : "btn-ghost"
//             }`}
//             onClick={() => setDeleted(false)}
//           >
//             ข้อมูลปกติ
//           </button>

//           <button
//             className={`btn px-6 rounded-md ${
//               deleted ? "btn-primary" : "btn-ghost"
//             }`}
//             onClick={() => setDeleted(true)}
//           >
//             ข้อมูลที่ลบ
//           </button>
//         </div>

//         {/* แท็บรายการสวน */}
//         {tab === "list" && (
//           <>
//             {/* ค้นหาสวน */}
//             <div className="card mb-4 grid gap-3 p-3 lg:grid-cols-[1fr_auto] relative ">
//               <Search
//                 size={18}
//                 className="absolute right-20 top-1/2 -translate-y-1/2 text-gray-400 "
//               />
//               <input
//                 className="input"
//                 placeholder="ค้นหาชื่อสวน เจ้าของ อำเภอ ตำบล หรือพันธุ์กาแฟ "
//                 value={keyword}
//                 onChange={(e) => setKeyword(e.target.value)}
//               />
//             </div>


//             {/* รายการสวน */}
//             <FarmList
//               filtered={filtered}
//               deleted={deleted}
//               load={load}
//               start={start}
//               openMap={openMap}
//               openFarmDetail={openFarmDetail}  
//               api={api}
//               fileUrl={fileUrl}
//             />
//           </>
//         )}
//         {/* แท็บเพิ่มข้อมูล */}
//         {tab === "add" && (
//           <FarmForm
//             owner={owner}
//             look={look}
//             form={form}
//             setForm={setForm}
//             save={save}
//             edit={edit}
//             setEdit={setEdit}
//             blank={blank}
//             preview={preview}       
//             setPreview={setPreview}  
//           />
//         )}
//         {/* แท็บส่งออก */}
//         {tab === "export" && (
//           <FarmExport
//             exportExcel={exportExcel}
//             exportCsv={exportCsv}
//             printOfficial={printOfficial}
//           />
//         )}
//         {tab === "map" && mapFarm && (
//           <section className="card p-5">
//             <h2 className="text-2xl font-bold mb-4">
//               แผนที่สวนกาแฟ
//             </h2>

//             <p className="mb-4 text-muted">
//               {mapFarm.farm_name}
//             </p>

//             <iframe
//               title="map"
//               width="100%"
//               height="500"
//               className="rounded-2xl"
//               loading="lazy"
//               src={`https://www.google.com/maps?q=${mapFarm.latitude},${mapFarm.longitude}&output=embed`}
//             />
//           </section>
//         )}
//       </section>
//       <FarmDetailModal
//         farm={selectedFarm}
//         onClose={() => setSelectedFarm(null)}
//       />
//     </main>
//   );
// }
// Farms Manager - จัดการข้อมูลสวนกาแฟและตำแหน่งบนแผนที่ พร้อมฟีเจอร์ส่งออกข้อมูลเป็นรายงานทางการ


// Farms Manager - จัดการข้อมูลสวนกาแฟและตำแหน่งบนแผนที่ พร้อมฟีเจอร์ส่งออกข้อมูลเป็นรายงานทางการ
import { Download, FileSpreadsheet, Printer, Plus } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import SmartLocationFields from "../components/SmartLocationFields";
import { api, fileUrl } from "../utils/api";
import FarmList from "../components/farms/FarmList";
import FarmForm from "../components/farms/FarmForm";
import FarmExport from "../components/farms/FarmExport";
import { Search } from "lucide-react";
import FarmDetailModal from "../components/FarmDetailModal";
import RestoreCountdown from "../components/RestoreCountdown";

// ─── MapPinModal ────────────────────────────────────────────────────────────────
// Modal ปักหมุดแบบ interactive ด้วย Leaflet.js
// คลิกบนแผนที่ได้เลย — หมุดจะย้ายตาม พร้อมแสดงพิกัด real-time
function MapPinModal({ lat, lng, onConfirm, onClose }) {
  const initLat = parseFloat(lat) || 17.4893;
  const initLng = parseFloat(lng) || 101.7236;

  const [pinLat, setPinLat] = useState(initLat);
  const [pinLng, setPinLng] = useState(initLng);
  const mapRef = useRef(null);       // DOM div สำหรับ Leaflet mount
  const leafletRef = useRef(null);   // Leaflet map instance
  const markerRef = useRef(null);    // Leaflet marker instance

  useEffect(() => {
    // โหลด Leaflet CSS ถ้ายังไม่มี
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    // โหลด Leaflet JS แล้ว init map
    function initMap(L) {
      if (leafletRef.current) return; // init แล้ว ข้ามไป

      const map = L.map(mapRef.current).setView([initLat, initLng], 14);
      leafletRef.current = map;

      // Tile layer — OpenStreetMap
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);

      // Icon หมุด
      const icon = L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      // วางหมุดเริ่มต้น
      const marker = L.marker([initLat, initLng], { draggable: true, icon }).addTo(map);
      markerRef.current = marker;

      // คลิกบนแผนที่ → ย้ายหมุด
      map.on("click", (e) => {
        const { lat: la, lng: lo } = e.latlng;
        marker.setLatLng([la, lo]);
        setPinLat(la);
        setPinLng(lo);
      });

      // ลากหมุด → อัปเดตพิกัด
      marker.on("dragend", (e) => {
        const { lat: la, lng: lo } = e.target.getLatLng();
        setPinLat(la);
        setPinLng(lo);
      });
    }

    if (window.L) {
      initMap(window.L);
    } else {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = () => initMap(window.L);
      document.head.appendChild(script);
    }

    return () => {
      // cleanup เมื่อ Modal ปิด
      if (leafletRef.current) {
        leafletRef.current.remove();
        leafletRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-amber-50">
          <div>
            <h2 className="text-xl font-bold text-coffee">📍 ปักหมุดตำแหน่งสวน</h2>
            <p className="text-sm text-muted mt-0.5">
              คลิกบนแผนที่หรือลากหมุด เพื่อเลือกตำแหน่ง
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">
            ×
          </button>
        </div>

        {/* แผนที่ Leaflet */}
        <div
          ref={mapRef}
          style={{ height: "380px", width: "100%", cursor: "crosshair" }}
        />

        {/* พิกัดที่เลือก + ปุ่ม */}
        <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
          <span className="text-sm text-muted">
            📌 พิกัด:{" "}
            <span className="font-mono font-semibold text-coffee">
              {pinLat.toFixed(6)}, {pinLng.toFixed(6)}
            </span>
          </span>
          <div className="flex gap-3">
            <button onClick={onClose} className="btn btn-ghost px-5 py-2 rounded-xl">
              ยกเลิก
            </button>
            <button
              onClick={() => onConfirm(pinLat, pinLng)}
              className="btn btn-primary px-5 py-2 rounded-xl"
            >
              ✅ ยืนยันพิกัดนี้
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ส่วนที่เหลือเหมือนเดิมทุกอย่าง ────────────────────────────────────────────

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

  // ── state ใหม่: ควบคุม MapPinModal ──────────────────────────────────────────
  const [showMapPin, setShowMapPin] = useState(false);

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

    Object.entries(form).forEach(([key, value]) => {
      if (key === "image") {
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
    setEdit(null);
    setPreview(null);

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
      planting_year: f.planting_year
        ? f.planting_year.slice(0, 10)
        : "",
      image: f.file_path
        ? `${fileUrl}/${f.file_path}`
        : "",
    });

    setTab("add");
    window.scrollTo({ top: 0, behavior: "smooth" });
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ── รับพิกัดจาก MapPinModal แล้วใส่ลงใน form ─────────────────────────────
  function handleMapPinConfirm(lat, lng) {
    setForm((prev) => ({
      ...prev,
      latitude: String(lat),
      longitude: String(lng),
    }));
    setShowMapPin(false);
  }

  return (
    <main className="shell py-8">
      {/* MapPinModal — แสดงเมื่อ showMapPin = true */}
      {showMapPin && (
        <MapPinModal
          lat={form.latitude}
          lng={form.longitude}
          onConfirm={handleMapPinConfirm}
          onClose={() => setShowMapPin(false)}
        />
      )}

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
        <div className="flex flex-wrap gap-3 mb-4">
          <button
            onClick={() => setTab("list")}
            className={`px-4 py-2 rounded-xl border transition
              ${tab === "list" ? "bg-black text-white" : "bg-white hover:bg-gray-100"}`}
          >
            รายการสวน
          </button>
          <button
            onClick={() => setTab("add")}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 border transition
              ${tab === "add" ? "bg-black text-white" : "bg-white hover:bg-gray-100"}`}
          >
            <Plus size={16} />
            เพิ่มสวน
          </button>
          <button
            onClick={() => setTab("export")}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 border transition
              ${tab === "export" ? "bg-black text-white" : "bg-white hover:bg-gray-100"}`}
          >
            <Download size={16} />
            ส่งออก
          </button>
          <button
            className={`btn px-6 rounded-md ${!deleted ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setDeleted(false)}
          >
            ข้อมูลปกติ
          </button>
          <button
            className={`btn px-6 rounded-md ${deleted ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setDeleted(true)}
          >
            ข้อมูลที่ลบ
          </button>
        </div>

        {/* แท็บรายการสวน */}
        {tab === "list" && (
          <>
            <div className="card mb-4 grid gap-3 p-3 lg:grid-cols-[1fr_auto] relative">
              <Search
                size={18}
                className="absolute right-20 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                className="input"
                placeholder="ค้นหาชื่อสวน เจ้าของ อำเภอ ตำบล หรือพันธุ์กาแฟ"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>
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

        {/* แท็บเพิ่มข้อมูล — ส่ง onOpenMapPin เพิ่มเข้าไป */}
        {tab === "add" && (
          <>
            {/* ปุ่มปักหมุดแผนที่ แสดงก่อนฟอร์ม */}
            <div className="mb-4 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowMapPin(true)}
                className="btn btn-ghost flex items-center gap-2 rounded-xl border px-5 py-2 text-sm hover:bg-amber-50"
              >
                📍 ปักหมุดตำแหน่งบนแผนที่
              </button>
              {form.latitude && form.longitude && (
                <span className="text-xs text-muted bg-green-50 border border-green-200 rounded-lg px-3 py-1">
                  ✅ พิกัด: {Number(form.latitude).toFixed(5)},{" "}
                  {Number(form.longitude).toFixed(5)}
                </span>
              )}
            </div>

            {/* preview แผนที่เล็ก ๆ ถ้ามีพิกัดแล้ว */}
            {form.latitude && form.longitude && (
              <div className="mb-5 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                <iframe
                  title="map-pin-mini"
                  width="100%"
                  height="220"
                  loading="lazy"
                  src={`https://www.google.com/maps?q=${form.latitude},${form.longitude}&z=14&output=embed`}
                />
              </div>
            )}

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
              onOpenMapPin={() => setShowMapPin(true)}
            />
          </>
        )}

        {/* แท็บส่งออก */}
        {tab === "export" && (
          <FarmExport
            exportExcel={exportExcel}
            exportCsv={exportCsv}
            printOfficial={printOfficial}
          />
        )}

        {/* แท็บแผนที่ */}
        {tab === "map" && mapFarm && (
          <section className="card p-5">
            <h2 className="text-2xl font-bold mb-4">แผนที่สวนกาแฟ</h2>
            <p className="mb-4 text-muted">{mapFarm.farm_name}</p>
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