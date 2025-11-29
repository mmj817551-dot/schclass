import { SLOTS } from '../constants/dicts.js';

// Format Date -> YYYY-MM-DD (local)
export function formatDate(date) {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDate(dateStr) {
  // Parse YYYY-MM-DD as local midnight
  const [y, m, d] = dateStr.split('-').map((v) => parseInt(v, 10));
  return new Date(y, (m || 1) - 1, d || 1, 0, 0, 0, 0);
}

// weekStart: 'monday' | 'sunday'
export function getWeekRange(dateStr, weekStart = 'monday') {
  const base = parseDate(dateStr);
  const day = base.getDay(); // 0(Sun)-6(Sat)
  const startDow = weekStart === 'sunday' ? 0 : 1;
  const diff = (day - startDow + 7) % 7; // days since week start
  const start = new Date(base);
  start.setDate(base.getDate() - diff);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { from: formatDate(start), to: formatDate(end) };
}

// Return deduped, sorted slots by date then slot order
export function normalizeSlots(slots = []) {
  const seen = new Set();
  const order = new Map(SLOTS.map((s, i) => [s, i]));
  const list = [];
  slots.forEach((s) => {
    if (!s || !s.date || !s.slot) return;
    const key = `${s.date}__${s.slot}`;
    if (seen.has(key)) return;
    seen.add(key);
    list.push({ date: s.date, slot: s.slot });
  });
  list.sort((a, b) => {
    if (a.date === b.date) return (order.get(a.slot) ?? 0) - (order.get(b.slot) ?? 0);
    return a.date < b.date ? -1 : 1;
  });
  return list;
}

export function groupByDate(slots = []) {
  const normalized = normalizeSlots(slots);
  const map = {};
  normalized.forEach(({ date, slot }) => {
    if (!map[date]) map[date] = [];
    map[date].push(slot);
  });
  return map;
}

// Get current month range or for a given date string YYYY-MM-DD
export function getMonthRange(dateStr) {
  const base = dateStr ? parseDate(dateStr) : new Date();
  const y = base.getFullYear();
  const m = base.getMonth();
  const start = new Date(y, m, 1);
  const end = new Date(y, m + 1, 0);
  return { from: formatDate(start), to: formatDate(end) };
}

// Expand continuous slots across days
// input: { startDate, startSlot, endDate, endSlot }
export function expandContinuousSlots({ startDate, startSlot, endDate, endSlot }) {
  if (!startDate || !startSlot || !endDate || !endSlot) return [];
  const order = new Map(SLOTS.map((s, i) => [s, i]));

  let sDate = startDate;
  let eDate = endDate;
  let sSlot = startSlot;
  let eSlot = endSlot;

  // normalize ordering
  if (sDate > eDate || (sDate === eDate && (order.get(sSlot) ?? 0) > (order.get(eSlot) ?? 0))) {
    sDate = endDate; eDate = startDate; sSlot = endSlot; eSlot = startSlot;
  }

  const out = [];
  const sIdx = order.get(sSlot) ?? 0;
  const eIdx = order.get(eSlot) ?? (SLOTS.length - 1);

  if (sDate === eDate) {
    for (let i = sIdx; i <= eIdx; i++) out.push({ date: sDate, slot: SLOTS[i] });
    return out;
  }

  // first day
  for (let i = sIdx; i < SLOTS.length; i++) out.push({ date: sDate, slot: SLOTS[i] });
  // middle days
  let cursor = parseDate(sDate);
  while (true) {
    cursor.setDate(cursor.getDate() + 1);
    const curStr = formatDate(cursor);
    if (curStr === eDate) break;
    for (let i = 0; i < SLOTS.length; i++) out.push({ date: curStr, slot: SLOTS[i] });
  }
  // last day
  for (let i = 0; i <= eIdx; i++) out.push({ date: eDate, slot: SLOTS[i] });

  return out;
}
