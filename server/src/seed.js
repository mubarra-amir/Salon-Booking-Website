// Seed the database with realistic salon data. Run: npm run seed
import { db, uid } from './db.js';

const services = [
  { name: 'Signature Haircut', category: 'Hair', desc: 'Consultation, precision cut, wash and style finish.', price: 2500, durationMin: 45 },
  { name: 'Hair Color / Balayage', category: 'Hair', desc: 'Full color or balayage with toner and gloss treatment.', price: 8500, durationMin: 120 },
  { name: 'Keratin Treatment', category: 'Hair', desc: 'Smoothing keratin therapy for frizz-free hair.', price: 12000, durationMin: 120 },
  { name: 'Bridal Makeup', category: 'Makeup', desc: 'Complete bridal look with trial session included.', price: 25000, durationMin: 120 },
  { name: 'Party Makeup', category: 'Makeup', desc: 'Event-ready makeup with lashes and setting.', price: 6000, durationMin: 60 },
  { name: 'Classic Facial', category: 'Skin', desc: 'Deep cleanse, exfoliation, mask and massage.', price: 4000, durationMin: 60 },
  { name: 'Hydra Glow Facial', category: 'Skin', desc: 'Hydrating advanced facial for instant radiance.', price: 7500, durationMin: 75 },
  { name: 'Manicure + Pedicure', category: 'Nails', desc: 'Shape, cuticle care, scrub, massage and polish.', price: 3500, durationMin: 60 },
  { name: 'Gel Extensions', category: 'Nails', desc: 'Full gel nail extensions with art of your choice.', price: 5000, durationMin: 90 },
  { name: 'Head Massage', category: 'Spa', desc: 'Relaxing 30-minute champi with warm oils.', price: 1500, durationMin: 30 },
];

const staff = [
  { name: 'Ayesha Khan', role: 'Senior Stylist', specialties: ['Hair'] },
  { name: 'Sana Malik', role: 'Makeup Artist', specialties: ['Makeup'] },
  { name: 'Hira Ahmed', role: 'Skin Specialist', specialties: ['Skin', 'Spa'] },
  { name: 'Mahnoor Fatima', role: 'Nail Technician', specialties: ['Nails'] },
];

db.set('services', services.map((s) => ({ id: uid('svc_'), ...s, active: true })));
db.set('staff', staff.map((s) => ({ id: uid('stf_'), ...s, active: true })));
db.set('bookings', []);
db.set('settings', {
  openHour: 10, closeHour: 20, slotStepMin: 15, closedDays: [0], // Sunday closed
  adminKey: process.env.ADMIN_KEY || 'admin123',
});

console.log(`Seeded ${services.length} services, ${staff.length} staff. Admin key: admin123`);
