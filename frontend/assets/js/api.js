const API_BASE = 'http://localhost:5000/api';

function getToken() {
    return localStorage.getItem('token');
}

function getUser() {
    return JSON.parse(localStorage.getItem('user') || 'null');
}

function setSession(data) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
}

function logout() {
    localStorage.clear();
    location.href = '/coffee_loei_db/frontend/pages/public/login.html';
}

function authHeaders() {
    return getToken() ? { Authorization: `Bearer ${getToken()}` } : {};
}

async function api(path, options = {}) {
    const config = {
        ...options,
        headers: {
            ...(options.headers || {}),
            ...authHeaders()
        }
    };
    
    if (config.body && !(config.body instanceof FormData)) {
        config.headers['Content-Type'] = 'application/json';
        config.body = JSON.stringify(config.body);
    }
    
    const res = await fetch(API_BASE + path, config);
    const data = await res.json().catch(() => ({}));
    
    if (!res.ok) throw new Error(data.message || 'เกิดข้อผิดพลาด');
    return data;
}

function protect(roles) {
    const u = getUser();
    if (!u || !roles.includes(u.role)) {
        location.href = '/coffee_loei_db/frontend/pages/public/login.html';
    }
}

function showUser() {
    const u = getUser();
    const el = document.getElementById('currentUser');
    if (el && u) el.textContent = `${u.fullname} (${u.role})`;
}

function assetPath(path) {
    if (!path) return '../assets/images/farm-1.svg';
    if (path.startsWith('/uploads')) return 'http://localhost:5000' + path;
    return '/coffee_loei_db/' + path;
}

function publicNav() {
    return `<header class="sticky top-0 z-40 glass">
        <div class="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between">
            <a href="/coffee_loei_db/frontend/" class="font-extrabold text-emerald-800 text-xl">☕ Coffee Loei DB</a>
            <nav class="nav hidden md:flex gap-1 text-sm font-semibold">
                <a href="/coffee_loei_db/frontend/pages/public/farms.html">สวนกาแฟ</a>
                <a href="/coffee_loei_db/frontend/pages/public/map.html">แผนที่</a>
                <a href="/coffee_loei_db/frontend/pages/public/register.html">สมัครเจ้าของสวน</a>
                <a href="/coffee_loei_db/frontend/pages/public/login.html">เข้าสู่ระบบ</a>
            </nav>
        </div>
    </header>`;
}

function adminNav() {
    return `<header class="sticky top-0 z-40 glass">
        <div class="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between">
            <b class="text-emerald-800 text-xl">Admin Panel</b>
            <nav class="nav flex flex-wrap gap-1 text-sm font-semibold">
                <a href="/coffee_loei_db/frontend/pages/admin/dashboard.html">Dashboard</a>
                <a href="/coffee_loei_db/frontend/pages/admin/owners.html">เจ้าของสวน</a>
                <a href="/coffee_loei_db/frontend/pages/admin/farms.html">สวนกาแฟ</a>
                <a href="/coffee_loei_db/frontend/pages/admin/coffee-types.html">พันธุ์กาแฟ</a>
                <a href="/coffee_loei_db/frontend/pages/admin/productions.html">ผลผลิต</a>
                <button onclick="logout()" class="btn bg-red-50 text-red-700 py-2">ออก</button>
            </nav>
        </div>
    </header>`;
}

function ownerNav() {
    return `<header class="sticky top-0 z-40 glass">
        <div class="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between">
            <b class="text-emerald-800 text-xl">Owner Panel</b>
            <nav class="nav flex flex-wrap gap-1 text-sm font-semibold">
                <a href="/coffee_loei_db/frontend/pages/owner/dashboard.html">Dashboard</a>
                <a href="/coffee_loei_db/frontend/pages/owner/farms.html">สวนของฉัน</a>
                <a href="/coffee_loei_db/frontend/pages/owner/productions.html">ผลผลิต</a>
                <a href="/coffee_loei_db/frontend/pages/owner/media.html">รูปภาพ</a>
                <button onclick="logout()" class="btn bg-red-50 text-red-700 py-2">ออก</button>
            </nav>
        </div>
    </header>`;
}