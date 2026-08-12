"use client";

import { Fragment, useMemo, useState } from "react";
import { formatDateTime } from "@/lib/format";

export interface LeadRow {
  id: string;
  fullName: string;
  email: string;
  emailVerified: boolean;
  phoneDialCode: string;
  phoneNumber: string;
  city: string;
  country: string;
  score: number;
  utmSource: string | null;
  utmCampaign: string | null;
  campaignName: string | null;
  createdAt: string;
  answers: { question: string; answer: string }[];
  booking: { date: string; startTime: string } | null;
}

export default function LeadsTable({ leads }: { leads: LeadRow[] }) {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return leads;
    return leads.filter(
      (l) =>
        l.fullName.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        l.city.toLowerCase().includes(q) ||
        l.country.toLowerCase().includes(q)
    );
  }, [leads, query]);

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar por nombre, correo o ciudad..."
        className="mb-4 w-full max-w-sm rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500"
      />

      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-white/50 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Lead</th>
              <th className="px-4 py-3 font-medium">Contacto</th>
              <th className="px-4 py-3 font-medium">Ubicación</th>
              <th className="px-4 py-3 font-medium">Campaña</th>
              <th className="px-4 py-3 font-medium">Origen</th>
              <th className="px-4 py-3 font-medium">Cita</th>
              <th className="px-4 py-3 font-medium">Puntaje</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((lead) => (
              <Fragment key={lead.id}>
                <tr
                  onClick={() =>
                    setExpanded(expanded === lead.id ? null : lead.id)
                  }
                  className="border-t border-white/5 cursor-pointer hover:bg-white/[0.03]"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium">{lead.fullName}</div>
                    <div className="text-xs text-white/40">
                      {formatDateTime(lead.createdAt)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-white/60">
                    <div>
                      {lead.email}{" "}
                      {lead.emailVerified ? (
                        <span className="text-emerald-400">✓ verificado</span>
                      ) : (
                        <span className="text-amber-400">pendiente</span>
                      )}
                    </div>
                    <div className="text-xs text-white/40">
                      +{lead.phoneDialCode} {lead.phoneNumber}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-white/60">
                    {lead.city}, {lead.country}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {lead.campaignName ? (
                      <span className="rounded-full bg-sky-500/15 text-sky-300 px-2.5 py-1 font-medium">
                        {lead.campaignName}
                      </span>
                    ) : (
                      <span className="text-white/30">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-white/60 text-xs">
                    {lead.utmSource || "—"}
                  </td>
                  <td className="px-4 py-3 text-white/60 text-xs">
                    {lead.booking
                      ? `${lead.booking.date} ${lead.booking.startTime}`
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-violet-500/15 text-violet-300 px-2.5 py-1 text-xs font-semibold">
                      {lead.score}
                    </span>
                  </td>
                </tr>
                {expanded === lead.id && (
                  <tr className="border-t border-white/5 bg-white/[0.02]">
                    <td colSpan={7} className="px-4 py-4">
                      {lead.answers.length === 0 ? (
                        <p className="text-white/40 text-xs">
                          Sin respuestas del quiz.
                        </p>
                      ) : (
                        <ul className="space-y-1.5">
                          {lead.answers.map((a, i) => (
                            <li key={i} className="text-xs text-white/70">
                              <span className="text-white/40">{a.question}:</span>{" "}
                              {a.answer}
                            </li>
                          ))}
                        </ul>
                      )}
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-white/40">
                  No se encontraron leads.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
