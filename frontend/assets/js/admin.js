function initAdmin() {
    protect(['admin']);
    document.body.insertAdjacentHTML('afterbegin', adminNav());
    showUser();
}

async function fillSelect(id, path, labelField, valueField) {
    const rows = await api(path);
    document.getElementById(id).innerHTML = rows.map(r => `<option value="${r[valueField]}">${r[labelField]}</option>`).join('');
}