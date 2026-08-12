"use server";

import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";
import { campaignSchema, type CampaignInput } from "@/lib/validation";
import { getBaseUrl } from "@/lib/url";
import { revalidatePath } from "next/cache";
import type { Prisma } from "@/generated/prisma";

export type CampaignActionResult =
  | { ok: true; id: string; slug: string; link: string }
  | { ok: false; error: string };

export async function saveCampaign(
  input: CampaignInput
): Promise<CampaignActionResult> {
  try {
    await requireAdminSession();
  } catch {
    return { ok: false, error: "No autorizado." };
  }

  const parsed = campaignSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }
  const data = parsed.data;

  // The slug becomes the ?utm_campaign=<slug> value, so it must be unique.
  const existingWithSlug = await prisma.campaign.findUnique({
    where: { slug: data.slug },
  });
  if (existingWithSlug && existingWithSlug.id !== data.id) {
    return {
      ok: false,
      error: `Ya existe una campaña con el link "${data.slug}". Elige otro nombre.`,
    };
  }

  const campaignData = {
    hero: data.hero,
    offer: data.offer,
  } as unknown as Prisma.InputJsonValue;

  try {
    const campaign = data.id
      ? await prisma.campaign.update({
          where: { id: data.id },
          data: {
            name: data.name,
            slug: data.slug,
            active: data.active,
            data: campaignData,
          },
        })
      : await prisma.campaign.create({
          data: {
            name: data.name,
            slug: data.slug,
            active: data.active,
            data: campaignData,
          },
        });

    revalidatePath("/admin/campanas");
    revalidatePath("/oferta");

    const baseUrl = await getBaseUrl();
    return {
      ok: true,
      id: campaign.id,
      slug: campaign.slug,
      link: `${baseUrl}/?utm_campaign=${campaign.slug}`,
    };
  } catch (error) {
    console.error("Error guardando campaña:", error);
    return { ok: false, error: "No se pudo guardar la campaña." };
  }
}

export async function deleteCampaign(
  id: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await requireAdminSession();
  } catch {
    return { ok: false, error: "No autorizado." };
  }

  try {
    await prisma.campaign.delete({ where: { id } });
  } catch (error) {
    console.error("Error eliminando campaña:", error);
    return { ok: false, error: "No se pudo eliminar la campaña." };
  }

  revalidatePath("/admin/campanas");
  revalidatePath("/oferta");
  return { ok: true };
}

export async function toggleCampaignActive(
  id: string,
  active: boolean
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await requireAdminSession();
  } catch {
    return { ok: false, error: "No autorizado." };
  }

  try {
    await prisma.campaign.update({ where: { id }, data: { active } });
  } catch (error) {
    console.error("Error actualizando campaña:", error);
    return { ok: false, error: "No se pudo actualizar la campaña." };
  }

  revalidatePath("/admin/campanas");
  revalidatePath("/oferta");
  return { ok: true };
}
