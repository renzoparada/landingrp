"use client";

import { useState } from "react";
import Link from "next/link";
import { deleteCampaign, toggleCampaignActive } from "@/lib/actions/campaigns";

export interface CampaignRow {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  link: string;
  leadCount: number;
}

export default function CampaignsTable({ campaigns }: { campaigns: CampaignRow[] }) {
  const [rows, setRows] = useState(campaigns);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function handleCopy(row: CampaignRow) {
    try {
      await navigator.clipboard.writeText(row.link);
      setCopiedId(row.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Clipboard permission can fail silently — the link is also shown as
      // plain text in the row so it can be copied manually.
    }
  }

  async function handleToggle(row: CampaignRow) {
    setBusyId(row.id);
    const result = await toggleCampaignActive(row.id, !row.active);
    setBusyId(null);
    if (result.ok) {
      setRows((prev) =>
        prev.map((r) => (r.id === row.id ? { ...r, active: !r.active } : r))
      );
    }
  }

  async function handleDelete(row: CampaignRow) {
    if (
      !confirm(
        `¿Eliminar la campaña "${row.name}"? Los leads que llegaron por este link se conservan, solo se borra la campaña.`
      )
    )
      return;
    setBusyId(row.id);
    const result = await deleteCampaign(row.id);
    setBusyId(null);
    if (result.ok) {
      setRows((prev) => prev.filter((r) => r.id !== row.id));
    }
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center text-white/40">
        Aún no has creado ninguna campaña.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10">
      <table className="w-full text-sm">
        <thead className="bg-white/5 text-white/50 text-left">
          <tr>
            <th className="px-4 py-3 font-medium">Campaña</th>
            <th className="px-4 py-3 font-medium">Link</th>
            <th className="px-4 py-3 font-medium">Leads</th>
            <th className="px-4 py-3 font-medium">Estado</th>
            <th className="px-4 py-3 font-medium text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-t border-white/5">
              <td className="px-4 py-3 font-medium">{row.name}</td>
              <td className="px-4 py-3 text-white/50 font-mono text-xs">
                ?utm_campaign={row.slug}
              </td>
              <td className="px-4 py-3 text-white/60">{row.leadCount}</td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    row.active
                      ? "bg-emerald-500/15 text-emerald-300"
                      : "bg-white/10 text-white/40"
                  }`}
                >
                  {row.active ? "Activa" : "Pausada"}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-2 flex-wrap">
                  <button
                    onClick={() => handleCopy(row)}
                    className="rounded-full bg-violet-600/20 text-violet-300 px-3 py-1.5 text-xs font-medium hover:bg-violet-600/30"
                  >
                    {copiedId === row.id ? "¡Copiado! ✓" : "Copiar link"}
                  </button>
                  <Link
                    href={`/admin/campanas/${row.id}`}
                    className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium hover:bg-white/20"
                  >
                    Editar
                  </Link>
                  <button
                    disabled={busyId === row.id}
                    onClick={() => handleToggle(row)}
                    className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium hover:bg-white/20 disabled:opacity-40"
                  >
                    {row.active ? "Pausar" : "Activar"}
                  </button>
                  <button
                    disabled={busyId === row.id}
                    onClick={() => handleDelete(row)}
                    className="rounded-full bg-rose-500/15 text-rose-300 px-3 py-1.5 text-xs font-medium hover:bg-rose-500/25 disabled:opacity-40"
                  >
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
