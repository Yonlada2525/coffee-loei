import {
  ArrowUpRight,
  BarChart3,
  Coffee,
  Database,
  FileText,
  Gauge,
  Leaf,
  MapPin,
  Search,
  Settings,
  Sprout,
  TrendingUp,
  User,
  Users
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { number } from '../utils/format';

const cardPalette = [
  'from-[#dff7b5] to-[#eefbd7]',
  'from-[#93ddd0] to-[#d8f4ef]',
  'from-[#ffc1cd] to-[#ffe8ee]',
  'from-[#bfc8ff] to-[#edf0ff]'
];
const chartColors = ['#dff7b5', '#93ddd0', '#ffc1cd', '#bfc8ff', '#f2d1a8', '#7da88b'];

function DashboardLoading() {
  return (
    <main className="dashboard-shell py-7">
      <div className="dashboard-grid">
        <aside className="dashboard-sidebar skeleton-panel" />
        <section className="space-y-5">
          <div className="h-36 rounded-[32px] bg-white/60 animate-pulse" />
          <div className="grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-36 rounded-[30px] bg-white/60 animate-pulse" />)}
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="h-80 rounded-[30px] bg-white/60 animate-pulse" />
            <div className="h-80 rounded-[30px] bg-white/60 animate-pulse" />
          </div>
        </section>
      </div>
    </main>
  );
}

function MiniSidebar({ role }) {
  const links = role === 'admin'
    ? [
      ['/admin', 'ภาพรวมระบบ', Gauge],
      ['/admin/farms', 'สวนกาแฟ', Leaf],
      ['/admin/owners', 'เจ้าของสวน', Users],
      ['/admin/productions', 'ผลผลิต', BarChart3],
      ['/admin/media', 'รูปภาพ/สื่อ', FileText],
      ['/admin/profile', 'ตั้งค่าบัญชี', Settings]
    ]
    : [
      ['/owner', 'ภาพรวมของฉัน', Gauge],
      ['/owner/farms', 'สวนของฉัน', Leaf],
      ['/farms', 'ค้นหาสวน', Search],
      ['/owner/productions', 'ผลผลิต', BarChart3],
      ['/owner/media', 'รูปภาพ/สื่อ', FileText],
      ['/owner/profile', 'ตั้งค่าบัญชี', Settings]
    ];

  return (
    <aside className="dashboard-sidebar">
      <div className="mb-6 flex items-center gap-3 px-2">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#dff7b5] text-coffee shadow-sm">
          <Coffee size={22} />
        </span>
        <div>
          <b className="block text-coffee">Coffee Loei</b>
          <small className="text-muted">Management</small>
        </div>
      </div>

      <p className="mb-3 px-3 text-[11px] font-black uppercase tracking-[0.16em] text-muted">เมนูหลัก</p>
      <nav className="space-y-2">
        {links.map(([to, label, Icon], index) => (
          <Link key={to} to={to} className={`dash-side-link ${index === 0 ? 'active' : ''}`}>
            <Icon size={18} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      <div className="mt-8 rounded-[28px] bg-gradient-to-br from-[#fff3f6] to-[#f3fff7] p-5 shadow-sm">
        <p className="text-xs font-black text-brown">ระบบทางการ</p>
        <b className="mt-2 block text-lg leading-snug text-coffee">ฐานข้อมูลพื้นที่ปลูกกาแฟจังหวัดเลย</b>
        <p className="mt-2 text-xs leading-5 text-muted">รองรับข้อมูลสวน ผลผลิต แผนที่ และรายงานสถิติ</p>
      </div>
    </aside>
  );
}

function MetricCard({ item, index }) {
  const [label, value, unit, Icon, trend] = item;
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index }}
      className={`metric-card bg-gradient-to-br ${cardPalette[index % cardPalette.length]}`}
    >
      <div className="flex items-start justify-between">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/55 text-coffee"><Icon size={19} /></span>
        <span className="rounded-full bg-white/45 px-2 py-1 text-xs font-black text-coffee">•••</span>
      </div>
      <p className="mt-5 text-xs font-black text-muted">{label}</p>
      <div className="mt-1 flex items-end gap-2">
        <b className="text-3xl font-black tracking-tight text-coffee">{value}</b>
        <span className="pb-1 text-xs font-black text-muted">{unit}</span>
      </div>
      <p className="mt-2 flex items-center gap-1 text-xs font-extrabold text-[#38664a]"><TrendingUp size={14} /> {trend}</p>
    </motion.div>
  );
}

