// Tiny JSON-file database. Zero setup: data persists to server/data/db.json.
// Swap this module for a MongoDB/Mongoose layer later without touching routes.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'data');
const file = join(dir, 'db.json');

const empty = () => ({ services: [], staff: [], bookings: [], settings: {} });

function load() {
  if (!existsSync(file)) return empty();
  try {
    return { ...empty(), ...JSON.parse(readFileSync(file, 'utf8')) };
  } catch {
    return empty();
  }
}

function save(data) {
  mkdirSync(dir, { recursive: true });
  writeFileSync(file, JSON.stringify(data, null, 2));
}

export const db = {
  get all() { return load(); },
  get(col) { return load()[col] ?? []; },
  set(col, rows) {
    const data = load();
    data[col] = rows;
    save(data);
  },
  push(col, row) {
    const rows = this.get(col);
    rows.push(row);
    this.set(col, rows);
    return row;
  },
};

export const uid = (p = '') =>
  p + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
