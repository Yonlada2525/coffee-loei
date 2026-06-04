import { Link } from 'react-router-dom';
import { getSession } from '../utils/api';
import { BarChart3, Coffee, Image, Leaf, MapPinned, Sprout, Trash2, UserRoundCog, Wheat } from 'lucide-react';

const cardClass = 'card p-6 hover:-translate-y-1 hover:shadow-xl transition group';

function Card({to, icon:Icon, title, desc, badge}){
  return <Link to={to} className={cardClass}>
    <div className="flex items-start justify-between gap-4">
      <div className="grid h-14 w-14 place-items-center rounded-3xl bg-gradient-to-br from-rose to-mint text-coffee shadow-soft group-hover:scale-105 transition"><Icon size={26}/></div>
      {badge && <span className="chip">{badge}</span>}
    </div>
    <h3 className="mt-5 text-2xl font-black text-coffee">{title}</h3>
    <p className="mt-2 leading-7 text-[#786a62]">{desc}</p>
  </Link>
}

export default function ManagePage(){
  const role = getSession()?.user?.role;
  const isAdmin = role === 'admin';
  const title = isAdmin ? 'จัดการข้อมูลผู้ดูแลระบบ' : 'จัดการข้อมูลเจ้าของสวน';
  const desc = isAdmin
    ? 'รวมเมนูเพิ่ม แก้ไข ลบ กู้คืน และตรวจสอบข้อมูลหลักของระบบฐานข้อมูลพื้นที่ปลูกกาแฟจังหวัดเลย'
    : 'รวมเมนูจัดการสวนของฉัน ผลผลิต รูปภาพประกอบ และข้อมูลที่ลบไปแล้ว';

  return <main className="shell py-8">
    <section className="hero p-7 md:p-10 relative overflow-hidden">
      <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/35 blur-2xl" />
      <span className="chip">Management Center</span>
      <h1 className="mt-4 text-4xl md:text-5xl font-black text-coffee">{title}</h1>
      <p className="mt-3 max-w-3xl text-[#786a62] leading-8">{desc}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link to={isAdmin?'/admin':'/owner'} className="btn btn-primary w-auto"><BarChart3 size={18}/> แดชบอร์ด</Link>
        <Link to="/trash" className="btn btn-ghost w-auto"><Trash2 size={18}/> ดูข้อมูลที่ลบ</Link>
      </div>
    </section>

    <section className="grid md:grid-cols-2 xl:grid-cols-3 gap-5 mt-8">
      {isAdmin && <Card to="/admin/owners" icon={UserRoundCog} title="เจ้าของสวน" desc="เพิ่ม แก้ไข ลบ ตรวจสอบสถานะเจ้าของสวน และกู้คืนข้อมูลที่ลบ" badge="Admin" />}
      <Card to={isAdmin?'/admin/farms':'/owner/farms'} icon={Leaf} title={isAdmin?'สวนกาแฟทั้งหมด':'สวนกาแฟของฉัน'} desc="จัดการข้อมูลสวน พิกัด พื้นที่ ระบบน้ำ ประเภทดิน และข้อมูลที่ตั้งแบบเลือกอำเภอ/ตำบล/รหัสไปรษณีย์" />
      {isAdmin && <Card to="/admin/coffee-types" icon={Coffee} title="พันธุ์กาแฟ" desc="จัดการพันธุ์กาแฟ กระบวนการแปรรูป และรายละเอียดของแต่ละพันธุ์" />}
      {isAdmin && <Card to="/admin/farm-types" icon={Sprout} title="ประเภทสวนกาแฟ" desc="เพิ่ม แก้ไข ลบ และกู้คืนประเภทสวนกาแฟ เช่น สวนเดี่ยว สวนผสม หรือแปลงทดลอง" />}
      {isAdmin && <Card to="/admin/soil-types" icon={Wheat} title="ประเภทดิน" desc="จัดการประเภทดินที่ใช้ปลูกกาแฟ เช่น ดินร่วน ดินร่วนปนทราย และดินภูเขา" />}
      <Card to={isAdmin?'/admin/productions':'/owner/productions'} icon={BarChart3} title="ผลผลิต" desc="เพิ่ม แก้ไข ลบ กู้คืนข้อมูลผลผลิต และส่งออกตารางรายงานเป็นภาพ PNG" />
      <Card to={isAdmin?'/admin/media':'/owner/media'} icon={Image} title="รูปภาพสวน" desc="อัปโหลดรูปภาพประกอบสวนกาแฟ ดูรายการรูป และกู้คืนรูปภาพที่ลบไปแล้ว" />
      <Card to="/map" icon={MapPinned} title="แผนที่สวนกาแฟ" desc="ดูตำแหน่งสวนกาแฟบนแผนที่ พร้อม popup รายละเอียดและรูปภาพสวน" />
      <Card to="/trash" icon={Trash2} title="ถังข้อมูลที่ลบ" desc="รวมทางลัดไปยังข้อมูลที่ถูกลบแบบ Soft Delete และสามารถกู้คืนจากหน้าจัดการแต่ละประเภท" />
    </section>
  </main>
}
