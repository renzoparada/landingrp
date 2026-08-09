"use client";

import { useState } from "react";
import { exportLeadsCsv } from "@/lib/actions/admin-leads";

export default function ExportCsvButton() {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    const result = await exportLeadsCsv();
    setLoading(false);
    if (!result.ok) {
      alert(result.error);
      return;
    }
    const blob = new Blob([result.csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="rounded-full border border-white/15 px-4 py-2 text-sm font-medium hover:bg-white/5 disabled:opacity-50"
    >
      {loading ? "Generando..." : "⬇ Exportar CSV"}
    </button>
  );
}
