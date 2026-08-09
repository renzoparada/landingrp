"use server";

import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";

export async function exportLeadsCsv(): Promise<
  { ok: true; csv: string } | { ok: false; error: string }
> {
  try {
    await requireAdminSession();
  } catch {
    return { ok: false, error: "No autorizado." };
  }

  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      answers: { include: { question: true } },
      bookings: true,
    },
  });

  const header = [
    "Nombre completo",
    "Email",
    "Email verificado",
    "Teléfono",
    "Ciudad",
    "País",
    "Puntaje",
    "UTM Source",
    "UTM Medium",
    "UTM Campaign",
    "Cita agendada",
    "Fecha de registro",
    "Respuestas",
  ];

  const escapeCsv = (value: string) => `"${value.replace(/"/g, '""')}"`;

  const rows = leads.map((lead) => {
    const booking = lead.bookings.find((b) => b.status !== "cancelled");
    const answersText = lead.answers
      .map((a) => {
        const answer = Array.isArray(a.answer)
          ? (a.answer as string[]).join(" | ")
          : String(a.answer);
        return `${a.question.question}: ${answer}`;
      })
      .join(" ;; ");

    return [
      lead.fullName,
      lead.email,
      lead.emailVerified ? "Sí" : "No",
      `+${lead.phoneDialCode} ${lead.phoneNumber}`,
      lead.city,
      lead.country,
      String(lead.score),
      lead.utmSource ?? "",
      lead.utmMedium ?? "",
      lead.utmCampaign ?? "",
      booking ? `${booking.date} ${booking.startTime}` : "",
      lead.createdAt.toISOString(),
      answersText,
    ]
      .map(escapeCsv)
      .join(",");
  });

  const csv = [header.map(escapeCsv).join(","), ...rows].join("\n");
  return { ok: true, csv };
}
