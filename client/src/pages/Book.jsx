import { useEffect, useMemo, useState } from 'react';
import { api, fmtPKR } from '../api.js';

const STEPS = ['Service', 'Stylist & Day', 'Time', 'Details'];

function nextDays(n = 14) {
  const days = [];
  const d = new Date();
  while (days.length < n) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0) days.push(new Date(d)); // salon closed Sundays
  }
  return days;
}
const iso = (d) => d.toISOString().slice(0, 10);
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function Book() {
  const [step, setStep] = useState(0);
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [slots, setSlots] = useState([]);
  const [closed, setClosed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [serviceId, setServiceId] = useState('');
  const [staffId, setStaffId] = useState('any');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [done, setDone] = useState(null);

  const days = useMemo(nextDays, []);
  const service = services.find((s) => s.id === serviceId);
  const stylist = staffId === 'any' ? null : staff.find((s) => s.id === staffId);

  useEffect(() => { api.services().then(setServices).catch(() => {}); }, []);
  useEffect(() => {
    if (!serviceId) return;
    api.staff(serviceId).then(setStaff).catch(() => {});
    setStaffId('any');
  }, [serviceId]);
  useEffect(() => {
    if (!serviceId || !date) return;
    setLoading(true);
    api.slots(serviceId, staffId, date)
      .then((r) => { setSlots(r.slots); setClosed(r.closed); setTime(''); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [serviceId, staffId, date]);

  const submit = async () => {
    setError('');
    setLoading(true);
    try {
      const b = await api.book({ serviceId, staffId, date, startTime: time, customer: { name, phone }, notes });
      setDone(b);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <section className="section"><div className="wrap wizard"><div className="card success">
        <div className="tick">✓</div>
        <h2>You're booked!</h2>
        <p>{service?.name} · {done.date} at {done.startTime}<br />with {staff.find((s) => s.id === done.staffId)?.name}</p>
        <div className="ref">{done.id}</div>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Show this reference at the salon. We'll confirm shortly by phone.</p>
      </div></div></section>
    );
  }

  return (
    <section className="section"><div className="wrap wizard">
      <h2 style={{ fontFamily: 'var(--serif)', fontSize: '2rem' }}>Book an appointment</h2>
      <div className="stepbar">{STEPS.map((s, i) => <span key={s} className={i <= step ? 'on' : ''} />)}</div>
      {error && <div className="error">{error}</div>}

      {step === 0 && (
        <div className="pick-list">
          {[...new Set(services.map((s) => s.category))].map((cat) => (
            <div key={cat}>
              <p style={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: 1, color: 'var(--muted)', margin: '14px 0 8px' }}>{cat}</p>
              <div className="pick-list">
                {services.filter((s) => s.category === cat).map((s) => (
                  <button key={s.id} className={`pick ${s.id === serviceId ? 'sel' : ''}`} onClick={() => setServiceId(s.id)}>
                    <span><strong>{s.name}</strong><br /><span className="sub">{s.desc}</span></span>
                    <span style={{ textAlign: 'right', whiteSpace: 'nowrap' }}><strong>{fmtPKR(s.price)}</strong><br /><span className="sub">{s.durationMin} min</span></span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {step === 1 && (
        <>
          <div className="field"><label>Stylist</label>
            <div className="pick-list">
              <button className={`pick ${staffId === 'any' ? 'sel' : ''}`} onClick={() => setStaffId('any')}>
                <span><strong>First available</strong><br /><span className="sub">We'll match you with a specialist</span></span>
              </button>
              {staff.map((s) => (
                <button key={s.id} className={`pick ${s.id === staffId ? 'sel' : ''}`} onClick={() => setStaffId(s.id)}>
                  <span><strong>{s.name}</strong><br /><span className="sub">{s.role}</span></span>
                </button>
              ))}
            </div>
          </div>
          <div className="field"><label>Day</label>
            <div className="date-strip">
              {days.map((d) => (
                <button key={iso(d)} className={`date-chip ${date === iso(d) ? 'sel' : ''}`} onClick={() => setDate(iso(d))}>
                  <span className="dow">{DOW[d.getDay()]}</span>
                  <span className="dnum">{d.getDate()}</span>
                  <span className="dow">{MONTHS[d.getMonth()]}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {step === 2 && (
        loading ? <p className="empty">Checking live availability…</p>
        : closed ? <p className="empty">We're closed that day — pick another.</p>
        : slots.length === 0 ? <p className="empty">No slots left that day. Try another date or stylist.</p>
        : <div className="slot-grid">
            {slots.map((s) => (
              <button key={s.time + s.staffId} className={`slot ${time === s.time ? 'sel' : ''}`} onClick={() => setTime(s.time)}>{s.time}</button>
            ))}
          </div>
      )}

      {step === 3 && (
        <>
          <div className="summary">
            <div><span>Service</span><strong>{service?.name}</strong></div>
            <div><span>Stylist</span><strong>{stylist ? stylist.name : 'First available'}</strong></div>
            <div><span>When</span><strong>{date} at {time}</strong></div>
            <div><span>Total</span><strong>{fmtPKR(service?.price)}</strong></div>
          </div>
          <div className="field"><label>Your name</label><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ayesha Khan" /></div>
          <div className="field"><label>Phone</label><input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0300 1234567" /></div>
          <div className="field"><label>Notes (optional)</label><textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Allergies, preferences…" /></div>
        </>
      )}

      <div className="wizard-nav">
        <button className="btn btn-ghost" disabled={step === 0} onClick={() => setStep(step - 1)}>Back</button>
        {step < 3 ? (
          <button className="btn" disabled={(step === 0 && !serviceId) || (step === 1 && !date) || (step === 2 && !time)} onClick={() => setStep(step + 1)}>Continue</button>
        ) : (
          <button className="btn" disabled={!name.trim() || !phone.trim() || loading} onClick={submit}>{loading ? 'Booking…' : 'Confirm Booking'}</button>
        )}
      </div>
    </div></section>
  );
}
