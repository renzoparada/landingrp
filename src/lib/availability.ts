import { prisma } from "@/lib/prisma";

export interface DaySlots {
  date: string; // "2026-08-20"
  slots: string[]; // ["09:00", "09:30", ...]
}

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60)
    .toString()
    .padStart(2, "0");
  const m = (mins % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

/** Returns "YYYY-MM-DD" for a Date, using local (server) time. */
export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const d = date.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Computes the bookable time slots for a given date, based on the weekly
 * AvailabilityRule for that weekday, minus BlockedDate (full-day block) and
 * minus already-booked slots.
 */
export async function getSlotsForDate(dateKey: string): Promise<string[]> {
  const date = new Date(`${dateKey}T00:00:00`);
  if (Number.isNaN(date.getTime())) return [];

  const dayOfWeek = date.getDay();

  const [rules, blocked, bookings] = await Promise.all([
    prisma.availabilityRule.findMany({
      where: { dayOfWeek, active: true },
    }),
    prisma.blockedDate.findUnique({ where: { date: dateKey } }),
    prisma.booking.findMany({
      where: { date: dateKey, status: { not: "cancelled" } },
      select: { startTime: true },
    }),
  ]);

  if (blocked || rules.length === 0) return [];

  const bookedSet = new Set(bookings.map((b) => b.startTime));

  const slots: string[] = [];
  for (const rule of rules) {
    const start = timeToMinutes(rule.startTime);
    const end = timeToMinutes(rule.endTime);
    for (let t = start; t + rule.slotMinutes <= end; t += rule.slotMinutes) {
      const slot = minutesToTime(t);
      if (!bookedSet.has(slot)) slots.push(slot);
    }
  }

  // Filter out slots in the past if the requested date is today.
  const now = new Date();
  if (toDateKey(now) === dateKey) {
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    return Array.from(new Set(slots))
      .filter((s) => timeToMinutes(s) > nowMinutes)
      .sort();
  }

  return Array.from(new Set(slots)).sort();
}

/** Returns the slot length (minutes) that applies to a given date + start time. */
export async function getSlotDuration(
  dateKey: string,
  startTime: string
): Promise<number> {
  const date = new Date(`${dateKey}T00:00:00`);
  const dayOfWeek = date.getDay();
  const rules = await prisma.availabilityRule.findMany({
    where: { dayOfWeek, active: true },
  });
  const t = timeToMinutes(startTime);
  for (const rule of rules) {
    if (t >= timeToMinutes(rule.startTime) && t < timeToMinutes(rule.endTime)) {
      return rule.slotMinutes;
    }
  }
  return 30;
}

/** Days (as YYYY-MM-DD) within [from, from+daysAhead] that have at least one open slot. */
export async function getAvailableDays(
  daysAhead = 30
): Promise<{ date: string; hasSlots: boolean }[]> {
  const results: { date: string; hasSlots: boolean }[] = [];
  const today = new Date();

  const rules = await prisma.availabilityRule.findMany({
    where: { active: true },
  });
  const activeDays = new Set(rules.map((r) => r.dayOfWeek));

  const blockedDates = await prisma.blockedDate.findMany({
    select: { date: true },
  });
  const blockedSet = new Set(blockedDates.map((b) => b.date));

  for (let i = 0; i <= daysAhead; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const key = toDateKey(d);
    const hasSlots = activeDays.has(d.getDay()) && !blockedSet.has(key);
    results.push({ date: key, hasSlots });
  }

  return results;
}
