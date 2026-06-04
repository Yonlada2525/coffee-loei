export function safe(value) {
  return value === null || value === undefined || value === '' ? '-' : String(value);
}

export function csvCell(value) {
  return `"${safe(value).replaceAll('"', '""')}"`;
}

export function downloadTextFile(filename, content, type = 'text/plain;charset=utf-8') {
  const blob = new Blob(['\ufeff' + content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function exportCsv(filename, headers, rows) {
  const lines = [headers, ...rows].map((row) => row.map(csvCell).join(','));
  downloadTextFile(`${filename}.csv`, lines.join('\n'), 'text/csv;charset=utf-8');
}

export function exportExcel(filename, headers, rows, title = 'รายงานข้อมูล') {
  const table = `
    <html><head><meta charset="utf-8"></head><body>
      <h2>${title}</h2>
      <table border="1">
        <thead><tr>${headers.map((h) => `<th>${safe(h)}</th>`).join('')}</tr></thead>
        <tbody>${rows.map((row) => `<tr>${row.map((v) => `<td>${safe(v)}</td>`).join('')}</tr>`).join('')}</tbody>
      </table>
    </body></html>`;
  downloadTextFile(`${filename}.xls`, table, 'application/vnd.ms-excel;charset=utf-8');
}

export function printOfficialReport(title, headers, rows, scope = 'ระบบฐานข้อมูลพื้นที่ปลูกกาแฟจังหวัดเลย') {
  const html = `<!doctype html>
  <html lang="th">
  <head>
    <meta charset="utf-8" />
    <title>${title}</title>
    <style>
      body{font-family:Tahoma,Arial,sans-serif;padding:32px;color:#211914;background:white;}
      .head{display:flex;justify-content:space-between;gap:24px;align-items:flex-start;border-bottom:3px solid #7a4f38;padding-bottom:18px;margin-bottom:20px;}
      h1{font-size:24px;color:#4b2f24;margin:0 0 6px;font-weight:800;}
      .meta{font-size:13px;color:#6c5b52;line-height:1.7;}
      .badge{border:1px solid #d8c6bd;border-radius:14px;padding:10px 14px;color:#4b2f24;background:#fff8f2;font-weight:700;white-space:nowrap;}
      table{width:100%;border-collapse:collapse;font-size:12px;margin-top:12px;}
      th,td{border:1px solid #d8c6bd;padding:8px;text-align:left;vertical-align:top;}
      th{background:#fff1f6;color:#4b2f24;font-weight:800;}
      tr:nth-child(even) td{background:#fffaf7;}
      .footer{margin-top:44px;display:flex;justify-content:flex-end;}
      .sign{text-align:center;line-height:2.1;min-width:260px;}
      @media print{@page{size:A4 landscape;margin:14mm} body{padding:0}.no-print{display:none}}
    </style>
  </head>
  <body>
    <div class="head">
      <div>
        <h1>${title}</h1>
        <div class="meta">${scope}<br/>วันที่ออกรายงาน: ${new Date().toLocaleDateString('th-TH')} เวลา ${new Date().toLocaleTimeString('th-TH')}<br/>จำนวนข้อมูล: ${rows.length} รายการ</div>
      </div>
      <div class="badge">Coffee Loei DB</div>
    </div>
    <table>
      <thead><tr>${headers.map((h) => `<th>${safe(h)}</th>`).join('')}</tr></thead>
      <tbody>${rows.map((row) => `<tr>${row.map((v) => `<td>${safe(v)}</td>`).join('')}</tr>`).join('')}</tbody>
    </table>
    <div class="footer"><div class="sign">ลงชื่อ........................................<br/>ผู้จัดทำรายงาน</div></div>
    <script>window.onload=()=>window.print()</script>
  </body></html>`;
  const w = window.open('', '_blank');
  w.document.write(html);
  w.document.close();
}

export function exportBundle(baseName, title, headers, rows) {
  exportCsv(baseName, headers, rows);
  exportExcel(baseName, headers, rows, title);
}
