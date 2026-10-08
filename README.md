# Velvet Glow — Salon Booking Platform

A full-stack appointment booking website for a salon & spa: customers browse
services, pick a stylist and a real-time available slot, and book in under a
minute. Staff manage everything from an admin dashboard.

**Stack:** React (Vite) · React Router · Node.js + Express · JSON file store
(zero-setup; swap `server/src/db.js` for MongoDB/Mongoose when you scale)

## Features

**Customer**
- Service catalogue grouped by category with PKR pricing
- 4-step booking wizard: service → stylist & day → live time slots → details
- Real availability engine — slots respect service duration, staff calendars,
  working hours (Mon–Sat, 10:00–20:00), and double-booking protection
- Booking confirmation with reference ID
- "My Bookings" — look up by phone, cancel free

**Admin** (`/admin`, demo key `admin123`)
- Overview: today's bookings, pending count, totals, revenue
- Bookings board: filter by date/status, confirm → complete → cancel flow
- Services manager: add, hide/show, remove (soft-delete keeps history)

## Run it locally

```bash
# backend (http://localhost:4000)
cd server
npm install
npm run seed     # sample services + staff
npm run dev

# frontend (http://localhost:5173) — in another terminal
cd client
npm install
npm run dev
```

Point the frontend at a deployed API with `VITE_API_URL` (see `client/.env.example`).

## API cheatsheet

| Method | Endpoint | What |
|---|---|---|
| GET | `/api/services` | active services |
| GET | `/api/staff?serviceId=` | staff (filtered by specialty) |
| GET | `/api/bookings/slots?serviceId=&staffId=&date=` | available slots |
| POST | `/api/bookings` | create booking |
| GET | `/api/bookings/mine?phone=` | customer lookup |
| PATCH | `/api/bookings/:id/cancel` | customer cancel |
| GET/PATCH | `/api/admin/...?key=` | stats, bookings, services CRUD |

## Project structure

```
server/
  src/index.js          Express app
  src/db.js             JSON file store (swap for MongoDB here)
  src/slots.js          availability + overlap engine
  src/seed.js           sample salon data
  src/routes/           services, staff, bookings, admin
client/
  src/pages/            Home, Book (wizard), MyBookings, Admin
  src/api.js            typed API client
  src/index.css         Velvet Glow design system
```

## Notes

- Admin auth is a demo-grade shared key (`ADMIN_KEY` env). Use JWT/sessions in production.
- Data persists to `server/data/db.json` (git-ignored).

Built as a portfolio + freelance-template project.
