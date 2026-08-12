import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <p className="text-xs uppercase tracking-wide text-white/40">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
      {hint && <p className="mt-1 text-xs text-white/40">{hint}</p>}
    </div>
  );
}

interface CampaignStat {
  campaign: string;
  source: string;
  leads: number;
  verified: number;
  bookings: number;
}

export default async function AdminDashboardPage() {
  const [
    totalLeads,
    verifiedLeads,
    totalBookings,
    upcomingBookings,
    recentLeads,
    campaignLeads,
    campaigns,
  ] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({ where: { emailVerified: true } }),
    prisma.booking.count({ where: { status: { not: "cancelled" } } }),
    prisma.booking.count({
      where: {
        status: { not: "cancelled" },
        date: { gte: new Date().toISOString().slice(0, 10) },
      },
    }),
    prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.lead.findMany({
      select: {
        utmCampaign: true,
        utmSource: true,
        emailVerified: true,
        bookings: { where: { status: { not: "cancelled" } }, select: { id: true } },
      },
    }),
    prisma.campaign.findMany({ select: { slug: true, name: true } }),
  ]);

  const verifiedRate = totalLeads > 0 ? Math.round((verifiedLeads / totalLeads) * 100) : 0;

  // Leads store the raw ?utm_campaign=<slug>; resolve it to the campaign's
  // display name so the table shows "Ventas" instead of just "ventas".
  const campaignNameBySlug = new Map(campaigns.map((c) => [c.slug, c.name]));

  // Agrupa los leads por campaña (utm_campaign) para medir el rendimiento
  // de cada anuncio/link que se está corriendo en simultáneo.
  const campaignMap = new Map<string, CampaignStat>();
  for (const lead of campaignLeads) {
    const key = lead.utmCampaign || "Sin campaña";
    const existing = campaignMap.get(key) ?? {
      campaign: key,
      source: lead.utmSource || "—",
      leads: 0,
      verified: 0,
      bookings: 0,
    };
    existing.leads += 1;
    if (lead.emailVerified) existing.verified += 1;
    if (lead.bookings.length > 0) existing.bookings += 1;
    campaignMap.set(key, existing);
  }
  const campaignStats = Array.from(campaignMap.values()).sort((a, b) => b.leads - a.leads);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Resumen</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard label="Leads totales" value={String(totalLeads)} />
        <StatCard
          label="Correos verificados"
          value={`${verifiedRate}%`}
          hint={`${verifiedLeads} de ${totalLeads}`}
        />
        <StatCard label="Citas agendadas" value={String(totalBookings)} />
        <StatCard label="Citas próximas" value={String(upcomingBookings)} />
      </div>

      <h2 className="text-lg font-semibold mb-3">Rendimiento por campaña</h2>
      <p className="text-xs text-white/40 mb-3">
        Cada link que compartes con un <code>?utm_campaign=nombre</code> distinto
        se mide por separado aquí, aunque corran al mismo tiempo.
      </p>
      <div className="overflow-x-auto rounded-2xl border border-white/10 mb-10">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-white/50 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Campaña</th>
              <th className="px-4 py-3 font-medium">Origen</th>
              <th className="px-4 py-3 font-medium">Leads</th>
              <th className="px-4 py-3 font-medium">Verificados</th>
              <th className="px-4 py-3 font-medium">Citas agendadas</th>
              <th className="px-4 py-3 font-medium">Conversión</th>
            </tr>
          </thead>
          <tbody>
            {campaignStats.map((c) => (
              <tr key={c.campaign} className="border-t border-white/5">
                <td className="px-4 py-3 font-medium">{c.campaign}</td>
                <td className="px-4 py-3 text-white/60">{c.source}</td>
                <td className="px-4 py-3 text-white/60">{c.leads}</td>
                <td className="px-4 py-3 text-white/60">{c.verified}</td>
                <td className="px-4 py-3 text-white/60">{c.bookings}</td>
                <td className="px-4 py-3 text-white/60">
                  {c.leads > 0 ? Math.round((c.bookings / c.leads) * 100) : 0}%
                </td>
              </tr>
            ))}
            {campaignStats.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-white/40">
                  Aún no hay leads con campañas registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <h2 className="text-lg font-semibold mb-3">Últimos leads</h2>
      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-white/50 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">País</th>
              <th className="px-4 py-3 font-medium">Campaña</th>
              <th className="px-4 py-3 font-medium">Puntaje</th>
              <th className="px-4 py-3 font-medium">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {recentLeads.map((lead) => (
              <tr key={lead.id} className="border-t border-white/5">
                <td className="px-4 py-3">{lead.fullName}</td>
                <td className="px-4 py-3 text-white/60">
                  {lead.email}{" "}
                  {lead.emailVerified ? (
                    <span className="text-emerald-400">✓</span>
                  ) : (
                    <span className="text-white/30">·</span>
                  )}
                </td>
                <td className="px-4 py-3 text-white/60">{lead.country}</td>
                <td className="px-4 py-3 text-xs">
                  {lead.utmCampaign ? (
                    <span className="rounded-full bg-sky-500/15 text-sky-300 px-2.5 py-1 font-medium">
                      {campaignNameBySlug.get(lead.utmCampaign) ?? lead.utmCampaign}
                    </span>
                  ) : (
                    <span className="text-white/30">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-white/60">{lead.score}</td>
                <td className="px-4 py-3 text-white/40">
                  {formatDateTime(lead.createdAt)}
                </td>
              </tr>
            ))}
            {recentLeads.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-white/40">
                  Aún no hay leads registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
