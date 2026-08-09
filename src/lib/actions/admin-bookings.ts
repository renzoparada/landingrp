"use server";

import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function cancelBooking(id: string): Promise<ActionResult> {
  try {
    await requireAdminSession();
  } catch {
    return { ok: false, error: "No autorizado." };
  }

  await prisma.booking.update({ where: { id }, data: { status: "cancelled" } });
  revalidatePath("/admin/reservas");
  return { ok: true };
}
