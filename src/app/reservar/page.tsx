import { redirect } from "next/navigation";
import { getLeadSession } from "@/lib/lead-session";
import { prisma } from "@/lib/prisma";
import { getSiteConfig } from "@/lib/config";
import { getAvailableDays } from "@/lib/availability";
import BookingCalendar from "@/components/BookingCalendar";

export const dynamic = "force-dynamic";

export default async function ReservarPage() {
  const session = await getLeadSession();
  if (!session) redirect("/");

  const [lead, config, availableDays] = await Promise.all([
    prisma.lead.findUnique({ where: { id: session.leadId } }),
    getSiteConfig(),
    getAvailableDays(60),
  ]);

  if (!lead) redirect("/");

  const firstName = lead.fullName.trim().split(/\s+/)[0];

  return (
    <div className="relative min-h-screen bg-[#0b0713] text-white overflow-x-hidden px-5 sm:px-10 py-12">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="animate-float-blob absolute -top-40 -left-32 h-[28rem] w-[28rem] rounded-full bg-[var(--brand-primary)]/20 blur-[120px]" />
      </div>
      <div className="relative z-10 max-w-3xl mx-auto">
        <BookingCalendar
          initialAvailableDays={availableDays}
          brand={config.brand}
          booking={config.booking}
          leadFirstName={firstName}
        />
      </div>
    </div>
  );
}
