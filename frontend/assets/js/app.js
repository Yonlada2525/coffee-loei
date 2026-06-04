async function pageHome() {
    mountNav('public');
    const el = document.getElementById('homeStats');
    try {
        const rows = await api('/farms');
        if (el) el.innerHTML = `<div class="stat"><span>สวนทั้งหมด</span><b>${rows.length}</b></div>
            <div class="stat"><span>พื้นที่รวม</span><b>${money(rows.reduce((a, b) => a + Number(b.area_size || 0), 0))}</b></div>
            <div class="stat"><span>อำเภอที่มีข้อมูล</span><b>${new Set(rows.map(x => x.district)).size}</b></div>`;
    } catch (e) { }
}

async function pageLogin() {
    mountNav('public');
    document.getElementById('loginForm').onsubmit = async e => {
        e.preventDefault();
        try {
            let body = formData(e.target);
            if (!body.role) {
                body.role = (body.username || '').toLowerCase().startsWith('admin') ? 'admin' : 'owner';
            }
            const data = await api('/auth/login', { method: 'POST', body });
            setSession(data);
            location.href = data.user.role === 'admin' ? ROOT + '/pages/admin/dashboard.html' : ROOT + '/pages/owner/dashboard.html';
        } catch (err) {
            toast(err.message);
        }
    };
}

async function pageRegister() {
    mountNav('public');
    const form = document.getElementById('registerForm');
    initLocationSelectors(form);
    form.onsubmit = async e => {
        e.preventDefault();
        const b = formData(form);
        b.address = `${b.house_no || ''} ${b.village || ''} ต.${b.sub_district || ''} อ.${b.district || ''} จ.เลย ${b.postal_code || ''}`;
        try {
            await api('/auth/register', { method: 'POST', body: b });
            toast('สมัครสำเร็จ รอผู้ดูแลอนุมัติ');
            setTimeout(() => location.href = ROOT + '/pages/public/login.html', 800);
        } catch (err) {
            toast(err.message);
        }
    };
}

async function pagePublicFarms() {
    mountNav('public');
    await renderPublicFarms();
    const district = document.getElementById('districtFilter');
    district.innerHTML = option('', 'ทุกอำเภอ') + Object.keys(LOEI_LOCATIONS).map(x => option(x)).join('');
    district.onchange = async () => {
        const q = district.value ? `?district=${encodeURIComponent(district.value)}` : '';
        const rows = await api('/farms' + q);
        document.getElementById('publicFarms').innerHTML = rows.map((f, i) => `<article class="card p-4">
            <img class="image-card" src="${assetPath('frontend/assets/images/farm-' + ((i % 5) + 1) + '.svg')}">
            <h3 class="mt-4 text-xl font-black text-[#4b2f24]">${f.farm_name}</h3>
            <p>${f.village || ''} ${f.sub_district || ''} ${f.district || ''}</p>
            <div class="mt-3 flex gap-2 flex-wrap">
                <span class="chip">${f.coffee_name || '-'}</span>
                <span class="chip">${f.area_size || 0} ไร่</span>
            </div>
        </article>`).join('');
    };
}

async function pageMap() {
    mountNav('public');
    const rows = await api('/farms');
    const map = L.map('map').setView([17.486, 101.72], 8);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
    rows.forEach(f => {
        if (f.latitude && f.longitude) {
            L.marker([f.latitude, f.longitude]).addTo(map).bindPopup(`<b>${f.farm_name}</b><br>${f.district}<br>${f.coffee_name || ''}`);
        }
    });
}

