import { prisma } from "@/lib/prisma";
import LeadsTable, { type LeadRow } from "@/components/admin/LeadsTable";
import ExportCsvButton from "@/components/admin/ExportCsvButton";

export const dynamic = "force-dynamic";

export default async function AdminLeadsPage() {
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      answers: { include: { question: true } },
      bookings: { where: { status: { not: "cancelled" } }, take: 1 },
    },
  });

  const rows: LeadRow[] = leads.map((lead) => ({
    id: lead.id,
    fullName: lead.fullName,
    email: lead.email,
    emailVerified: lead.emailVerified,
    phoneDialCode: lead.phoneDialCode,
    phoneNumber: lead.phoneNumber,
    city: lead.city,
    country: lead.country,
    score: lead.score,
    utmSource: lead.utmSource,
    utmCampaign: lead.utmCampaign,
    createdAt: lead.createdAt.toISOString(),
    answers: lead.answers.map((a) => ({
      question: a.question.question,
      answer: Array.isArray(a.answer)
        ? (a.answer as string[]).join(", ")
        : String(a.answer),
    })),
    booking: lead.bookings[0]
      ? { date: lead.bookings[0].date, startTime: lead.bookings[0].startTime }
      : null,
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Leads</h1>
        <ExportCsvButton />
      </div>
      <LeadsTable leads={rows} />
    </div>
  );
}
