import { Router } from 'express';
import { db, uid } from '../db.js';
import { availableSlots, isFree, isClosed } from '../slots.js';

const r = Router();

// Availability for the booking wizard
r.get('/slots', (req, res) => {
  const { serviceId, staffId = 'any', date } = req.query;
  if (!serviceId || !date) return res.status(400).json({ error: 'serviceId and date are required' });
  res.json({ date, closed: isClosed(date), slots: availableSlots(serviceId, staffId, date) });
});

// Create a booking
r.post('/', (req, res) => {
  const { serviceId, staffId = 'any', date, startTime, customer } = req.body ?? {};
  const service = db.get('services').find((s) => s.id === serviceId && s.active);
  if (!service) return res.status(400).json({ error: 'Invalid service' });
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return res.status(400).json({ error: 'Invalid date' });
  if (date < new Date().toISOString().slice(0, 10)) return res.status(400).json({ error: 'Date is in the past' });
  if (isClosed(date)) return res.status(400).json({ error: 'Salon is closed on this day' });
  if (!startTime || !/^\d{2}:\d{2}$/.test(startTime)) return res.status(400).json({ error: 'Invalid time' });
  if (!customer?.name?.trim() || !/^[+\d][\d\s-]{6,}$/.test(customer?.phone ?? '')) {
    return res.status(400).json({ error: 'Name and a valid phone number are required' });
  }

  // Resolve staff: "any" -> first free specialist
  let resolved = staffId;
  if (staffId === 'any') {
    const slot = availableSlots(serviceId, 'any', date).find((s) => s.time === startTime);
    if (!slot) return res.status(409).json({ error: 'That slot was just taken — please pick another' });
    resolved = slot.staffId;
  } else if (!isFree(serviceId, staffId, date, startTime)) {
    return res.status(409).json({ error: 'That slot is no longer available' });
  }

  const booking = db.push('bookings', {
    id: uid('bkg_'),
    serviceId, staffId: resolved, date, startTime,
    customer: { name: customer.name.trim(), phone: customer.phone.trim() },
    notes: (req.body.notes ?? '').slice(0, 500),
    status: 'pending', // salon confirms manually in the admin panel
    createdAt: new Date().toISOString(),
  });
  res.status(201).json(booking);
});

// Customer: look up my bookings by phone
r.get('/mine', (req, res) => {
  const { phone } = req.query;
  if (!phone) return res.status(400).json({ error: 'phone is required' });
  const mine = db.get('bookings')
    .filter((b) => b.customer.phone.replace(/\D/g,'').endsWith(phone.replace(/\D/g,'').slice(-10)))
    .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));
  res.json(mine);
});

// Customer: cancel my booking
r.patch('/:id/cancel', (req, res) => {
  const bookings = db.get('bookings');
  const b = bookings.find((x) => x.id === req.params.id);
  if (!b) return res.status(404).json({ error: 'Not found' });
  if (['cancelled', 'completed'].includes(b.status)) return res.status(400).json({ error: `Already ${b.status}` });
  b.status = 'cancelled';
  db.set('bookings', bookings);
  res.json(b);
});

export default r;
