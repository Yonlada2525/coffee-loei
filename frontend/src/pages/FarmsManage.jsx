import { useEffect, useState } from "react";
import { API, asset } from "../services/api";
import { LOEI } from "../data/locations";
const empty = {
  farm_name: "",
  owner_id: "",
  farm_type_id: "",
  coffee_id: "",
  soil_type_id: "",
  house_no: "",
  area_size: 10,
  latitude: 17.486,
  longitude: 101.72,
  water_system: 1,
  description: "",
  altitude: 600,
  planting_year: "2024-01-01",
  image: null,
};
export default function FarmsManage({ role }) {
  const [rows, setRows] = useState([]),
    [look, setLook] = useState({
      owners: [],
      farmTypes: [],
      coffeeTypes: [],
      soilTypes: [],
    });
  const districts = Object.keys(LOEI);
  const [loc, setLoc] = useState({
    district: districts[0],
    sub_district: Object.keys(LOEI[districts[0]])[0],
    village: LOEI[districts[0]][Object.keys(LOEI[districts[0]])[0]][0].v,
    postal_code: LOEI[districts[0]][Object.keys(LOEI[districts[0]])[0]][0].p,
  });
  const [form, setForm] = useState(empty);
  const [image, setImage] = useState(null);


  const load = () => {
    API.get(role === "owner" ? "/farms/mine" : "/farms").then(setRows);
    API.get("/lookups").then(setLook);
  };
  useEffect(load, []);
  function cd(d) {
    const sd = Object.keys(LOEI[d])[0],
      v = LOEI[d][sd][0];
    setLoc({ district: d, sub_district: sd, village: v.v, postal_code: v.p });
  }
  function cs(sd) {
    const v = LOEI[loc.district][sd][0];
    setLoc({ ...loc, sub_district: sd, village: v.v, postal_code: v.p });
  }
  function cv(vn) {
    const v = LOEI[loc.district][loc.sub_district].find((x) => x.v === vn);
    setLoc({ ...loc, village: vn, postal_code: v?.p || "" });
  }
//   async function submit(e) {
//     e.preventDefault();
//     await API.post("/farms", { ...form, ...loc });
//     alert("บันทึกสวนแล้ว");
//     setForm(empty);
//     load();
//   }

// async function submit(e) {
//   e.preventDefault();

//   // บันทึกข้อมูลสวนก่อน
//   const farm = await API.post("/farms", {
//     ...form,
//     ...loc,
//   });

//   // ถ้ามีรูปภาพให้อัปโหลดต่อ
//   if (image) {
//     const fd = new FormData();
//     fd.append("farm_id", farm.farm_id);
//     fd.append("file", image);

//     await API.post("/media", fd, {
//       headers: {
//         "Content-Type": "multipart/form-data",
//       },
//     });
//   }

//   alert("บันทึกสวนแล้ว");

//   setForm(empty);
//   setImage(null);

//   load();
// }
async function submit(e) {
  e.preventDefault();

  const fd = new FormData();

  Object.entries({
    ...form,
    ...loc,
  }).forEach(([key, value]) => {
    fd.append(key, value);
  });

  if (image) {
    fd.append("image", image);
  }

  await API.post("/farms", fd, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  alert("บันทึกสวนแล้ว");

  setForm(empty);
  setImage(null);

  load();
}


  return (
    <div className="shell">
      <section className="hero p-6">
        <h1 className="text-4xl font-black text-coffee">จัดการสวนกาแฟ</h1>
        <p className="text-[#786a62] mt-2">
          Smart Form ลดการพิมพ์ เลือกพื้นที่แบบเชื่อมโยงอัตโนมัติ
        </p>
      </section>
      <form
        onSubmit={submit}
        className="card p-5 mt-8 grid md:grid-cols-4 gap-4"
      >
        {role === "admin" && (
          <label>
            <span className="label">เจ้าของสวน</span>
            <select
              required
              className="select"
              value={form.owner_id}
              onChange={(e) => setForm({ ...form, owner_id: e.target.value })}
            >
              <option value="">เลือก</option>
              {look.owners?.map((o) => (
                <option value={o.owner_id} key={o.owner_id}>
                  {o.fullname}
                </option>
              ))}
            </select>
          </label>
        )}
        <label>
          <span className="label">ชื่อสวน</span>
          <input
            required
            className="input"
            value={form.farm_name}
            onChange={(e) => setForm({ ...form, farm_name: e.target.value })}
          />
        </label>
        <label>
          <span className="label">ประเภทสวน</span>
          <select
            className="select"
            value={form.farm_type_id}
            onChange={(e) => setForm({ ...form, farm_type_id: e.target.value })}
          >
            <option>เลือก</option>
            {look.farmTypes?.map((x) => (
              <option value={x.farm_type_id} key={x.farm_type_id}>
                {x.farm_type_name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="label">พันธุ์กาแฟ</span>
          <select
            className="select"
            value={form.coffee_id}
            onChange={(e) => setForm({ ...form, coffee_id: e.target.value })}
          >
            <option>เลือก</option>
            {look.coffeeTypes?.map((x) => (
              <option value={x.coffee_id} key={x.coffee_id}>
                {x.coffee_name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="label">ประเภทดิน</span>
          <select
            className="select"
            value={form.soil_type_id}
            onChange={(e) => setForm({ ...form, soil_type_id: e.target.value })}
          >
            <option>เลือก</option>
            {look.soilTypes?.map((x) => (
              <option value={x.soil_type_id} key={x.soil_type_id}>
                {x.soil_type_name}
              </option>
            ))}
          </select>
        </label>
        {[
          ["house_no", "บ้านเลขที่"],
          ["area_size", "พื้นที่ไร่"],
          ["latitude", "ละติจูด"],
          ["longitude", "ลองจิจูด"],
          ["altitude", "ความสูง"],
        ].map(([k, t]) => (
          <label key={k}>
            <span className="label">{t}</span>
            <input
              className="input"
              value={form[k]}
              onChange={(e) => setForm({ ...form, [k]: e.target.value })}
            />
          </label>
        ))}
        <label>
          <span className="label">อำเภอ</span>
          <select
            className="select"
            value={loc.district}
            onChange={(e) => cd(e.target.value)}
          >
            {districts.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="label">ตำบล</span>
          <select
            className="select"
            value={loc.sub_district}
            onChange={(e) => cs(e.target.value)}
          >
            {Object.keys(LOEI[loc.district]).map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="label">หมู่บ้าน</span>
          <select
            className="select"
            value={loc.village}
            onChange={(e) => cv(e.target.value)}
          >
            {LOEI[loc.district][loc.sub_district].map((x) => (
              <option key={x.v}>{x.v}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="label">รหัสไปรษณีย์</span>
          <input className="input" value={loc.postal_code} readOnly />
        </label>
        <label>
          <span className="label">ระบบน้ำ</span>
          <select
            className="select"
            value={form.water_system}
            onChange={(e) => setForm({ ...form, water_system: e.target.value })}
          >
            <option value="1">มีระบบน้ำ</option>
            <option value="0">ไม่มีระบบน้ำ</option>
          </select>
        </label>
        <label>
          <span className="label">ปีที่เริ่มปลูก</span>
          <input
            type="date"
            className="input"
            value={form.planting_year}
            onChange={(e) =>
              setForm({ ...form, planting_year: e.target.value })
            }
          />
        </label>
        <label className="md:col-span-4">
          <span className="label">รายละเอียด</span>
          <textarea
            className="textarea"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </label>
        {/* <label className="md:col-span-4">
            <span className="label">รูปภาพสวน</span>
            <input
                type="file"
                accept="image/*"
                className="input"
                onChange={(e) => setImage(e.target.files[0])}
            />
             {image && (
                <p className="text-sm text-green-600 mt-2">
                เลือกไฟล์: {image.name}
                </p>
            )}
        </label> */}
           {/* รูปภาพสวน */}
           
            <label className="font-semibold text-coffee">รูปภาพสวน</label>
            <input
                type="file"
                name="image"
                accept="image/*"
                onChange={(e) =>
                setForm({ ...form, image: e.target.files[0] })
                }
                className="input"
            />
            

        <button className="btn btn-primary md:col-span-4">
          บันทึกข้อมูลสวน
        </button>
      </form>
      <div className="table-wrap mt-8">
        <table>
          <thead>
            <tr>
                <th>รูปภาพ</th>
                <th>สวน</th>
                <th>ที่ตั้ง</th>
                <th>กาแฟ</th>
                <th>พื้นที่</th>
                <th></th>
            </tr>
          </thead>
          {/* <tbody>
            {rows.map((f) => (
              <tr key={f.farm_id}>
                <td>
                    {f.file_path ? (
                    <img
                        src={`http://localhost:5000/uploads/${f.file_path}`}
                        alt={f.farm_name}
                        className="w-20 h-20 object-cover rounded-lg"
                    />
                    ) : (
                    "-"
                    )}
                </td>
                <td>
                  <b>{f.farm_name}</b>
                  <br />
                  {f.owner_name}
                </td>
                <td>
                  {f.village} ต.{f.sub_district} อ.{f.district}
                </td>
                <td>{f.coffee_name}</td>
                <td>{f.area_size} ไร่</td>
                <td>
                  <button
                    className="btn btn-ghost"
                    onClick={async () => {
                      if (confirm("ลบสวน?")) {
                        await API.delete("/farms/" + f.farm_id);
                        load();
                      }
                    }}
                  >
                    ลบ
                  </button>
                </td>
              </tr>
            ))}
          </tbody> */}

          <tbody>
            {rows.map((f) => (
                <tr key={f.farm_id}>
                <td>
                    {f.file_path ? (
                    <img
                        src={asset(f.file_path)}
                        alt={f.farm_name}
                        className="w-20 h-20 object-cover rounded-lg"
                    />
                    ) : (
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-xs">
                        ไม่มีรูป
                    </div>
                    )}
                </td>

                <td>
                    <b>{f.farm_name}</b>
                    <br />
                    {f.fullname}
                </td>

                <td>
                    {f.village} ต.{f.sub_district} อ.{f.district}
                </td>

                <td>{f.coffee_name}</td>

                <td>{f.area_size} ไร่</td>

                <td>
                    <button
                    className="btn btn-ghost"
                    onClick={async () => {
                        if (confirm("ลบสวน?")) {
                        await API.delete("/farms/" + f.farm_id);
                        load();
                        }
                    }}
                    >
                    ลบ
                    </button>
                </td>
                </tr>
            ))}
        </tbody>
        </table>
      </div>
    </div>
  );
}
