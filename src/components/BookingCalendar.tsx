"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isBefore,
  isSameMonth,
  startOfDay,
  startOfMonth,
} from "date-fns";
import { es } from "date-fns/locale";
import {
  getAvailableDaysAction,
  getSlotsAction,
  submitBooking,
} from "@/lib/actions/booking";

interface BookingCalendarProps {
  initialAvailableDays: { date: string; hasSlots: boolean }[];
  brand: { name: string; primaryColor: string; secondaryColor: string };
  booking: {
    title: string;
    subtitle: string;
    timezone: string;
    meetingDurationLabel: string;
    confirmationMessage: string;
  };
  leadFirstName: string;
}

const WEEKDAY_LABELS = ["D", "L", "M", "M", "J", "V", "S"];

export default function BookingCalendar({
  initialAvailableDays,
  brand,
  booking,
  leadFirstName,
}: BookingCalendarProps) {
  const [availableDays, setAvailableDays] = useState(initialAvailableDays);
  const [monthCursor, setMonthCursor] = useState(() =>
    startOfMonth(new Date())
  );
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<{
    date: string;
    startTime: string;
    endTime: string;
  } | null>(null);

  useEffect(() => {
    getAvailableDaysAction(60).then(setAvailableDays).catch(() => {});
  }, []);

  const availabilityMap = useMemo(() => {
    const map = new Map<string, boolean>();
    for (const d of availableDays) map.set(d.date, d.hasSlots);
    return map;
  }, [availableDays]);

  const maxDate = useMemo(() => {
    const last = availableDays[availableDays.length - 1]?.date;
    return last ? new Date(`${last}T00:00:00`) : addMonths(new Date(), 2);
  }, [availableDays]);

  const daysInGrid = useMemo(() => {
    const start = startOfMonth(monthCursor);
    const end = endOfMonth(monthCursor);
    const days = eachDayOfInterval({ start, end });
    const leadingBlanks = getDay(start);
    return { days, leadingBlanks };
  }, [monthCursor]);

  async function pickDate(dateKey: string) {
    setSelectedDate(dateKey);
    setSelectedTime(null);
    setError(null);
    setLoadingSlots(true);
    try {
      const result = await getSlotsAction(dateKey);
      setSlots(result);
    } finally {
      setLoadingSlots(false);
    }
  }

  async function confirmBooking() {
    if (!selectedDate || !selectedTime) return;
    setSubmitting(true);
    setError(null);
    const result = await submitBooking({
      date: selectedDate,
      startTime: selectedTime,
      notes: notes.trim() || undefined,
    });
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setConfirmed(result.booking);
  }

  const brandVars = {
    ["--brand-primary" as string]: brand.primaryColor,
    ["--brand-secondary" as string]: brand.secondaryColor,
  };

  if (confirmed) {
    const icsUrl = buildIcsDataUri(confirmed, brand.name, booking.timezone);
    return (
      <div style={brandVars} className="animate-fade-up text-center max-w-md mx-auto">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-3xl">
          ✅
        </div>
        <h2 className="mt-5 text-2xl font-bold text-white">
          {booking.confirmationMessage}
        </h2>
        <p className="mt-3 rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-white/80">
          {formatFullDate(confirmed.date)}
          <br />
          <span className="font-semibold text-white">
            {confirmed.startTime} - {confirmed.endTime}
          </span>{" "}
          ({booking.timezone})
        </p>
        <a
          href={icsUrl}
          download="entrevista.ics"
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-white hover:bg-white/5"
        >
          📅 Añadir a mi calendario
        </a>
      </div>
    );
  }

  return (
    <div style={brandVars} className="animate-fade-up">
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          {booking.title}
        </h1>
        <p className="mt-2 text-white/60 text-sm">
          {leadFirstName}, {booking.subtitle.toLowerCase()}
        </p>
        <p className="mt-1 text-xs text-white/40">
          {booking.meetingDurationLabel} · Zona horaria: {booking.timezone}
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Calendar */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setMonthCursor((m) => addMonths(m, -1))}
              disabled={isSameMonth(monthCursor, new Date())}
              className="rounded-full h-8 w-8 flex items-center justify-center text-white/60 hover:bg-white/10 disabled:opacity-20"
              aria-label="Mes anterior"
            >
              ‹
            </button>
            <span className="font-semibold text-white capitalize">
              {format(monthCursor, "MMMM yyyy", { locale: es })}
            </span>
            <button
              onClick={() => setMonthCursor((m) => addMonths(m, 1))}
              disabled={isBefore(maxDate, addMonths(monthCursor, 1))}
              className="rounded-full h-8 w-8 flex items-center justify-center text-white/60 hover:bg-white/10 disabled:opacity-20"
              aria-label="Mes siguiente"
            >
              ›
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-white/40 mb-1">
            {WEEKDAY_LABELS.map((d, i) => (
              <div key={i}>{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: daysInGrid.leadingBlanks }).map((_, i) => (
              <div key={`blank-${i}`} />
            ))}
            {daysInGrid.days.map((day) => {
              const key = format(day, "yyyy-MM-dd");
              const isPast = isBefore(startOfDay(day), startOfDay(new Date()));
              const available = !isPast && availabilityMap.get(key);
              const isSelected = selectedDate === key;
              return (
                <button
                  key={key}
                  disabled={!available}
                  onClick={() => pickDate(key)}
                  className={`aspect-square rounded-lg text-sm transition ${
                    isSelected
                      ? "bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-secondary)] text-white font-semibold"
                      : available
                        ? "bg-white/5 text-white hover:bg-white/15"
                        : "text-white/20 cursor-not-allowed"
                  }`}
                >
                  {format(day, "d")}
                </button>
              );
            })}
          </div>
        </div>

        {/* Time slots */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          {!selectedDate && (
            <p className="text-white/50 text-sm h-full flex items-center justify-center text-center py-10">
              Selecciona un día disponible para ver los horarios.
            </p>
          )}
          {selectedDate && (
            <>
              <p className="font-medium text-white mb-3 capitalize">
                {formatFullDate(selectedDate)}
              </p>
              {loadingSlots && (
                <p className="text-white/50 text-sm">Cargando horarios...</p>
              )}
              {!loadingSlots && slots.length === 0 && (
                <p className="text-white/50 text-sm">
                  No hay horarios disponibles para este día.
                </p>
              )}
              {!loadingSlots && slots.length > 0 && (
                <div className="grid grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1 scrollbar-none">
                  {slots.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => setSelectedTime(slot)}
                      className={`rounded-lg py-2.5 text-sm transition ${
                        selectedTime === slot
                          ? "bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-secondary)] text-white font-semibold"
                          : "bg-white/5 text-white hover:bg-white/15"
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              )}

              {selectedTime && (
                <div className="mt-5 space-y-3">
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="¿Algo que quieras contarnos antes de la llamada? (opcional)"
                    rows={2}
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                  />
                  {error && (
                    <p className="rounded-lg bg-rose-500/10 border border-rose-500/30 px-4 py-2 text-sm text-rose-300">
                      {error}
                    </p>
                  )}
                  <button
                    onClick={confirmBooking}
                    disabled={submitting}
                    className="w-full rounded-full bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] py-3 text-sm font-semibold text-white transition disabled:opacity-50 hover:scale-[1.01] active:scale-95"
                  >
                    {submitting
                      ? "Agendando..."
                      : `Confirmar ${selectedDate ? formatShortDate(selectedDate) : ""} · ${selectedTime}`}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function formatFullDate(dateKey: string) {
  return format(new Date(`${dateKey}T00:00:00`), "EEEE d 'de' MMMM", {
    locale: es,
  });
}

function formatShortDate(dateKey: string) {
  return format(new Date(`${dateKey}T00:00:00`), "d MMM", { locale: es });
}

function buildIcsDataUri(
  booking: { date: string; startTime: string; endTime: string },
  brandName: string,
  timezone: string
) {
  const start = `${booking.date.replace(/-/g, "")}T${booking.startTime.replace(":", "")}00`;
  const end = `${booking.date.replace(/-/g, "")}T${booking.endTime.replace(":", "")}00`;
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//" + brandName + "//ES",
    "BEGIN:VEVENT",
    `UID:${booking.date}-${booking.startTime}@landingrp`,
    `SUMMARY:Entrevista con ${brandName}`,
    `DESCRIPTION:Zona horaria: ${timezone}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  return `data:text/calendar;charset=utf8,${encodeURIComponent(ics)}`;
}
