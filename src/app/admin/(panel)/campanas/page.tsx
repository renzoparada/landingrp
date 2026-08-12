import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getBaseUrl } from "@/lib/url";
import CampaignsTable, { type CampaignRow } from "@/components/admin/CampaignsTable";

export const dynamic = "force-dynamic";

export default async function AdminCampaignsPage() {
  const [campaigns, baseUrl] = await Promise.all([
    prisma.campaign.findMany({ orderBy: { createdAt: "desc" } }),
    getBaseUrl(),
  ]);

  const leadCounts = await prisma.lead.groupBy({
    by: ["utmCampaign"],
    _count: { _all: true },
  });
  const leadCountBySlug = new Map(
    leadCounts.map((c) => [c.utmCampaign, c._count._all])
  );

  const rows: CampaignRow[] = campaigns.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    active: c.active,
    link: `${baseUrl}/?utm_campaign=${c.slug}`,
    leadCount: leadCountBySlug.get(c.slug) ?? 0,
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold">Campañas</h1>
        <Link
          href="/admin/campanas/nueva"
          className="rounded-full bg-violet-600 px-5 py-2.5 text-sm font-semibold hover:bg-violet-500"
        >
          + Nueva campaña
        </Link>
      </div>
      <p className="text-sm text-white/50 mb-6">
        Crea una campaña por cada oferta que quieras correr (ventas, coaching,
        talleres...). Cada una tiene su propia landing de oferta y su propio
        link para compartir — así puedes medir los resultados por separado
        aunque corran al mismo tiempo.
      </p>
      <CampaignsTable campaigns={rows} />
    </div>
  );
}
