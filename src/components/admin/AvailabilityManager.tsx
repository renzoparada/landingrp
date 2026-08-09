"use client";

import { useState } from "react";
import {
  upsertAvailabilityRule,
  deleteAvailabilityRule,
  addBlockedDate,
  removeBlockedDate,
} from "@/lib/actions/admin-availability";

const DAY_LABELS = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

export interface RuleRow {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotMinutes: number;
  active: boolean;
}

export interface BlockedRow {
  id: string;
  date: string;
  reason: string | null;
}

export default function AvailabilityManager({
  initialRules,
  initialBlocked,
}: {
  initialRules: RuleRow[];
  initialBlocked: BlockedRow[];
}) {
  const [rules, setRules] = useState(initialRules);
  const [blocked, setBlocked] = useState(initialBlocked);

  const [newRule, setNewRule] = useState({
    dayOfWeek: 1,
    startTime: "09:00",
    endTime: "18:00",
    slotMinutes: 30,
  });
  const [savingRule, setSavingRule] = useState(false);

  const [newBlocked, setNewBlocked] = useState({ date: "", reason: "" });
  const [savingBlocked, setSavingBlocked] = useState(false);

  async function addRule() {
    setSavingRule(true);
    const result = await upsertAvailabilityRule({ ...newRule, active: true });
    setSavingRule(false);
    if (!result.ok) {
      alert(result.error);
      return;
    }
    location.reload();
  }

  async function toggleRule(rule: RuleRow) {
    const result = await upsertAvailabilityRule({
      ...rule,
      active: !rule.active,
    });
    if (result.ok) {
      setRules((rs) =>
        rs.map((r) => (r.id === rule.id ? { ...r, active: !r.active } : r))
      );
    }
  }

  async function removeRule(id: string) {
    if (!confirm("¿Eliminar este horario?")) return;
    await deleteAvailabilityRule(id);
    setRules((rs) => rs.filter((r) => r.id !== id));
  }

  async function addBlocked() {
    if (!newBlocked.date) return;
    setSavingBlocked(true);
    const result = await addBlockedDate(newBlocked);
    setSavingBlocked(false);
    if (!result.ok) {
      alert(result.error);
      return;
    }
    location.reload();
  }

  async function removeBlocked(id: string) {
    await removeBlockedDate(id);
    setBlocked((bs) => bs.filter((b) => b.id !== id));
  }

  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-lg font-semibold mb-3">Horarios recurrentes</h2>
        <p className="text-sm text-white/50 mb-4">
          Define los bloques de disponibilidad por día de la semana.
        </p>

        <div className="space-y-2 mb-5">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4"
            >
              <div>
                <span className="font-medium">{DAY_LABELS[rule.dayOfWeek]}</span>
                <span className="ml-3 text-white/60 text-sm">
                  {rule.startTime} - {rule.endTime} · citas de {rule.slotMinutes} min
                </span>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 text-xs text-white/50">
                  <input
                    type="checkbox"
                    checked={rule.active}
                    onChange={() => toggleRule(rule)}
                  />
                  Activo
                </label>
                <button
                  onClick={() => removeRule(rule.id)}
                  className="text-xs text-rose-400 hover:text-rose-300"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
          {rules.length === 0 && (
            <p className="text-sm text-white/40">Sin horarios configurados.</p>
          )}
        </div>

        <div className="flex flex-wrap items-end gap-3 rounded-xl border border-dashed border-white/20 p-4">
          <label className="text-xs text-white/60">
            Día
            <select
              value={newRule.dayOfWeek}
              onChange={(e) =>
                setNewRule({ ...newRule, dayOfWeek: Number(e.target.value) })
              }
              className="block mt-1 rounded-lg border border-white/15 bg-white/5 px-2 py-1.5 text-white"
            >
              {DAY_LABELS.map((label, i) => (
                <option key={i} value={i} className="bg-[#150d24]">
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-white/60">
            Desde
            <input
              type="time"
              value={newRule.startTime}
              onChange={(e) => setNewRule({ ...newRule, startTime: e.target.value })}
              className="block mt-1 rounded-lg border border-white/15 bg-white/5 px-2 py-1.5 text-white"
            />
          </label>
          <label className="text-xs text-white/60">
            Hasta
            <input
              type="time"
              value={newRule.endTime}
              onChange={(e) => setNewRule({ ...newRule, endTime: e.target.value })}
              className="block mt-1 rounded-lg border border-white/15 bg-white/5 px-2 py-1.5 text-white"
            />
          </label>
          <label className="text-xs text-white/60">
            Duración (min)
            <input
              type="number"
              min={5}
              step={5}
              value={newRule.slotMinutes}
              onChange={(e) =>
                setNewRule({ ...newRule, slotMinutes: Number(e.target.value) })
              }
              className="block mt-1 w-24 rounded-lg border border-white/15 bg-white/5 px-2 py-1.5 text-white"
            />
          </label>
          <button
            onClick={addRule}
            disabled={savingRule}
            className="rounded-full bg-violet-600 px-5 py-2 text-sm font-semibold hover:bg-violet-500 disabled:opacity-50"
          >
            {savingRule ? "Guardando..." : "Agregar horario"}
          </button>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">Días bloqueados</h2>
        <p className="text-sm text-white/50 mb-4">
          Bloquea fechas puntuales (feriados, vacaciones) sin afectar el resto
          del calendario.
        </p>

        <div className="space-y-2 mb-5">
          {blocked.map((b) => (
            <div
              key={b.id}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-4"
            >
              <div>
                <span className="font-medium">{b.date}</span>
                {b.reason && (
                  <span className="ml-3 text-white/50 text-sm">{b.reason}</span>
                )}
              </div>
              <button
                onClick={() => removeBlocked(b.id)}
                className="text-xs text-rose-400 hover:text-rose-300"
              >
                Quitar
              </button>
            </div>
          ))}
          {blocked.length === 0 && (
            <p className="text-sm text-white/40">Sin fechas bloqueadas.</p>
          )}
        </div>

        <div className="flex flex-wrap items-end gap-3 rounded-xl border border-dashed border-white/20 p-4">
          <label className="text-xs text-white/60">
            Fecha
            <input
              type="date"
              value={newBlocked.date}
              onChange={(e) => setNewBlocked({ ...newBlocked, date: e.target.value })}
              className="block mt-1 rounded-lg border border-white/15 bg-white/5 px-2 py-1.5 text-white"
            />
          </label>
          <label className="text-xs text-white/60 flex-1 min-w-[160px]">
            Motivo (opcional)
            <input
              value={newBlocked.reason}
              onChange={(e) =>
                setNewBlocked({ ...newBlocked, reason: e.target.value })
              }
              className="block mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-2 py-1.5 text-white"
            />
          </label>
          <button
            onClick={addBlocked}
            disabled={savingBlocked || !newBlocked.date}
            className="rounded-full bg-violet-600 px-5 py-2 text-sm font-semibold hover:bg-violet-500 disabled:opacity-50"
          >
            {savingBlocked ? "Guardando..." : "Bloquear fecha"}
          </button>
        </div>
      </section>
    </div>
  );
}
