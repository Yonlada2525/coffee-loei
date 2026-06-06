// แสดงจำนวนวันที่เหลือในการกู้คืนสวน ถ้าสวนถูกลบแล้ว

export default function RestoreCountdown({ days }) {
  if (days === null || days === undefined || Number.isNaN(Number(days))) return null;
  const value = Math.max(0, Number(days));
  return (
    <span className={`chip ${value <= 3 ? 'bg-red-50 text-red-700' : ''}`}>
      เหลือ {value} วันในการกู้คืน
    </span>
  );
}
