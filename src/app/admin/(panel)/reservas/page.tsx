import { prisma } from "@/lib/prisma";
import { getBaseUrl } from "@/lib/url";
import CancelBookingButton from "@/components/admin/CancelBookingButton";
import CopyLinkBox from "@/components/admin/CopyLinkBox";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage() {
  const [bookings, baseUrl] = await Promise.all([
    prisma.booking.findMany({
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
      include: { lead: true },
    }),
    getBaseUrl(),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Reservas</h1>

      <div className="mb-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-white/80">
          Link directo para agendar (sin quiz)
        </h2>
        <p className="mt-1 text-sm text-white/50">
          Compártelo cuando quieras que alguien agende directamente, sin pasar
          por el quiz ni la oferta. Igual pide sus datos de contacto antes de
          mostrarle el calendario, así queda registrado en tus Leads como
          cualquier otro.
        </p>
        <div className="mt-3">
          <CopyLinkBox link={`${baseUrl}/agendar`} />
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-white/50 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Fecha</th>
              <th className="px-4 py-3 font-medium">Hora</th>
              <th className="px-4 py-3 font-medium">Lead</th>
              <th className="px-4 py-3 font-medium">Contacto</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Notas</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className="border-t border-white/5">
                <td className="px-4 py-3">{b.date}</td>
                <td className="px-4 py-3">
                  {b.startTime} - {b.endTime}
                </td>
                <td className="px-4 py-3">{b.lead.fullName}</td>
                <td className="px-4 py-3 text-white/60 text-xs">
                  {b.lead.email}
                  <br />+{b.lead.phoneDialCode} {b.lead.phoneNumber}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      b.status === "cancelled"
                        ? "bg-rose-500/15 text-rose-300"
                        : "bg-emerald-500/15 text-emerald-300"
                    }`}
                  >
                    {b.status === "cancelled" ? "Cancelada" : "Confirmada"}
                  </span>
                </td>
                <td className="px-4 py-3 text-white/50 text-xs max-w-[200px] truncate">
                  {b.notes || "—"}
                </td>
                <td className="px-4 py-3">
                  {b.status !== "cancelled" && <CancelBookingButton id={b.id} />}
                </td>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-white/40">
                  Aún no hay reservas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
