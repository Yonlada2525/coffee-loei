
import {
  MapPin,
  Trees,
  LandPlot,
  Coffee,
  Pencil,
  Trash2,
  Map,
  Bean 
} from "lucide-react";
import { useMemo } from "react";

export default function FarmList({
  filtered,
  deleted,
  load,
  start,
  openMap,
  openFarmDetail,
  api,
  fileUrl,
}) {
  // ===== สรุปสถิติ =====
  const stats = useMemo(() => {
    const totalFarms = filtered.length;

    const totalArea = filtered.reduce(
      (sum, f) => sum + Number(f.area_size || 0),
      0
    );

    const coffeeTypes = new Set(
      filtered.map((f) => f.coffee_name).filter(Boolean)
    );

    return {
      totalFarms,
      totalArea,
      totalCoffeeTypes: coffeeTypes.size,
    };
  }, [filtered]);

  return (
    <div className=" mx-auto w-full max-w-6xl space-y-6">
      {/* ===== สถิติ ===== */}
      <div className="grid gap-4 md:grid-cols-3">
        {filtered.map((f, i) => (
        <article className="card p-4" key={f.farm_id}>
          <img
            className="h-44 w-full rounded-3xl object-cover"
            src={fileUrl(f.file_path)}
            alt={f.farm_name}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = `/assets/images/farm-${(i % 5) + 1}.svg`;
            }}
          />
          <h3 className="mt-3 text-xl font-black text-coffee">{f.farm_name}</h3>
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
            <button className="btn btn-primary" onClick={() => openFarmDetail(f.farm_id)}>
              ดูข้อมูลสวน
            </button>
            {deleted ? (
              <button className="btn btn-mint"
                onClick={() => api(`/farms/${f.farm_id}/restore`, { method: "PATCH" }).then(load)}>
                กู้คืน
              </button>
            ) : (
              <>
                <button className="btn btn-rose" onClick={() => start(f)}>แก้ไข</button>
                <button className="btn btn-ghost"
                  onClick={() => confirm("ลบสวน?") &&
                    api(`/farms/${f.farm_id}`, { method: "DELETE" }).then(load)}>
                  ลบ
                </button>
              </>
            )}
          </div>
        </article>
      ))}
      </div>

      {/* ===== รายการสวน ===== */}
      <div className="space-y-4">
        {filtered.map((f, i) => (
          <article
            key={f.farm_id}
            className="overflow-hidden rounded-3xl border bg-white p-5 shadow-sm"
          >
            <div className="flex flex-col gap-4 lg:flex-row">
              {/* รูปภาพ */}
              <img
                className="h-52 w-full rounded-3xl object-cover lg:w-80"
                src={fileUrl(
                  f.file_path ||
                    `frontend/assets/images/farm-${(i % 5) + 1}.svg`
                )}
                alt={f.farm_name}
              />

              {/* ข้อมูล */}
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  {/* หัวข้อ + สถานะ */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-2xl font-black text-coffee">
                        {f.farm_name}
                      </h3>

                      <p className="mt-2 flex items-center text-gray-500">
                        <MapPin size={16} className="mr-2" />

                        {f.village} ต.{f.sub_district} อ.{f.district}
                      </p>
                    </div>

                    <span className="rounded-full bg-lime-100 px-4 py-1 text-sm font-medium text-lime-700">
                      เจ้าของสวน
                    </span>
                  </div>

                  {/* Tag */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-700">
                      {f.coffee_name || "-"}
                    </span>

                    <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                      {f.area_size || 0} ไร่
                    </span>

                    <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
                      {f.fullname || "เจ้าของสวน"}
                    </span>
                  </div>
                </div>

                {/* ปุ่ม */}
                <div className="mt-6 flex items-center justify-between border-t pt-4">
                  <div className="flex gap-3">
                    <button className="flex items-center gap-2 rounded-2xl border px-5 py-3 font-medium hover:bg-gray-100"
                      onClick={() => openMap (f) }
                    >
                      <Map size={18} />
                      ดูแผนที่
                    </button>

                    {!deleted && (
                      <button
                        className="flex items-center gap-2 rounded-2xl border px-5 py-3 font-medium hover:bg-gray-100"
                        onClick={() => start(f)}
                      >
                        <Pencil size={18} />
                        แก้ไข
                      </button>
                    )}
                  </div>

                  {deleted ? (
                    <button
                      className="rounded-2xl bg-green-600 px-5 py-3 text-white"
                      onClick={() =>
                        api(`/farms/${f.farm_id}/restore`, {
                          method: "PATCH",
                        }).then(load)
                      }
                    >
                      กู้คืน
                    </button>
                  ) : (
                    <button
                      className="flex items-center gap-2 rounded-2xl border px-5 py-3 text-red-600 hover:bg-red-50"
                      onClick={() =>
                        confirm("คุณแน่ใจใช่ไหมว่าต้องการลบสวน?") &&
                        api(`/farms/${f.farm_id}`, {
                          method: "DELETE",
                        }).then(load)
                      }
                    >
                      <Trash2 size={18} />
                      ลบ
                    </button>
                  )}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}


