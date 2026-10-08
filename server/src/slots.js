// Slot generation + overlap logic for the booking engine.
import { db } from './db.js';

const toMin = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};
const toHHMM = (min) =>
  `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;

const overlaps = (aStart, aEnd, bStart, bEnd) => aStart < bEnd && bStart < aEnd;

export function isClosed(dateStr) {
  const { closedDays } = db.get('settings');
  return closedDays.includes(new Date(dateStr + 'T12:00:00').getDay());
}

export function staffForService(service) {
  const all = db.get('staff').filter((s) => s.active);
  return all.filter((s) => s.specialties.includes(service.category));
}

/** Bookings that block a staff member's calendar on a date. */
function blockingBookings(staffId, date) {
  return db
    .get('bookings')
    .filter((b) => b.staffId === staffId && b.date === date && ['pending', 'confirmed'].includes(b.status));
}

export function bookingEnd(b) {
  const svc = db.get('services').find((s) => s.id === b.serviceId);
  return toMin(b.startTime) + (svc?.durationMin ?? 60);
}

/** Available start times for a service+staff on a date. */
export function availableSlots(serviceId, staffId, dateStr) {
  const service = db.get('services').find((s) => s.id === serviceId && s.active);
  if (!service || isClosed(dateStr)) return [];

  const { openHour, closeHour, slotStepMin } = db.get('settings');
  const candidates = staffId === 'any' ? staffForService(service) : db.get('staff').filter((s) => s.id === staffId && s.active);
  const slots = [];

  for (let t = openHour * 60; t + service.durationMin <= closeHour * 60; t += slotStepMin) {
    // For "any staff": slot is bookable if at least one specialist is free.
    const freeStaff = candidates.filter((st) => {
      const busy = blockingBookings(st.id, dateStr);
      return !busy.some((b) => overlaps(t, t + service.durationMin, toMin(b.startTime), bookingEnd(b)));
    });
    if (freeStaff.length) slots.push({ time: toHHMM(t), staffId: staffId === 'any' ? freeStaff[0].id : staffId });
  }

  // Don't offer slots in the past for today.
  const today = new Date().toISOString().slice(0, 10);
  if (dateStr === today) {
    const nowMin = new Date().getHours() * 60 + new Date().getMinutes() + 30; // 30-min buffer
    return slots.filter((s) => toMin(s.time) >= nowMin);
  }
  return slots;
}

/** True if the requested window is free for the staff member. */
export function isFree(serviceId, staffId, dateStr, startTime) {
  const service = db.get('services').find((s) => s.id === serviceId);
  if (!service) return false;
  const start = toMin(startTime);
  const end = start + service.durationMin;
  const { openHour, closeHour } = db.get('settings');
  if (start < openHour * 60 || end > closeHour * 60) return false;
  return !blockingBookings(staffId, dateStr).some((b) =>
    overlaps(start, end, toMin(b.startTime), bookingEnd(b))
  );
}
