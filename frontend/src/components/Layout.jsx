import {
  BarChart3,
  ChevronDown,
  Coffee,
  Database,
  FileText,
  Home,
  Leaf,
  LogOut,
  Mail,
  Map,
  Menu,
  Phone,
  Settings,
  ShieldCheck,
  User,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function navClass({ isActive }) {
  return `nav-link ${isActive ? "nav-link-active" : ""}`;
}

function Dropdown({ label, icon: Icon, items, onClick }) {
  const [openDropdown, setOpenDropdown] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        className="nav-link"
        onClick={() => setOpenDropdown(!openDropdown)}
      >
        <Icon size={17} />
        <span>{label}</span>

        <ChevronDown
          size={15}
          className={`transition duration-300 ${
            openDropdown ? 'rotate-180' : ''
          }`}
        />
      </button>

      <div
        className={`absolute right-0 top-full z-50 mt-3 w-72 rounded-[24px] border border-white/80 bg-white/95 p-2 shadow-soft backdrop-blur-xl transition duration-200 ${
          openDropdown
            ? 'visible translate-y-0 opacity-100'
            : 'invisible translate-y-2 opacity-0'
        }`}
      >
        {items.map(([to, text, desc, ItemIcon]) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => {
              setOpenDropdown(false);
              onClick?.();
            }}
            className="menu-card"
          >
            <span className="menu-card-icon">
              <ItemIcon size={18} />
            </span>

            <span>
              <b className="block text-sm text-coffee">{text}</b>
              <small className="text-xs leading-5 text-muted">{desc}</small>
            </span>
          </NavLink>
        ))}
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="site-footer mt-12">
      <div className="shell py-10">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-rose to-mint shadow-soft">
                <Coffee className="text-coffee" />
              </div>
              <div>
                <h2 className="text-xl font-black text-coffee">
                  Coffee Loei DB
                </h2>
                <p className="text-sm font-bold text-brown">
                  ระบบฐานข้อมูลพื้นที่ปลูกกาแฟจังหวัดเลย
                </p>
              </div>
            </div>
            <p className="mt-4 max-w-xl leading-7 text-muted">
              ระบบสารสนเทศเพื่อรวบรวม วิเคราะห์
              และแสดงผลข้อมูลพื้นที่ปลูกกาแฟของจังหวัดเลย สำหรับผู้ดูแลระบบ
              เจ้าของสวน และผู้ใช้งานทั่วไป
            </p>
          </div>

          <div>
            <h3 className="footer-title">เมนูหลัก</h3>
            <div className="footer-links">
              <Link to="/">หน้าหลัก</Link>
              <Link to="/farms">ข้อมูลสวนกาแฟ</Link>
              <Link to="/map">แผนที่สวนกาแฟ</Link>
              <Link to="/register">ลงทะเบียนเจ้าของสวน</Link>
            </div>
          </div>

          <div>
            <h3 className="footer-title">การใช้งานระบบ</h3>
            <div className="footer-links">
              <span>
                <ShieldCheck size={15} /> ข้อมูลพื้นที่ปลูกกาแฟ
              </span>
              <span>
                <Database size={15} /> จัดเก็บข้อมูลด้วย MySQL
              </span>
              <span>
                <BarChart3 size={15} /> รายงานและสถิติ
              </span>
              <span>
                <Map size={15} /> แผนที่ตำแหน่งสวน
              </span>
            </div>
          </div>

          <div>
            <h3 className="footer-title">ติดต่อหน่วยงาน</h3>
            <div className="footer-links">
              <span>
                <Phone size={15} /> 0123456789
              </span>
              <span>
                <Mail size={15} /> loei-coffee-database@example.com
              </span>
              <span>จังหวัดเลย ประเทศไทย</span>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col justify-between gap-3 border-t border-[rgba(122,79,56,.12)] pt-5 text-sm text-muted md:flex-row">
          <span>
            © Coffee Loei DB — Academic / Government Information System
          </span>
          {/* <span>React · Node.js · MySQL · Tailwind CSS</span> */}
        </div>
      </div>
    </footer>
  );
}

