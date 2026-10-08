import { Router } from 'express';
import { db } from '../db.js';

const r = Router();
r.get('/', (req, res) => {
  const { serviceId } = req.query;
  let staff = db.get('staff').filter((s) => s.active);
  if (serviceId) {
    const svc = db.get('services').find((s) => s.id === serviceId);
    if (svc) staff = staff.filter((s) => s.specialties.includes(svc.category));
  }
  res.json(staff);
});
export default r;
