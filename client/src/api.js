const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

async function req(path, opts = {}) {
  const res = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    ...opts,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Something went wrong');
  return data;
}

export const api = {
  services: () => req('/services'),
  staff: (serviceId) => req(`/staff${serviceId ? `?serviceId=${serviceId}` : ''}`),
  slots: (serviceId, staffId, date) =>
    req(`/bookings/slots?serviceId=${serviceId}&staffId=${staffId}&date=${date}`),
  book: (payload) => req('/bookings', { method: 'POST', body: JSON.stringify(payload) }),
  mine: (phone) => req(`/bookings/mine?phone=${encodeURIComponent(phone)}`),
  cancelBooking: (id) => req(`/bookings/${id}/cancel`, { method: 'PATCH' }),

  adminKey: () => localStorage.getItem('vg_admin_key') || '',
  admin: {
    stats: (key) => req(`/admin/stats?key=${key}`),
    bookings: (key, { date, status } = {}) =>
      req(`/admin/bookings?key=${key}${date ? `&date=${date}` : ''}${status ? `&status=${status}` : ''}`),
    setStatus: (key, id, status) =>
      req(`/admin/bookings/${id}?key=${key}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    addService: (key, svc) =>
      req(`/admin/services?key=${key}`, { method: 'POST', body: JSON.stringify(svc) }),
    updateService: (key, id, patch) =>
      req(`/admin/services/${id}?key=${key}`, { method: 'PATCH', body: JSON.stringify(patch) }),
    removeService: (key, id) => req(`/admin/services/${id}?key=${key}`, { method: 'DELETE' }),
  },
};

export const fmtPKR = (n) => 'Rs ' + Number(n).toLocaleString('en-PK');