export default function Layout() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { session, user, role, logout } = useAuth();

  useEffect(() => {
    const closeMenu = () => setOpen(false);
    window.addEventListener("coffee:unauthorized", closeMenu);
    return () => window.removeEventListener("coffee:unauthorized", closeMenu);
  }, []);

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate("/", { replace: true });
  };

  const menus = useMemo(() => {
    const adminManage = [
      [
        "/admin/owners",
        "เจ้าของสวน",
        "ตรวจสอบ เพิ่ม แก้ไข และลบข้อมูลเจ้าของสวน",
        User,
      ],
      ["/admin/farms", "สวนกาแฟ", "จัดการข้อมูลสวนกาแฟและพิกัดบนแผนที่", Leaf],
      [
        "/admin/coffee-types",
        "พันธุ์กาแฟ",
        "จัดการพันธุ์กาแฟและวิธีแปรรูป",
        Coffee,
      ],
      ["/admin/farm-types", "ประเภทสวน", "จัดการประเภทสวนกาแฟ", Settings],
      [
        "/admin/soil-types",
        "ประเภทดิน",
        "จัดการประเภทดินที่ใช้ปลูกกาแฟ",
        Settings,
      ],
      [
        "/admin/media",
        "รูปภาพ/สื่อ",
        "อัปโหลดและจัดการสื่อประกอบสวน",
        FileText,
      ],
    ];
    const ownerManage = [
      ["/owner/profile", "บัญชีของฉัน", "แก้ไขข้อมูลบัญชีพื้นฐาน", User],
      ["/owner/farms", "สวนของฉัน", "เพิ่ม แก้ไข ลบ และดูรายละเอียดสวน", Leaf],
      ["/owner/media", "รูปภาพ/สื่อ", "อัปโหลดรูปประกอบสวนกาแฟ", FileText],
    ];

    if (role === "admin") {
      return {
        homePath: "/admin",
        desktop: (
          <>
            <NavLink to="/admin" end className={navClass}>
              <BarChart3 size={17} />
              แดชบอร์ด
            </NavLink>
            <Dropdown
              label="จัดการข้อมูล"
              icon={Database}
              items={adminManage}
            />
            <Dropdown
              label="รายงาน"
              icon={FileText}
              items={[
                [
                  "/admin/productions",
                  "ผลผลิต",
                  "จัดการข้อมูลผลผลิตทุกสวน",
                  BarChart3,
                ],
                [
                  "/admin/trash",
                  "ข้อมูลที่ลบ",
                  "ตรวจสอบและกู้คืนข้อมูลที่ลบแล้ว",
                  FileText,
                ],
                ["/map", "แผนที่", "ดูตำแหน่งสวนกาแฟทั้งหมด", Map],
                ["/farms", "ค้นหาสวน", "ค้นหาและดูข้อมูลสวนแบบสาธารณะ", Leaf],
              ]}
            />
            <NavLink to="/admin/profile" className={navClass}>
              <User size={17} />
              บัญชี
            </NavLink>
          </>
        ),
        mobile: [
          ["/admin", "แดชบอร์ด", BarChart3],
          ...adminManage.map(([a, b, , d]) => [a, b, d]),
          ["/admin/productions", "ผลผลิต", BarChart3],
          ["/admin/trash", "ข้อมูลที่ลบ", FileText],
          ["/map", "แผนที่", Map],
          ["/farms", "ค้นหาสวน", Leaf],
          ["/admin/profile", "บัญชี", User],
        ],
      };
    }
    if (role === "owner") {
      return {
        homePath: "/owner",
        desktop: (
          <>
            <NavLink to="/owner" end className={navClass}>
              <BarChart3 size={17} />
              แดชบอร์ด
            </NavLink>
            <Dropdown label="จัดการสวน" icon={Leaf} items={ownerManage} />
            <NavLink to="/owner/productions" className={navClass}>
              <BarChart3 size={17} />
              ผลผลิต
            </NavLink>
            <Dropdown
              label="ข้อมูลเพิ่มเติม"
              icon={FileText}
              items={[
                ["/farms", "ค้นหาสวน", "ดูข้อมูลสวนกาแฟทั้งหมดในระบบ", Leaf],
                ["/map", "แผนที่", "ดูตำแหน่งสวนกาแฟบนแผนที่", Map],
                [
                  "/owner/trash",
                  "ข้อมูลที่ลบ",
                  "ตรวจสอบและกู้คืนข้อมูลที่ลบแล้ว",
                  FileText,
                ],
              ]}
            />
          </>
        ),
        mobile: [
          ["/owner", "แดชบอร์ด", BarChart3],
          ...ownerManage.map(([a, b, , d]) => [a, b, d]),
          ["/owner/productions", "ผลผลิต", BarChart3],
          ["/farms", "ค้นหาสวน", Leaf],
          ["/map", "แผนที่", Map],
          ["/owner/trash", "ข้อมูลที่ลบ", FileText],
        ],
      };
    }
    return {
      homePath: "/",
      desktop: (
        <>
          <NavLink to="/" end className={navClass}>
            <Home size={17} />
            หน้าหลัก
          </NavLink>
          <NavLink to="/farms" className={navClass}>
            <Leaf size={17} />
            ข้อมูลสวน
          </NavLink>
          <NavLink to="/map" className={navClass}>
            <Map size={17} />
            แผนที่
          </NavLink>
          <NavLink to="/register" className={navClass}>
            <User size={17} />
            ลงทะเบียน
          </NavLink>
          <NavLink to="/login" className="btn btn-primary py-2">
            <User size={17} />
            เข้าสู่ระบบ
          </NavLink>
        </>
      ),
      mobile: [
        ["/", "หน้าหลัก", Home],
        ["/farms", "ข้อมูลสวน", Leaf],
        ["/map", "แผนที่", Map],
        ["/register", "ลงทะเบียน", User],
        ["/login", "เข้าสู่ระบบ", User],
      ],
    };
  }, [role]);

  return (
    <div className="site-page">
      <header className="glass sticky top-0 z-50">
        <div className="shell flex items-center justify-between py-3">
          <Link to={menus.homePath} className="flex min-w-0 items-center gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-rose to-mint shadow-soft">
              <Coffee className="text-coffee" />
            </div>
            <div className="min-w-0">
              <div className="truncate text-xl font-black leading-tight text-coffee">
                Coffee Loei DB
              </div>
              <div className="hidden text-xs font-bold text-brown sm:block">
                ระบบฐานข้อมูลพื้นที่ปลูกกาแฟจังหวัดเลย
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 lg:flex">
            {menus.desktop}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            {session && (
              <span className="user-badge max-w-[190px] truncate">
                <User size={15} />
                {user?.fullname || user?.username}
              </span>
            )}
            {session && (
              <button className="btn btn-ghost py-2" onClick={handleLogout}>
                <LogOut size={17} />
                ออกจากระบบ
              </button>
            )}
          </div>

          <button
            className="btn btn-ghost lg:hidden"
            onClick={() => setOpen(!open)}
            aria-label="เมนู"
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>

        {open && (
          <div className="border-t border-[rgba(122,79,56,.12)] bg-cream/95 px-4 pb-4 lg:hidden">
            <nav className="mx-auto grid max-w-7xl gap-2 pt-3">
              {menus.mobile.map(([to, label, Icon]) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === "/" || to === "/admin" || to === "/owner"}
                  onClick={() => setOpen(false)}
                  className={navClass}
                >
                  <Icon size={18} />
                  {label}
                </NavLink>
              ))}
              {session && (
                <button className="btn btn-ghost mt-2" onClick={handleLogout}>
                  <LogOut size={18} />
                  ออกจากระบบ
                </button>
              )}
            </nav>
          </div>
        )}
      </header>

      <div className="page-content">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}
