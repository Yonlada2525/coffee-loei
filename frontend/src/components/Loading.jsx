export default function Loading({ text = 'กำลังโหลดข้อมูล...' }) {
  return (
    <main className="shell py-8">
      <div className="card p-8 text-center font-bold text-brown">{text}</div>
    </main>
  );
}
