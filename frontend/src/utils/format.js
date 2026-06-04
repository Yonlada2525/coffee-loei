export const number = (value) => Number(value || 0).toLocaleString('th-TH');
export const dateOnly = (value) => (value ? String(value).slice(0, 10) : '');
export const toBooleanLabel = (value) => (Number(value) === 1 || value === true ? 'มี' : 'ไม่มี');
