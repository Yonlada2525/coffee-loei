import { Download, FileSpreadsheet, Printer } from 'lucide-react';
import { exportFarmsCsv, exportFarmsExcel, printFarmsOfficial } from '../utils/exportOfficial';

export default function FarmExportPanel({ rows = [], role = 'all', title = 'ส่งออกข้อมูลสวนกาแฟ' }) {
  const disabled = rows.length === 0;
  const roleLabel = role === 'admin' ? 'admin_all_farms' : role === 'owner' ? 'owner_farms' : 'public_farms';

  return (
    <section className="card overflow-hidden">
      <div className="grid gap-4 p-5 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <span className="chip">Official Export</span>
          <h2 className="mt-3 text-2xl font-black text-coffee">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-muted">
            ส่งออกข้อมูลสวนกาแฟที่แสดงอยู่ทั้งหมดเป็นไฟล์ทางการ สำหรับแนบรายงาน ส่งอาจารย์ หรือเก็บเป็นเอกสารของหน่วยงาน
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-3 md:min-w-[520px]">
          <button disabled={disabled} className="btn btn-primary" onClick={() => exportFarmsExcel(rows, roleLabel)}>
            <FileSpreadsheet size={18} /> Excel .xls
          </button>
          <button disabled={disabled} className="btn btn-mint" onClick={() => exportFarmsCsv(rows, roleLabel)}>
            <Download size={18} /> CSV
          </button>
          <button disabled={disabled} className="btn btn-rose" onClick={() => printFarmsOfficial(rows, role === 'admin' ? 'ข้อมูลสวนทั้งหมด' : 'ข้อมูลสวนของเจ้าของสวน')}>
            <Printer size={18} /> พิมพ์/PDF
          </button>
        </div>
      </div>
      <div className="border-t border-[rgba(122,79,56,.12)] bg-white/45 px-5 py-3 text-sm font-bold text-brown">
        พร้อมส่งออก {rows.length.toLocaleString('th-TH')} รายการ
      </div>
    </section>
  );
}
