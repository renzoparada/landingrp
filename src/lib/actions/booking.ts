"use server";

import { prisma } from "@/lib/prisma";
import { bookingSubmitSchema } from "@/lib/validation";
import { getLeadSession } from "@/lib/lead-session";
import {
  getSlotsForDate,
  getSlotDuration,
  timeToMinutes,
  getAvailableDays,
} from "@/lib/availability";
import { sendEmail, bookingConfirmationTemplate } from "@/lib/email";
import { getSiteConfig } from "@/lib/config";
import { revalidatePath } from "next/cache";

export async function getSlotsAction(date: string) {
  return getSlotsForDate(date);
}

export async function getAvailableDaysAction(daysAhead = 45) {
  return getAvailableDays(daysAhead);
}

export type SubmitBookingResult =
  | {
      ok: true;
      booking: { date: string; startTime: string; endTime: string; timezone: string };
    }
  | { ok: false; error: string };

export async function submitBooking(input: {
  date: string;
  startTime: string;
  notes?: string;
}): Promise<SubmitBookingResult> {
  const parsed = bookingSubmitSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Datos inválidos." };
  }

  const session = await getLeadSession();
  if (!session) {
    return {
      ok: false,
      error: "Tu sesión expiró. Vuelve a completar el formulario inicial.",
    };
  }

  const lead = await prisma.lead.findUnique({ where: { id: session.leadId } });
  if (!lead) {
    return { ok: false, error: "No encontramos tu registro. Intenta de nuevo." };
  }

  const { date, startTime, notes } = parsed.data;

  const freeSlots = await getSlotsForDate(date);
  if (!freeSlots.includes(startTime)) {
    return {
      ok: false,
      error: "Ese horario ya no está disponible. Elige otro, por favor.",
    };
  }

  const slotMinutes = await getSlotDuration(date, startTime);
  const endTime = minutesToTime(timeToMinutes(startTime) + slotMinutes);
  const config = await getSiteConfig();

  let booking;
  try {
    booking = await prisma.booking.create({
      data: {
        leadId: lead.id,
        date,
        startTime,
        endTime,
        timezone: config.booking.timezone,
        notes: notes || undefined,
      },
    });
  } catch (error) {
    console.error("Error creando reserva:", error);
    return {
      ok: false,
      error: "Ese horario acaba de ser tomado. Elige otro disponible.",
    };
  }

  sendEmail({
    to: lead.email,
    subject: `Cita confirmada — ${config.brand.name}`,
    html: bookingConfirmationTemplate({
      fullName: lead.fullName,
      brandName: config.brand.name,
      primaryColor: config.brand.primaryColor,
      dateLabel: date,
      timeLabel: `${startTime} - ${endTime}`,
      timezone: config.booking.timezone,
    }),
  }).catch((e) => console.error("Error enviando email de confirmación:", e));

  revalidatePath("/admin/reservas");

  return {
    ok: true,
    booking: {
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime,
      timezone: booking.timezone,
    },
  };
}

function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60)
    .toString()
    .padStart(2, "0");
  const m = (mins % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}
