import { useState } from 'react';
import { api } from '../api.js';

export default function MyBookings() {
  const [phone, setPhone] = useState('');
  const [list, setList] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const lookup = async () => {
    setError(''); setLoading(true);
    try { setList(await api.mine(phone)); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const cancel = async (id) => {
    if (!confirm('Cancel this appointment?')) return;
    try {
      await api.cancelBooking(id);
      setList(list.map((b) => (b.id === id ? { ...b, status: 'cancelled' } : b)));
    } catch (e) { setError(e.message); }
  };

  return (
    <section className="section"><div className="wrap wizard">
      <h2 style={{ fontFamily: 'var(--serif)', fontSize: '2rem', marginBottom: 8 }}>My bookings</h2>
      <p style={{ color: 'var(--muted)', marginBottom: 20 }}>Enter the phone number you booked with.</p>
      {error && <div className="error">{error}</div>}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
        <div className="field" style={{ flex: 1, marginBottom: 0 }}>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0300 1234567" onKeyDown={(e) => e.key === 'Enter' && lookup()} />
        </div>
        <button className="btn" onClick={lookup} disabled={loading || !phone.trim()}>{loading ? '…' : 'Find'}</button>
      </div>
      {list && (list.length === 0 ? <p className="empty">No bookings found for that number.</p> : (
        <div className="pick-list">
          {list.map((b) => (
            <div key={b.id} className="card" style={{ padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <strong>{b.date} · {b.startTime}</strong>
                <span className={`badge ${b.status}`}>{b.status}</span>
              </div>
              <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Ref: {b.id}</p>
              {!['cancelled', 'completed'].includes(b.status) && (
                <button className="btn btn-ghost btn-sm" style={{ marginTop: 10 }} onClick={() => cancel(b.id)}>Cancel booking</button>
              )}
            </div>
          ))}
        </div>
      ))}
    </div></section>
  );
}
