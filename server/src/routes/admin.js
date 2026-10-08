import { Router } from 'express';
import { db, uid } from '../db.js';
import { bookingEnd } from '../slots.js';

const r = Router();

// Demo-grade gate: pass ?key=admin123 or header x-admin-key.
// For production, replace with real auth (JWT / sessions).
r.use((req, res, next) => {
  const key = req.query.key || req.headers['x-admin-key'];
  if (key !== (process.env.ADMIN_KEY || db.get('settings').adminKey || 'admin123')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});

r.get('/stats', (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const bookings = db.get('bookings');
  const services = db.get('services');
  const priceOf = (b) => services.find((s) => s.id === b.serviceId)?.price ?? 0;
  const active = bookings.filter((b) => !['cancelled'].includes(b.status));
  res.json({
    today: bookings.filter((b) => b.date === today && b.status !== 'cancelled').length,
    pending: bookings.filter((b) => b.status === 'pending').length,
    total: bookings.length,
    revenue: active.filter((b) => b.status === 'completed').reduce((s, b) => s + priceOf(b), 0),
  });
});

r.get('/bookings', (req, res) => {
  const { date, status } = req.query;
  let list = [...db.get('bookings')].sort((a, b) => (b.date + b.startTime).localeCompare(a.date + a.startTime));
  if (date) list = list.filter((b) => b.date === date);
  if (status) list = list.filter((b) => b.status === status);
  const services = db.get('services'), staff = db.get('staff');
  res.json(list.map((b) => ({
    ...b,
    service: services.find((s) => s.id === b.serviceId),
    staff: staff.find((s) => s.id === b.staffId),
  })));
});

r.patch('/bookings/:id', (req, res) => {
  const { status } = req.body ?? {};
  if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  const bookings = db.get('bookings');
  const b = bookings.find((x) => x.id === req.params.id);
  if (!b) return res.status(404).json({ error: 'Not found' });
  b.status = status;
  db.set('bookings', bookings);
  res.json(b);
});

// Services CRUD (admin)
r.post('/services', (req, res) => {
  const { name, category, price, durationMin, desc = '' } = req.body ?? {};
  if (!name || !category || !(price > 0) || !(durationMin > 0)) {
    return res.status(400).json({ error: 'name, category, price, durationMin are required' });
  }
  res.status(201).json(db.push('services', { id: uid('svc_'), name, category, desc, price, durationMin, active: true }));
});
r.patch('/services/:id', (req, res) => {
  const services = db.get('services');
  const s = services.find((x) => x.id === req.params.id);
  if (!s) return res.status(404).json({ error: 'Not found' });
  Object.assign(s, req.body);
  db.set('services', services);
  res.json(s);
});
r.delete('/services/:id', (req, res) => {
  const services = db.get('services');
  const s = services.find((x) => x.id === req.params.id);
  if (!s) return res.status(404).json({ error: 'Not found' });
  s.active = false; // soft delete keeps booking history intact
  db.set('services', services);
  res.json({ ok: true });
});

export default r;
