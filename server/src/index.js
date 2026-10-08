import express from 'express';
import cors from 'cors';
import services from './routes/services.js';
import staff from './routes/staff.js';
import bookings from './routes/bookings.js';
import admin from './routes/admin.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true, time: new Date().toISOString() }));
app.use('/api/services', services);
app.use('/api/staff', staff);
app.use('/api/bookings', bookings);
app.use('/api/admin', admin);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Velvet Glow API running on http://localhost:${PORT}`));
