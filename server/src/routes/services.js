import { Router } from 'express';
import { db } from '../db.js';

const r = Router();
r.get('/', (req, res) => res.json(db.get('services').filter((s) => s.active)));
export default r;
