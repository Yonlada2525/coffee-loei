
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PasswordInput from "../components/PasswordInput";
import SmartLocationFields from "../components/SmartLocationFields";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";

export default function Register() {
  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    fullname: "",
    phone: "",
    email: "",
    district: "",
    sub_district: "",
    village: "",
    postal_code: "",
    house_no: "",
  });
  const nav = useNavigate();
  const { session } = useAuth();

  useEffect(() => {
    if (session?.user?.role === "admin") nav("/admin", { replace: true });
    if (session?.user?.role === "owner") nav("/owner", { replace: true });
  }, [nav, session]);

  async function submit(e) {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      alert("รหัสผ่านไม่ตรงกัน");
      return;
    }
    const address = `${form.house_no || ""} ${form.village || ""} ต.${form.sub_district || ""} อ.${form.district || ""} จ.เลย ${form.postal_code || ""}`;
    await api("/auth/register", { 
      method: "POST", 
      body: { ...form, address } 
    });
    alert("สมัครสมาชิกสำเร็จ กรุณารอผู้ดูแลระบบตรวจสอบบัญชี");
    nav("/login");
  }

  function getPasswordStrength(password) {
  let score = 0;

  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) {
    return {
      text: "อ่อน",
      color: "bg-red-500",
      width: "33%",
      textColor: "text-red-500",
    };
  }

  if (score <= 4) {
    return {
      text: "ปานกลาง",
      color: "bg-yellow-500",
      width: "66%",
      textColor: "text-yellow-600",
    };
  }

  return {
    text: "แข็งแรงมาก",
    color: "bg-green-600",
    width: "100%",
    textColor: "text-green-600",
  };
}

const strength = getPasswordStrength(form.password);

  return (
    <main className="shell py-8">
      <section className="hero p-7 max-w-3xl mx-auto">
        <span className="chip">ลงทะเบียนเจ้าของสวน</span>
        <h1 className="mt-4 text-4xl font-black text-coffee">
          สร้างบัญชีเจ้าของสวนกาแฟ
        </h1>
        <p className="mt-2 text-muted">
          กรอกข้อมูลพื้นฐานเพื่อส่งคำขอเข้าใช้งานระบบ
        </p>


        
        <form onSubmit={submit} className="card mt-8 p-6 max-w-3xl mx-auto">
          <div className="flex flex-col gap-4">
            <div>
              <label className="label ">ชื่อผู้ใช้ <span className="text-red-500">*</span></label>
              <input
                className="input"
                placeholder="ตัวอักษร a-z, 0-9, อย่างน้อย 4 ตัว"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                * ชื่อผู้ใช้ต้องประกอบด้วยตัวอักษร a-z หรือ ตัวเลข 0-9 อย่างน้อย 4 ตัว และไม่สามารถใช้ช่องว่างได้
              </p>
            </div>
            <div>
              <label className="label">ชื่อ-นามสกุล</label>
              <input
                className="input"
                placeholder="กรอกชื่อ-นามสกุล"
                value={form.fullname}
                onChange={(e) => setForm({ ...form, fullname: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">เบอร์โทรศัพท์</label>
              <input
                className="input"
                placeholder="กรอกเบอร์โทรศัพท์"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="label">ที่อยู่</label>
              <input
                className="input"
                placeholder="กรอกที่อยู่ (บ้านเลขที่/ซอย/ถนน)"
                value={form.house_no}
                onChange={(e) => setForm({ ...form, house_no: e.target.value })}
              />
            </div>
            <SmartLocationFields form={form} setForm={setForm} />{" "}  {/* ฟิลด์ที่เอาไว้สำหรับเลือกที่อยู่ */}
            <div>
              <label className="label">อีเมล</label>
              <input
                className="input"
                type="email"
                placeholder="example123@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            {/* <div>
              <label className="label">รหัสผ่าน</label>
              <PasswordInput
                placeholder = "อย่างน้อย 8 ตัวอักษร"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
              <p className="mt-1 text-sm text-red-500">
                * ตัวอักษรต้องมีความยาวอย่างน้อย 8 ตัว และควรประกอบด้วยตัวอักษรพิมพ์ใหญ่ พิมพ์เล็ก ตัวเลข และสัญลักษณ์ เพื่อความปลอดภัยของบัญชีผู้ใช้
              </p>
            </div> */}

            <div>
              <label className="label">
                รหัสผ่าน <span className="text-red-500">*</span>
              </label>

              <PasswordInput
                placeholder="อย่างน้อย 8 ตัวอักษร"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
                required
              />

              {/* แถบความแข็งแรง */}
              {form.password && (
                <>
                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-200">
                    <div
                      className={`h-full transition-all duration-300 ${strength.color}`}
                      style={{ width: strength.width }}
                    />
                  </div>

                  <p className={`mt-2 text-sm font-medium ${strength.textColor}`}>
                    {strength.text}
                  </p>
                </>
              )}

              <p className="mt-2 text-sm text-gray-500">
                ต้องมีตัวอักษรพิมพ์ใหญ่ พิมพ์เล็ก ตัวเลข และอักขระพิเศษ(เช่น @#$%^&*)
              </p>
            </div>
            <div>
            <label className="label">ยืนยันรหัสผ่าน</label>
            <PasswordInput
              placeholder="กรอกรหัสผ่านอีกครั้ง"
              value={form.confirmPassword}
              onChange={(e) =>
                setForm({ ...form, confirmPassword: e.target.value })
              }
              required
            />

            {form.confirmPassword &&
              form.password !== form.confirmPassword && (
                <p className="mt-1 text-sm text-red-500">
                  รหัสผ่านไม่ตรงกัน
                </p>
              )}
          </div>
          </div>

        
         <div className="flex justify-center">
          <button
            type="submit"
            className="btn btn-primary mt-4 px-10 py-3 text-base font-bold rounded-2xl"
          >
            ส่งคำขอลงทะเบียน
          </button>
        </div>
        </form>
      </section>
    </main>
  );
}
