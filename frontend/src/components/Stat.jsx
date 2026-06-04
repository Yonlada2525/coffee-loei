export default function Stat({ label, value, icon }) {
  return (
    <div className="stat">
      <span className="text-sm text-[#786a62] font-bold">
        {label}
      </span>

      <b>{value}</b>

      <div className="text-3xl opacity-40">
        {icon}
      </div>
    </div>
  );
}