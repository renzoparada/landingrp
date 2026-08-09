"use server";

import { requireAdminSession } from "@/lib/auth";
import { saveSiteConfig } from "@/lib/config";
import type { SiteConfigData } from "@/lib/types";
import { revalidatePath } from "next/cache";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function updateSiteConfig(data: SiteConfigData): Promise<ActionResult> {
  try {
    await requireAdminSession();
  } catch {
    return { ok: false, error: "No autorizado." };
  }

  try {
    await saveSiteConfig(data);
  } catch (error) {
    console.error("Error guardando configuración:", error);
    return { ok: false, error: "No se pudo guardar la configuración." };
  }

  revalidatePath("/");
  revalidatePath("/oferta");
  revalidatePath("/reservar");
  revalidatePath("/admin/contenido");
  return { ok: true };
}
