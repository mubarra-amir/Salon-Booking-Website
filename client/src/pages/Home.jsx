import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, fmtPKR } from '../api.js';

export default function Home() {
  const [services, setServices] = useState([]);

  useEffect(() => { api.services().then(setServices).catch(() => {}); }, []);

  const cats = [...new Set(services.map((s) => s.category))];

  return (
    <>
      <header className="hero">
        <div className="hero-inner">
          <span className="kicker">Lahore · Salon &amp; Spa</span>
          <h1>Book your <em>glow-up</em> in under a minute.</h1>
          <p>Real-time availability, your favourite stylists, instant confirmation. No phone tag, no waiting room — just pick a service and a slot.</p>
          <Link to="/book" className="btn">Book an Appointment</Link>
          <div className="hero-meta">
            <div><strong>4.9 ★</strong><span>2,300+ happy clients</span></div>
            <div><strong>10+</strong><span>Signature services</span></div>
            <div><strong>Same-day</strong><span>Slots available</span></div>
          </div>
        </div>
      </header>

      <section className="section wrap">
        <div className="section-head">
          <h2>Our services</h2>
          <p>Transparent pricing · {services.length} treatments</p>
        </div>
        {cats.map((cat) => (
          <div key={cat} style={{ marginBottom: 36 }}>
            <h3 style={{ fontFamily: 'var(--serif)', marginBottom: 14, fontSize: '1.3rem' }}>{cat}</h3>
            <div className="grid grid-3">
              {services.filter((s) => s.category === cat).map((s) => (
                <div key={s.id} className="card svc-card">
                  <span className="svc-cat">{s.category}</span>
                  <h3>{s.name}</h3>
                  <p>{s.desc}</p>
                  <div className="svc-foot">
                    <span className="price">{fmtPKR(s.price)}</span>
                    <span className="duration">{s.durationMin} min</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="section wrap" style={{ paddingTop: 0 }}>
        <div className="section-head"><h2>How it works</h2></div>
        <div className="grid grid-3 steps">
          <div className="step"><h3>Pick a service</h3><p>Browse treatments with honest prices and durations — no surprises at checkout.</p></div>
          <div className="step"><h3>Choose your slot</h3><p>Live availability by stylist and day. Your slot is held the moment you confirm.</p></div>
          <div className="step"><h3>Walk in glowing</h3><p>Get an instant booking reference. Reschedule or cancel free from My Bookings.</p></div>
        </div>
        <div className="cta-band">
          <h2>Ready when you are.</h2>
          <p>Evenings and weekends fill fast — grab your slot today.</p>
          <Link to="/book" className="btn">Book Now</Link>
        </div>
      </section>
    </>
  );
}
