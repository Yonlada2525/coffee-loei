import {Download, FileSpreadsheet, Printer,} from "lucide-react";

export default function FarmExport({
  exportExcel,
  exportCsv,
  printOfficial,
}) {
  return (
    <div className="card p-5">

      <h2 className="text-xl font-black text-coffee mb-4"> ส่งออกข้อมูลรายงาน </h2>
      <div className="flex flex-wrap gap-3">

        <button
          className="btn btn-mint"
          onClick={exportExcel}
        >
          <FileSpreadsheet size={18} />
          Excel
        </button>

        <button
          className="btn btn-rose"
          onClick={exportCsv}
        >
          <Download size={18} />
          CSV
        </button>

        <button
          className="btn btn-primary"
          onClick={printOfficial}
        >
          <Printer size={18} />
          รายงาน / PDF
        </button>
      </div>
    </div>
  );
}