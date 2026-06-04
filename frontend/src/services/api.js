import axios from "axios";
export const API = axios.create({ baseURL: "http://localhost:5000/api" });
API.interceptors.request.use((c) => {
  const t = localStorage.getItem("token");
  if (t) c.headers.Authorization = `Bearer ${t}`;
  return c;
});
API.interceptors.response.use(
  (r) => r.data,
  (e) =>
    Promise.reject(
      new Error(e.response?.data?.message || "เชื่อมต่อ API ไม่สำเร็จ"),
    ),
);
export const asset = (p) => {
  if (!p) return "/assets/images/farm-1.svg";
  if (p.startsWith("http") || p.startsWith("/")) return p;
  if (p.startsWith("backend/uploads"))
    return "http://localhost:5000/" + p.replace("backend/", "");
  if (p.includes("frontend/public/")) return p.replace("frontend/public", "");
  return "/" + p.replace("frontend/public/", "");
};
