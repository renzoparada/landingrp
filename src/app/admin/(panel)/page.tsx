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

export default async function AdminDashboardPage() {
  const [totalLeads, verifiedLeads, totalBookings, upcomingBookings, recentLeads] =
    await Promise.all([
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
    ]);

  const verifiedRate = totalLeads > 0 ? Math.round((verifiedLeads / totalLeads) * 100) : 0;

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

      <h2 className="text-lg font-semibold mb-3">Últimos leads</h2>
      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-white/50 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">País</th>
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
                <td className="px-4 py-3 text-white/60">{lead.score}</td>
                <td className="px-4 py-3 text-white/40">
                  {formatDateTime(lead.createdAt)}
                </td>
              </tr>
            ))}
            {recentLeads.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-white/40">
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
