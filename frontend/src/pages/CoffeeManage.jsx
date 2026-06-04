import { useEffect, useState } from 'react';
import { API } from '../services/api';

export default function CoffeeManage() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({
    coffee_name: '',
    process_type: 'Washed',
    description: '',
  });

  const load = () => API.get('/coffee-types').then(setRows);

  useEffect(load, []);

  async function submit(e) {
    e.preventDefault();
    await API.post('/coffee-types', form);
    setForm({
      coffee_name: '',
      process_type: 'Washed',
      description: '',
    });
    load();
  }

  return (
    <div className="shell">
      <section className="hero p-6">
        <h1 className="text-4xl font-black text-coffee">จัดการพันธุ์กาแฟ</h1>
      </section>

      <form onSubmit={submit} className="card p-5 mt-8 grid md:grid-cols-3 gap-4">
        <label>
          <span className="label">พันธุ์กาแฟ</span>
          <input
            className="input"
            value={form.coffee_name}
            onChange={e => setForm({ ...form, coffee_name: e.target.value })}
          />
        </label>

        <label>
          <span className="label">กระบวนการ</span>
          <select
            className="select"
            value={form.process_type}
            onChange={e => setForm({ ...form, process_type: e.target.value })}
          >
            {['Washed', 'Natural', 'Honey', 'Semi-washed'].map(x => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>

        <label>
          <span className="label">รายละเอียด</span>
          <input
            className="input"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
          />
        </label>

        <button className="btn btn-primary md:col-span-3">บันทึก</button>
      </form>

      <div className="table-wrap mt-8">
        <table>
          <thead>
            <tr>
              <th>พันธุ์</th>
              <th>กระบวนการ</th>
              <th>รายละเอียด</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {rows.map(c => (
              <tr key={c.coffee_id}>
                <td>
                  <b>{c.coffee_name}</b>
                </td>
                <td>{c.process_type}</td>
                <td>{c.description}</td>
                <td>
                  <button
                    className="btn btn-ghost"
                    onClick={async () => {
                      await API.delete('/coffee-types/' + c.coffee_id);
                      load();
                    }}
                  >
                    ลบ
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}