async function pageAdminDashboard() {
    protect(['admin']);
    mountNav('admin');
    showUser();
    const s = await api('/reports/summary');
    document.getElementById('stats').innerHTML = `<div class="stat"><span>สวนกาแฟ</span><b>${s.total_farms}</b></div>
        <div class="stat"><span>เจ้าของสวน</span><b>${s.total_owners}</b></div>
        <div class="stat"><span>พื้นที่รวม</span><b>${money(s.total_area)} ไร่</b></div>
        <div class="stat"><span>ผลผลิตรวม</span><b>${money(s.total_production)} กก.</b></div>`;
    new Chart(document.getElementById('chartDistrict'), {
        type: 'bar',
        data: {
            labels: s.byDistrict.map(x => x.district),
            datasets: [{ label: 'จำนวนสวน', data: s.byDistrict.map(x => x.total) }]
        }
    });
    new Chart(document.getElementById('chartCoffee'), {
        type: 'doughnut',
        data: {
            labels: s.byCoffee.map(x => x.coffee_name),
            datasets: [{ label: 'ผลผลิต', data: s.byCoffee.map(x => x.total) }]
        }
    });
}

async function pageOwnerDashboard() {
    protect(['owner']);
    mountNav('owner');
    showUser();
    const s = await api('/reports/owner-summary');
    document.getElementById('stats').innerHTML = `<div class="stat"><span>สวนของฉัน</span><b>${s.total_farms}</b></div>
        <div class="stat"><span>พื้นที่รวม</span><b>${money(s.total_area)} ไร่</b></div>
        <div class="stat"><span>ผลผลิตรวม</span><b>${money(s.total_production)} กก.</b></div>`;
    new Chart(document.getElementById('chartMonthly'), {
        type: 'bar',
        data: {
            labels: ['ม.ค.', 'ก.พ.', 'มี.ค.'],
            datasets: [{ label: 'ผลผลิต กก.', data: [s.monthly?.jan || 0, s.monthly?.feb || 0, s.monthly?.mar || 0] }]
        }
    });
}

async function pageAdminFarms() {
    protect(['admin']);
    mountNav('admin');
    document.getElementById('farmArea').innerHTML = farmFormHtml(true);
    await setupFarmForm(true, false);
    await renderFarmsTable(true, false);
}

async function pageOwnerFarms() {
    protect(['owner']);
    mountNav('owner');
    document.getElementById('farmArea').innerHTML = farmFormHtml(false);
    await setupFarmForm(false, true);
    await renderFarmsTable(false, true);
}

async function pageOwners() {
    protect(['admin']);
    mountNav('admin');
    const form = document.getElementById('ownerForm');
    form.onsubmit = async e => {
        e.preventDefault();
        await api('/owners', { method: 'POST', body: formData(form) });
        toast('เพิ่มเจ้าของสวนแล้ว');
        form.reset();
        loadOwners();
    };
    loadOwners();
}

async function loadOwners() {
    const rows = await api('/owners');
    document.getElementById('ownersTable').innerHTML = `<div class="table-wrap">
        <table>
            <thead>
                <tr><th>ชื่อ</th><th>ติดต่อ</th><th>สถานะ</th><th>จัดการ</th></tr>
            </thead>
            <tbody>
                ${rows.map(o => `<tr>
                    <td><b>${o.fullname}</b><br>${o.username}</td>
                    <td>${o.phone || '-'}<br>${o.email || '-'}</td>
                    <td><span class="chip">${o.status}</span></td>
                    <td><button class="btn btn-ghost" onclick="delOwner(${o.owner_id})">ลบ</button></td>
                </tr>`).join('')}
            </tbody>
        </table>
    </div>`;
}

async function delOwner(id) {
    if (confirm('ลบเจ้าของสวน?')) {
        await api('/owners/' + id, { method: 'DELETE' });
        loadOwners();
    }
}

async function pageCoffeeTypes() {
    protect(['admin']);
    mountNav('admin');
    const form = document.getElementById('coffeeForm');
    form.onsubmit = async e => {
        e.preventDefault();
        await api('/coffee-types', { method: 'POST', body: formData(form) });
        toast('บันทึกพันธุ์กาแฟแล้ว');
        form.reset();
        loadCoffee();
    };
    loadCoffee();
}

