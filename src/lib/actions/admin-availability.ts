"use server";

import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";
import { availabilityRuleSchema, blockedDateSchema } from "@/lib/validation";
import { revalidatePath } from "next/cache";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function upsertAvailabilityRule(
  input: unknown
): Promise<ActionResult> {
  try {
    await requireAdminSession();
  } catch {
    return { ok: false, error: "No autorizado." };
  }

  const parsed = availabilityRuleSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Datos inválidos." };
  }
  const data = parsed.data;

  if (timeToMinutes(data.startTime) >= timeToMinutes(data.endTime)) {
    return { ok: false, error: "La hora de inicio debe ser antes que la de fin." };
  }

  if (data.id) {
    await prisma.availabilityRule.update({
      where: { id: data.id },
      data: {
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
        slotMinutes: data.slotMinutes,
        active: data.active,
      },
    });
  } else {
    await prisma.availabilityRule.create({
      data: {
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
        slotMinutes: data.slotMinutes,
        active: data.active,
      },
    });
  }

  revalidatePath("/admin/disponibilidad");
  return { ok: true };
}

export async function deleteAvailabilityRule(id: string): Promise<ActionResult> {
  try {
    await requireAdminSession();
  } catch {
    return { ok: false, error: "No autorizado." };
  }
  await prisma.availabilityRule.delete({ where: { id } });
  revalidatePath("/admin/disponibilidad");
  return { ok: true };
}

export async function addBlockedDate(input: unknown): Promise<ActionResult> {
  try {
    await requireAdminSession();
  } catch {
    return { ok: false, error: "No autorizado." };
  }

  const parsed = blockedDateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Fecha inválida." };
  }

  await prisma.blockedDate.upsert({
    where: { date: parsed.data.date },
    update: { reason: parsed.data.reason || null },
    create: { date: parsed.data.date, reason: parsed.data.reason || null },
  });

  revalidatePath("/admin/disponibilidad");
  return { ok: true };
}

export async function removeBlockedDate(id: string): Promise<ActionResult> {
  try {
    await requireAdminSession();
  } catch {
    return { ok: false, error: "No autorizado." };
  }
  await prisma.blockedDate.delete({ where: { id } });
  revalidatePath("/admin/disponibilidad");
  return { ok: true };
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}