function ChartPanel({ title, children, right }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="dash-panel p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-lg font-black text-coffee">{title}</h3>
        {right || <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-black text-muted">รายงาน</span>}
      </div>
      {children}
    </motion.div>
  );
}

export default function Dashboard({ role }) {
  const { user } = useAuth();
  const [s, setS] = useState(null);

  useEffect(() => {
    let alive = true;
    async function load() {
      const data = await api(role === 'admin' ? '/reports/summary' : '/reports/owner-summary');
      if (alive) setS(data);
    }
    load().catch(console.error);
    return () => { alive = false; };
  }, [role]);

  const productionByFarm = useMemo(() => s?.byFarm || [], [s]);

  if (!s) return <DashboardLoading />;

  const stat = role === 'admin'
    ? [
      ['จำนวนสวนกาแฟ', Number(s.total_farms || 0).toLocaleString('th-TH'), 'แห่ง', Leaf, 'ข้อมูลรวมทุกสวน'],
      ['เจ้าของสวน', Number(s.total_owners || 0).toLocaleString('th-TH'), 'บัญชี', Users, 'บัญชีในระบบ'],
      ['พื้นที่รวม', number(s.total_area), 'ไร่', Sprout, 'พื้นที่ปลูกทั้งหมด'],
      ['ผลผลิตรวม', number(s.total_production), 'กก.', Coffee, 'ผลผลิตสะสม']
    ]
    : [
      ['สวนของฉัน', Number(s.total_farms || 0).toLocaleString('th-TH'), 'แห่ง', Leaf, 'จัดการเฉพาะของตนเอง'],
      ['พื้นที่รวม', number(s.total_area), 'ไร่', Sprout, 'พื้นที่สวนของฉัน'],
      ['ผลผลิตรวม', number(s.total_production), 'กก.', Coffee, 'ผลผลิตของฉัน'],
      ['พันธุ์กาแฟ', Number(s.total_coffee_types || 0).toLocaleString('th-TH'), 'รายการ', Database, 'รายการที่เกี่ยวข้อง']
    ];

  const quickActions = role === 'admin'
    ? [
      ['/admin/farms', 'จัดการสวนกาแฟ', 'เพิ่ม แก้ไข ลบ และจัดการพิกัดสวน'],
      ['/admin/owners', 'ตรวจสอบเจ้าของสวน', 'จัดการบัญชีและสถานะเจ้าของสวน'],
      ['/admin/productions', 'ข้อมูลผลผลิต', 'บันทึกและตรวจสอบผลผลิตทุกสวน']
    ]
    : [
      ['/owner/farms', 'สวนของฉัน', 'เพิ่ม แก้ไข และดูรายละเอียดสวน'],
      ['/owner/productions', 'ผลผลิตของฉัน', 'จัดการผลผลิตรายเดือน'],
      ['/farms', 'ค้นหาสวนทั้งหมด', 'ดูข้อมูลสวนกาแฟในจังหวัดเลย']
    ];

  const adminDistrictData = (s.byDistrict || []).map((x) => ({ ...x, total: Math.round(Number(x.total || 0)) }));
  const ownerMonthlyData = [
    { m: 'ม.ค.', v: Number(s.monthly?.jan || 0) },
    { m: 'ก.พ.', v: Number(s.monthly?.feb || 0) },
    { m: 'มี.ค.', v: Number(s.monthly?.mar || 0) }
  ];
  const pieData = role === 'admin'
    ? (s.byCoffee || []).map((x) => ({ name: x.coffee_name || 'ไม่ระบุ', value: Number(x.total || 0) }))
    : productionByFarm.map((x) => ({ name: x.farm_name || 'สวนกาแฟ', value: Number(x.total || 0) }));

  return (
    <main className="dashboard-shell py-7">
      <div className="dashboard-grid">
        <MiniSidebar role={role} />

        <section className="min-w-0">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-black text-brown">{role === 'admin' ? 'ผู้ดูแลระบบ' : 'เจ้าของสวนกาแฟ'}</p>
              <h1 className="text-3xl font-black tracking-tight text-coffee md:text-4xl">ยินดีต้อนรับ {user?.fullname || 'ผู้ใช้งาน'}</h1>
              <p className="mt-1 text-muted">ภาพรวมข้อมูลสวนกาแฟ ผลผลิต และรายงานเชิงสถิติของระบบ</p>
            </div>

            {/* <div className="dash-search">
              <Search size={17} className="text-muted" />
              <span className="text-sm font-semibold text-muted">ค้นหาข้อมูลสวน / ผลผลิต / รายงาน</span>
              <span className="ml-auto rounded-full bg-white px-2 py-1 text-xs font-black text-brown">⌘</span>
            </div> */}
            
          </div>

          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="official-dashboard-hero mb-5">
            <div>
              <span className="rounded-full bg-white/60 px-3 py-1 text-xs font-black text-brown">Coffee Plantation Database</span>
              <h2 className="mt-3 text-2xl font-black text-coffee md:text-3xl">
                ระบบบริหารจัดการข้อมูลพื้นที่ปลูกกาแฟจังหวัดเลย
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
                สรุปข้อมูลสำคัญสำหรับการติดตามสวนกาแฟ เจ้าของสวน ผลผลิต และข้อมูลแผนที่ เพื่อสนับสนุนการวิเคราะห์และจัดทำรายงานอย่างเป็นระบบ
              </p>
            </div>
            <div className="hidden rounded-[30px] bg-white/55 p-5 text-right shadow-sm lg:block">
              <p className="text-xs font-black text-muted">สถานะข้อมูล</p>
              <b className="block text-3xl text-coffee">พร้อมใช้งาน</b>
              <small className="font-bold text-brown">อัปเดตจากฐานข้อมูล</small>
            </div>
          </motion.section>

          <section className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stat.map((item, index) => <MetricCard key={item[0]} item={item} index={index} />)}
          </section>

          <section className="mb-5 grid gap-5 xl:grid-cols-[1fr_1.15fr]">
            <ChartPanel title={role === 'admin' ? 'สัดส่วนผลผลิตตามพันธุ์กาแฟ' : 'สัดส่วนผลผลิตตามสวน'}>
              <div className="grid items-center gap-4 md:grid-cols-[220px_1fr]">
                <div className="relative h-[260px] min-w-0" style={{ width: '100%' }}>
                  <ResponsiveContainer width="100%" height={240} minWidth={0}>
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={62} outerRadius={100} paddingAngle={4}>
                        {pieData.map((_, i) => <Cell key={i} fill={chartColors[i % chartColors.length]} />)}
                      </Pie>
                      <Tooltip formatter={(value) => [`${number(value)} กก.`, 'ผลผลิต']} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
                    <div>
                      <p className="text-xs font-black text-muted">รวม</p>
                      <b className="text-2xl text-coffee">{number(s.total_production)}</b>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  {pieData.slice(0, 6).map((row, i) => (
                    <div key={`${row.name}-${i}`} className="flex items-center justify-between rounded-2xl bg-white/60 px-4 py-3">
                      <span className="flex items-center gap-2 text-sm font-extrabold text-coffee"><i className="h-3 w-3 rounded-full" style={{ background: chartColors[i % chartColors.length] }} />{row.name}</span>
                      <b className="text-sm text-brown">{number(row.value)} กก.</b>
                    </div>
                  ))}
                </div>
              </div>
            </ChartPanel>

            <ChartPanel title={role === 'admin' ? 'จำนวนสวนกาแฟตามอำเภอ' : 'ผลผลิตรายเดือน'} right={<Link to={role === 'admin' ? '/admin/productions' : '/owner/productions'} className="btn btn-ghost py-2 text-xs">ดูทั้งหมด <ArrowUpRight size={14} /></Link>}>
              <div className="h-[320px] min-w-0" style={{ width: '100%' }}>
                <ResponsiveContainer width="100%" height={300} minWidth={0}>
                <BarChart data={role === 'admin' ? adminDistrictData : ownerMonthlyData} barSize={34}>
                  <XAxis dataKey={role === 'admin' ? 'district' : 'm'} tick={{ fontSize: 12 }} interval={0} angle={role === 'admin' ? -18 : 0} textAnchor={role === 'admin' ? 'end' : 'middle'} height={role === 'admin' ? 72 : 34} />
                  <YAxis allowDecimals={role !== 'admin'} tickFormatter={(v) => role === 'admin' ? Math.round(v) : number(v)} />
                  <Tooltip formatter={(value) => role === 'admin' ? [`${Math.round(value)} แห่ง`, 'จำนวนสวน'] : [`${number(value)} กก.`, 'ผลผลิต']} />
                  <Bar dataKey={role === 'admin' ? 'total' : 'v'} radius={[18, 18, 18, 18]} fill="#93ddd0" />
                </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartPanel>
          </section>

          <section className="grid gap-5 xl:grid-cols-[1fr_360px]">
            <ChartPanel title="รายการดำเนินงานสำคัญ" right={<span className="chip">Quick Actions</span>}>
              <div className="grid gap-3 md:grid-cols-3">
                {quickActions.map(([to, title, desc]) => (
                  <Link key={to} to={to} className="rounded-[26px] bg-white/65 p-4 transition hover:-translate-y-1 hover:shadow-soft">
                    <b className="text-coffee">{title}</b>
                    <p className="mt-2 text-xs leading-5 text-muted">{desc}</p>
                    <span className="mt-4 inline-flex items-center gap-1 text-xs font-black text-brown">เปิดเมนู <ArrowUpRight size={14} /></span>
                  </Link>
                ))}
              </div>
              <div className="mt-5 overflow-hidden rounded-[24px] border border-[rgba(122,79,56,.12)] bg-white/50">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th>{role === 'admin' ? 'อำเภอ / รายการ' : 'สวนกาแฟ'}</th>
                      <th>{role === 'admin' ? 'จำนวนสวน' : 'ผลผลิตรวม'}</th>
                      <th>สถานะ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(role === 'admin' ? adminDistrictData : productionByFarm).slice(0, 5).map((row, i) => (
                      <tr key={i}>
                        <td><b>{role === 'admin' ? row.district : row.farm_name}</b></td>
                        <td>{role === 'admin' ? `${Math.round(row.total || 0)} แห่ง` : `${number(row.total)} กก.`}</td>
                        <td><span className="chip">ใช้งาน</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ChartPanel>

            <aside className="dash-panel p-5">
              <div className="rounded-[28px] bg-gradient-to-br from-[#4b2f24] to-[#7a4f38] p-5 text-white shadow-soft">
                <MapPin className="mb-8" />
                <p className="text-sm font-semibold text-white/75">แผนที่สวนกาแฟ</p>
                <b className="mt-1 block text-2xl">ข้อมูลพิกัดพร้อมตรวจสอบ</b>
                <Link to="/map" className="mt-5 inline-flex rounded-full bg-white px-4 py-2 text-sm font-black text-coffee">เปิดแผนที่</Link>
              </div>
              <div className="mt-4 space-y-3">
                <div className="rounded-[24px] bg-[#fff4f7] p-4">
                  <p className="text-xs font-black text-muted">รายงานทางการ</p>
                  <b className="text-coffee">ส่งออก CSV / Excel / PDF</b>
                </div>
                <div className="rounded-[24px] bg-[#f3fff7] p-4">
                  <p className="text-xs font-black text-muted">การควบคุมสิทธิ์</p>
                  <b className="text-coffee">Admin / Owner / Public</b>
                </div>
              </div>
            </aside>
          </section>
        </section>
      </div>
    </main>
  );
}
