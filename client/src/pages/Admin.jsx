import { useEffect, useState } from 'react';
import { api, fmtPKR } from '../api.js';

const today = () => new Date().toISOString().slice(0, 10);

export default function Admin() {
  const [key, setKey] = useState(api.adminKey());
  const [authed, setAuthed] = useState(!!api.adminKey());
  const [tab, setTab] = useState('dash');
  const [error, setError] = useState('');

  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [fDate, setFDate] = useState(today());
  const [fStatus, setFStatus] = useState('');
  const [newSvc, setNewSvc] = useState({ name: '', category: 'Hair', price: '', durationMin: '', desc: '' });

  const login = () => {
    if (!key.trim()) return;
    localStorage.setItem('vg_admin_key', key.trim());
    setAuthed(true);
  };
  const logout = () => { localStorage.removeItem('vg_admin_key'); setAuthed(false); setKey(''); };

  const load = async () => {
    setError('');
    try {
      const [s, b, sv] = await Promise.all([
        api.admin.stats(key),
        api.admin.bookings(key, { date: fDate, status: fStatus || undefined }),
        api.services(),
      ]);
      setStats(s); setBookings(b); setServices(sv);
    } catch (e) { setError(e.message); }
  };

  useEffect(() => { if (authed) load(); }, [authed, fDate, fStatus]); // eslint-disable-line

  const setStatus = async (id, status) => {
    try { await api.admin.setStatus(key, id, status); load(); }
    catch (e) { setError(e.message); }
  };
  const addService = async () => {
    try {
      await api.admin.addService(key, { ...newSvc, price: +newSvc.price, durationMin: +newSvc.durationMin });
      setNewSvc({ name: '', category: 'Hair', price: '', durationMin: '', desc: '' });
      load();
    } catch (e) { setError(e.message); }
  };
  const toggleService = async (s) => {
    try { await api.admin.updateService(key, s.id, { active: !s.active }); load(); }
    catch (e) { setError(e.message); }
  };
  const removeService = async (s) => {
    if (!confirm(`Remove "${s.name}"? Existing bookings keep their history.`)) return;
    try { await api.admin.removeService(key, s.id); load(); }
    catch (e) { setError(e.message); }
  };

  if (!authed) {
    return (
      <section className="section"><div className="wrap wizard">
        <div className="card" style={{ maxWidth: 420, margin: '40px auto' }}>
          <h2 style={{ fontFamily: 'var(--serif)', marginBottom: 6 }}>Staff login</h2>
          <p style={{ color: 'var(--muted)', marginBottom: 18, fontSize: '0.95rem' }}>Enter the admin key to manage bookings. (Demo key: <code>admin123</code>)</p>
          <div className="field"><label>Admin key</label>
            <input type="password" value={key} onChange={(e) => setKey(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && login()} />
          </div>
          <button className="btn" style={{ width: '100%' }} onClick={login}>Sign in</button>
        </div>
      </div></section>
    );
  }

  return (
    <section className="section"><div className="wrap">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontFamily: 'var(--serif)', fontSize: '2rem' }}>Salon dashboard</h2>
        <button className="btn btn-ghost btn-sm" onClick={logout}>Sign out</button>
      </div>
      {error && <div className="error" style={{ marginTop: 16 }}>{error}</div>}

      <div className="tabs">
        <button className={`tab ${tab === 'dash' ? 'on' : ''}`} onClick={() => setTab('dash')}>Overview</button>
        <button className={`tab ${tab === 'book' ? 'on' : ''}`} onClick={() => setTab('book')}>Bookings</button>
        <button className={`tab ${tab === 'svc' ? 'on' : ''}`} onClick={() => setTab('svc')}>Services</button>
      </div>

      {tab === 'dash' && stats && (
        <div className="stat-grid">
          <div className="stat"><strong>{stats.today}</strong><span>Bookings today</span></div>
          <div className="stat"><strong>{stats.pending}</strong><span>Awaiting confirmation</span></div>
          <div className="stat"><strong>{stats.total}</strong><span>Total bookings</span></div>
          <div className="stat"><strong>{fmtPKR(stats.revenue)}</strong><span>Completed revenue</span></div>
        </div>
      )}

      {tab === 'book' && (
        <>
          <div className="filters">
            <div className="field"><label>Date</label><input type="date" value={fDate} onChange={(e) => setFDate(e.target.value)} /></div>
            <div className="field"><label>Status</label>
              <select value={fStatus} onChange={(e) => setFStatus(e.target.value)}>
                <option value="">All</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          <div className="card table-wrap" style={{ padding: 8 }}>
            <table>
              <thead><tr><th>When</th><th>Service</th><th>Stylist</th><th>Client</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>{b.date}<br /><small style={{ color: 'var(--muted)' }}>{b.startTime}</small></td>
                    <td>{b.service?.name}</td>
                    <td>{b.staff?.name}</td>
                    <td>{b.customer.name}<br /><small style={{ color: 'var(--muted)' }}>{b.customer.phone}</small></td>
                    <td><span className={`badge ${b.status}`}>{b.status}</span></td>
                    <td><div className="row-actions">
                      {b.status === 'pending' && <button className="btn btn-sm" onClick={() => setStatus(b.id, 'confirmed')}>Confirm</button>}
                      {b.status === 'confirmed' && <button className="btn btn-sm" onClick={() => setStatus(b.id, 'completed')}>Complete</button>}
                      {!['cancelled', 'completed'].includes(b.status) && <button className="btn btn-ghost btn-sm" onClick={() => setStatus(b.id, 'cancelled')}>Cancel</button>}
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {bookings.length === 0 && <p className="empty">No bookings match these filters.</p>}
          </div>
        </>
      )}

      {tab === 'svc' && (
        <>
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ fontFamily: 'var(--serif)', marginBottom: 14 }}>Add a service</h3>
            <div className="grid grid-2">
              <div className="field"><label>Name</label><input value={newSvc.name} onChange={(e) => setNewSvc({ ...newSvc, name: e.target.value })} placeholder="Bridal Package" /></div>
              <div className="field"><label>Category</label>
                <select value={newSvc.category} onChange={(e) => setNewSvc({ ...newSvc, category: e.target.value })}>
                  {['Hair', 'Makeup', 'Skin', 'Nails', 'Spa'].map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="field"><label>Price (Rs)</label><input type="number" value={newSvc.price} onChange={(e) => setNewSvc({ ...newSvc, price: e.target.value })} placeholder="5000" /></div>
              <div className="field"><label>Duration (min)</label><input type="number" value={newSvc.durationMin} onChange={(e) => setNewSvc({ ...newSvc, durationMin: e.target.value })} placeholder="60" /></div>
            </div>
            <div className="field"><label>Description</label><input value={newSvc.desc} onChange={(e) => setNewSvc({ ...newSvc, desc: e.target.value })} placeholder="What's included…" /></div>
            <button className="btn" onClick={addService} disabled={!newSvc.name || !newSvc.price || !newSvc.durationMin}>Add service</button>
          </div>
          <div className="grid grid-3">
            {services.map((s) => (
              <div key={s.id} className="card svc-card" style={{ opacity: s.active ? 1 : 0.55 }}>
                <span className="svc-cat">{s.category}</span>
                <h3>{s.name}</h3>
                <div className="svc-foot" style={{ marginBottom: 12 }}>
                  <span className="price">{fmtPKR(s.price)}</span>
                  <span className="duration">{s.durationMin} min</span>
                </div>
                <div className="row-actions">
                  <button className="btn btn-ghost btn-sm" onClick={() => toggleService(s)}>{s.active ? 'Hide' : 'Show'}</button>
                  <button className="btn btn-danger btn-sm" onClick={() => removeService(s)}>Remove</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div></section>
  );
}
