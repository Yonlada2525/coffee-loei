import { motion } from 'framer-motion';
import { BarChart3, Coffee, Database, FileText, Leaf, MapPin, Search, ShieldCheck, Sprout, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  const services = [
    ['ฐานข้อมูลกลาง', 'จัดเก็บข้อมูลเจ้าของสวน สวนกาแฟ พันธุ์กาแฟ ประเภทดิน และผลผลิตในระบบเดียว', Database],
    ['ค้นหาและแผนที่', 'ประชาชนสามารถค้นหาสวนและดูตำแหน่งบนแผนที่ได้อย่างสะดวก', MapPin],
    ['รายงานสถิติ', 'ผู้มีสิทธิ์สามารถดูกราฟ สรุปผลผลิต และส่งออกข้อมูลเป็นไฟล์ทางการ', BarChart3]
  ];

  const layers = [
    ['01', 'ผู้ใช้งานทั่วไป', 'ดูข้อมูลสวน ค้นหา และลงทะเบียนเจ้าของสวน'],
    ['02', 'เจ้าของสวนกาแฟ', 'จัดการข้อมูลสวน รูปภาพ และผลผลิตของตนเอง'],
    ['03', 'ผู้ดูแลระบบ', 'ตรวจสอบ จัดการข้อมูลทั้งหมด และจัดทำรายงานสถิติ']
  ];

  return (
    <main>
      <section className="shell py-8 md:py-12">
        <div className="official-landing relative overflow-hidden rounded-[42px] p-6 md:p-10 lg:p-12">
          <div className="hero-orb orb-rose" />
          <div className="hero-orb orb-mint" />

          <div className="relative z-10 grid gap-10 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
            <div>
              <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 rounded-full bg-white/75 px-4 py-2 text-sm font-extrabold text-brown shadow-sm">
                <Coffee size={17} /> ระบบสารสนเทศด้านกาแฟจังหวัดเลย
              </motion.div>

              <motion.h1 initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .08 }} className="mt-5 max-w-4xl text-4xl font-black leading-tight text-coffee md:text-6xl">
                ระบบฐานข้อมูลพื้นที่ปลูกกาแฟจังหวัดเลย สวัสดีครับ
              </motion.h1>

              <motion.p initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .16 }} className="mt-5 max-w-3xl text-lg leading-8 text-muted">
                เว็บแอปพลิเคชันสำหรับรวบรวม จัดเก็บ ค้นหา และวิเคราะห์ข้อมูลผู้ปลูกกาแฟในจังหวัดเลย
                รองรับการใช้งานของประชาชน เจ้าของสวน และผู้ดูแลระบบอย่างเป็นลำดับชั้น
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .24 }} className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link className="btn btn-primary" to="/farms"><Search size={18} /> ค้นหาข้อมูลสวน</Link>
                <Link className="btn btn-rose" to="/map"><MapPin size={18} /> ดูแผนที่สวนกาแฟ</Link>
                <Link className="btn btn-ghost" to="/register"><Users size={18} /> ลงทะเบียนเจ้าของสวน</Link>
              </motion.div>
            </div>

            <motion.div initial={{ opacity: 0, scale: .95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .7 }} className="relative">
              <div className="garden-frame">
                <img src="/assets/images/farm-1.svg" className="h-full w-full rounded-[34px] object-cover" alt="สวนกาแฟจังหวัดเลย" />
              </div>
              <motion.div animate={{ y: [0, -12, 0] }} transition={{ repeat: Infinity, duration: 5 }} className="layer-badge left-0 top-6">
                <Sprout className="text-sage" />
                <span><b>14 อำเภอ</b><small>พื้นที่ข้อมูลจังหวัดเลย</small></span>
              </motion.div>
              <motion.div animate={{ y: [0, 12, 0] }} transition={{ repeat: Infinity, duration: 6 }} className="layer-badge bottom-7 right-0">
                <ShieldCheck className="text-brown" />
                <span><b>3 บทบาท</b><small>Public · Owner · Admin</small></span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="shell section-layer py-5 md:py-8">
        <div className="section-heading">
          <span className="chip"><Leaf size={15} /> บริการของระบบ</span>
          <h2>ฟังก์ชันหลักที่รองรับการบริหารจัดการข้อมูลกาแฟ</h2>
          <p>จัดวางข้อมูลเป็นหมวดหมู่ชัดเจน ใช้งานง่าย และรองรับการต่อยอดในอนาคต</p>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {services.map(([title, desc, Icon], index) => (
            <motion.article key={title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * .1 }} viewport={{ once: true }} className="service-card">
              <div className="service-icon"><Icon /></div>
              <h3>{title}</h3>
              <p>{desc}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="shell py-6 md:py-10">
        <div className="content-band grid gap-7 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
          <div>
            <span className="chip"><FileText size={15} /> โครงสร้างการใช้งาน</span>
            <h2 className="mt-4 text-3xl font-black leading-tight text-coffee md:text-4xl">แบ่งเลเยอร์การใช้งานอย่างชัดเจน</h2>
            <p className="mt-3 leading-8 text-muted">
              ระบบถูกออกแบบให้แยกสิทธิ์การเข้าถึงข้อมูลตามบทบาท ลดความซับซ้อนของเมนู
              และทำให้การทำงานของผู้ใช้แต่ละกลุ่มเป็นระเบียบเหมาะกับเว็บทางการ
            </p>
          </div>

          <div className="grid gap-4">
            {layers.map(([no, title, desc]) => (
              <div key={no} className="layer-row">
                <span>{no}</span>
                <div>
                  <b>{title}</b>
                  <p>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="shell py-6 md:py-12">
        <div className="cta-panel">
          <div>
            <span className="chip"><Coffee size={15} /> Coffee Loei DB</span>
            <h2 className="mt-4 text-3xl font-black text-coffee">เริ่มต้นใช้งานระบบฐานข้อมูลสวนกาแฟ</h2>
            <p className="mt-2 leading-7 text-muted">ค้นหาข้อมูลสวนกาแฟ หรือเข้าสู่ระบบเพื่อจัดการข้อมูลตามสิทธิ์ผู้ใช้งาน</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
            <Link className="btn btn-primary" to="/farms">ดูข้อมูลสวน</Link>
            <Link className="btn btn-ghost" to="/login">เข้าสู่ระบบ</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
