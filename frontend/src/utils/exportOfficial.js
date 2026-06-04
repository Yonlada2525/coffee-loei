const FARM_COLUMNS = [
  ['farm_id', 'รหัสสวน'],
  ['farm_name', 'ชื่อสวนกาแฟ'],
  ['fullname', 'เจ้าของสวน'],
  ['phone', 'เบอร์โทรศัพท์'],
  ['email', 'อีเมล'],
  ['farm_type_name', 'ประเภทสวน'],
  ['coffee_name', 'พันธุ์กาแฟ'],
  ['soil_type_name', 'ประเภทดิน'],
  ['house_no', 'บ้านเลขที่'],
  ['village', 'หมู่บ้าน'],
  ['sub_district', 'ตำบล'],
  ['district', 'อำเภอ'],
  ['postal_code', 'รหัสไปรษณีย์'],
  ['area_size', 'พื้นที่ปลูก (ไร่)'],
  ['altitude', 'ความสูง (เมตร)'],
  ['water_system', 'ระบบน้ำ'],
  ['planting_year', 'ปีที่เริ่มปลูก'],
  ['latitude', 'ละติจูด'],
  ['longitude', 'ลองจิจูด'],
  ['description', 'รายละเอียดสวน']
];

const officialTitle = 'รายงานข้อมูลสวนกาแฟจังหวัดเลย';
const today = () => new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
const safe = (value) => String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const water = (value) => Number(value) === 1 || value === true ? 'มีระบบน้ำ' : 'ไม่มีระบบน้ำ';
const display = (row, key) => {
  if (key === 'water_system') return water(row[key]);
  if (key === 'planting_year') return row[key] ? String(row[key]).slice(0, 10) : '';
  return row[key] ?? '';
};

function downloadBlob(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function exportFarmsCsv(rows, roleLabel = 'all') {
  const header = FARM_COLUMNS.map(([, label]) => `"${label}"`).join(',');
  const body = rows.map((row) => FARM_COLUMNS.map(([key]) => {
    const value = String(display(row, key)).replaceAll('"', '""');
    return `"${value}"`;
  }).join(',')).join('\n');
  downloadBlob(`coffee_loei_farms_${roleLabel}.csv`, `\ufeff${header}\n${body}`, 'text/csv;charset=utf-8;');
}

export function exportFarmsExcel(rows, roleLabel = 'all') {
  const th = FARM_COLUMNS.map(([, label]) => `<th>${safe(label)}</th>`).join('');
  const tr = rows.map((row) => `<tr>${FARM_COLUMNS.map(([key]) => `<td>${safe(display(row, key))}</td>`).join('')}</tr>`).join('');
  const totalArea = rows.reduce((sum, row) => sum + Number(row.area_size || 0), 0);
  const html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="UTF-8"></head>
      <body>
        <h2>${officialTitle}</h2>
        <p>วันที่ส่งออก: ${today()}</p>
        <p>จำนวนสวนทั้งหมด: ${rows.length} รายการ | พื้นที่รวม: ${totalArea.toLocaleString('th-TH')} ไร่</p>
        <table border="1">
          <thead><tr>${th}</tr></thead>
          <tbody>${tr}</tbody>
        </table>
      </body>
    </html>`;
  downloadBlob(`coffee_loei_farms_${roleLabel}.xls`, html, 'application/vnd.ms-excel;charset=utf-8;');
}

export function printFarmsOfficial(rows, roleLabel = 'all') {
  const th = FARM_COLUMNS.map(([, label]) => `<th>${safe(label)}</th>`).join('');
  const tr = rows.map((row, index) => `<tr><td>${index + 1}</td>${FARM_COLUMNS.map(([key]) => `<td>${safe(display(row, key))}</td>`).join('')}</tr>`).join('');
  const totalArea = rows.reduce((sum, row) => sum + Number(row.area_size || 0), 0);
  const w = window.open('', '_blank');
  w.document.write(`<!doctype html><html lang="th"><head><meta charset="UTF-8"><title>${officialTitle}</title>
    <style>
      @page{size:A4 landscape;margin:12mm} body{font-family:Tahoma,sans-serif;color:#241b16} .head{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #7a4f38;padding-bottom:12px;margin-bottom:14px} h1{margin:0;color:#4b2f24;font-size:22px}.meta{font-size:13px;color:#6b564c;text-align:right}.summary{display:flex;gap:10px;margin:12px 0}.box{border:1px solid #d7c6bc;border-radius:10px;padding:10px 14px;background:#fff7f3}table{width:100%;border-collapse:collapse;font-size:11px}th{background:#fff1f6;color:#5b3428}th,td{border:1px solid #d7c6bc;padding:6px;vertical-align:top}.sign{display:grid;grid-template-columns:1fr 1fr;gap:28px;margin-top:28px}.line{border-top:1px solid #333;text-align:center;padding-top:8px;margin-top:48px}
    </style></head><body>
      <div class="head"><div><h1>${officialTitle}</h1><div>ระบบฐานข้อมูลพื้นที่ปลูกกาแฟจังหวัดเลย</div></div><div class="meta">ประเภทข้อมูล: ${safe(roleLabel)}<br>วันที่ส่งออก: ${today()}</div></div>
      <div class="summary"><div class="box"><b>จำนวนสวน</b><br>${rows.length} รายการ</div><div class="box"><b>พื้นที่รวม</b><br>${totalArea.toLocaleString('th-TH')} ไร่</div></div>
      <table><thead><tr><th>ลำดับ</th>${th}</tr></thead><tbody>${tr}</tbody></table>
      <div class="sign"><div class="line">ผู้จัดทำรายงาน</div><div class="line">ผู้ตรวจสอบข้อมูล</div></div>
      <script>window.onload=()=>window.print()</script>
    </body></html>`);
  w.document.close();
}
