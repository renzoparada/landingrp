import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma";
import { defaultSiteConfig, type SiteConfigData } from "@/lib/types";

/**
 * Deep-merges saved config on top of defaults so newly added fields (from
 * app updates) always have a sane fallback even if the DB row predates them.
 */
function mergeConfig(saved: unknown): SiteConfigData {
  const base = structuredClone(defaultSiteConfig);
  if (!saved || typeof saved !== "object") return base;
  return deepMerge(base, saved as Record<string, unknown>) as SiteConfigData;
}

function deepMerge<T>(target: T, source: Record<string, unknown>): T {
  if (Array.isArray(target)) {
    // Arrays (benefits, testimonials, faqs) are replaced wholesale when present.
    return (source as unknown as T) ?? target;
  }
  const output: Record<string, unknown> = { ...(target as Record<string, unknown>) };
  for (const key of Object.keys(source ?? {})) {
    const sourceVal = source[key];
    const targetVal = (target as Record<string, unknown>)[key];
    if (
      sourceVal &&
      typeof sourceVal === "object" &&
      !Array.isArray(sourceVal) &&
      targetVal &&
      typeof targetVal === "object" &&
      !Array.isArray(targetVal)
    ) {
      output[key] = deepMerge(targetVal, sourceVal as Record<string, unknown>);
    } else if (sourceVal !== undefined) {
      output[key] = sourceVal;
    }
  }
  return output as T;
}

export async function getSiteConfig(): Promise<SiteConfigData> {
  try {
    const row = await prisma.siteConfig.findUnique({ where: { id: "main" } });
    return mergeConfig(row?.data);
  } catch (error) {
    // Falls back to defaults when the DB isn't reachable yet (e.g. during a
    // build/static-generation pass before DATABASE_URL is configured) so the
    // app can still build and render instead of hard-failing.
    console.error("No se pudo leer la configuración del sitio:", error);
    return structuredClone(defaultSiteConfig);
  }
}

export async function saveSiteConfig(data: SiteConfigData) {
  const jsonData = data as unknown as Prisma.InputJsonValue;
  await prisma.siteConfig.upsert({
    where: { id: "main" },
    update: { data: jsonData },
    create: { id: "main", data: jsonData },
  });
}