async function loadCoffee() {
    const rows = await api('/coffee-types');
    document.getElementById('coffeeTable').innerHTML = `<div class="table-wrap">
        <table>
            <thead><tr><th>พันธุ์กาแฟ</th><th>กระบวนการ</th><th>รายละเอียด</th><th></th></tr></thead>
            <tbody>
                ${rows.map(c => `<tr>
                    <td><b>${c.coffee_name}</b></td>
                    <td>${c.process_type || '-'}</td>
                    <td>${c.description || '-'}</td>
                    <td><button class="btn btn-ghost" onclick="api('/coffee-types/${c.coffee_id}',{method:'DELETE'}).then(loadCoffee)">ลบ</button></td>
                </tr>`).join('')}
            </tbody>
        </table>
    </div>`;
}

async function pageProductions(owner = false) {
    protect(owner ? ['owner'] : ['admin']);
    mountNav(owner ? 'owner' : 'admin');
    const look = await lookup();
    const form = document.getElementById('prodForm');
    fillSelect(form.farm_id, owner ? await api('/farms/mine') : look.farms, 'farm_id', 'farm_name', 'เลือกสวน');
    fillSelect(form.coffee_id, look.coffeeTypes, 'coffee_id', 'coffee_name', 'เลือกพันธุ์กาแฟ');
    form.onsubmit = async e => {
        e.preventDefault();
        await api('/productions', { method: 'POST', body: formData(form) });
        toast('บันทึกผลผลิตแล้ว');
        form.reset();
        loadProd(owner);
    };
    loadProd(owner);
}

async function loadProd(owner = false) {
    const rows = await api(owner ? '/productions/mine' : '/productions');
    document.getElementById('prodTable').innerHTML = `<div class="table-wrap">
        <table>
            <thead>
                <tr><th>สวน</th><th>ปี</th><th>ม.ค.</th><th>ก.พ.</th><th>มี.ค.</th><th>รวม</th><th></th></tr>
            </thead>
            <tbody>
                ${rows.map(p => `<tr>
                    <td>${p.farm_name}<br><span class="chip">${p.coffee_name || '-'}</span></td>
                    <td>${(p.harvest_year || '').slice(0, 10)}</td>
                    <td>${money(p.jan_quantity)}</td>
                    <td>${money(p.feb_quantity)}</td>
                    <td>${money(p.mar_quantity)}</td>
                    <td><b>${money(p.quantity_kg)}</b></td>
                    <td><button class="btn btn-ghost" onclick="api('/productions/${p.production_id}',{method:'DELETE'}).then(()=>loadProd(${owner}))">ลบ</button></td>
                </tr>`).join('')}
            </tbody>
        </table>
    </div>`;
}

async function pageMedia() {
    protect(['owner']);
    mountNav('owner');
    const farms = await api('/farms/mine');
    fillSelect(document.getElementById('farm_id'), farms, 'farm_id', 'farm_name', 'เลือกสวน');
    document.getElementById('mediaForm').onsubmit = async e => {
        e.preventDefault();
        const fd = new FormData(e.target);
        await api('/media', { method: 'POST', body: fd });
        toast('อัปโหลดแล้ว');
        e.target.reset();
        loadMedia();
    };
    loadMedia();
}

async function loadMedia() {
    const rows = await api('/media');
    document.getElementById('mediaGrid').innerHTML = rows.map(m => `<div class="card p-3">
        <img class="image-card" src="${assetPath(m.file_path)}">
        <button class="btn btn-ghost mt-3" onclick="api('/media/${m.media_id}',{method:'DELETE'}).then(loadMedia)">ลบ</button>
    </div>`).join('');
}

document.addEventListener('DOMContentLoaded', () => {
    const p = document.body.dataset.page;
    const pages = {
        home: pageHome,
        login: pageLogin,
        register: pageRegister,
        publicFarms: pagePublicFarms,
        map: pageMap,
        adminDashboard: pageAdminDashboard,
        ownerDashboard: pageOwnerDashboard,
        adminFarms: pageAdminFarms,
        ownerFarms: pageOwnerFarms,
        owners: pageOwners,
        coffeeTypes: pageCoffeeTypes,
        adminProductions: () => pageProductions(false),
        ownerProductions: () => pageProductions(true),
        media: pageMedia
    };
    (pages[p] || (() => {}))();
});