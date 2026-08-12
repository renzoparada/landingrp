"use client";

import { useState } from "react";
import {
  upsertQuestion,
  deleteQuestion,
  reorderQuestions,
} from "@/lib/actions/admin-questions";

interface OptionDraft {
  label: string;
  score: number;
}

interface QuestionDraft {
  id?: string;
  order: number;
  question: string;
  helpText: string;
  type: "SINGLE" | "MULTI" | "TEXT";
  options: OptionDraft[];
  required: boolean;
  active: boolean;
}

export interface QuestionRow {
  id: string;
  order: number;
  question: string;
  helpText: string | null;
  type: "SINGLE" | "MULTI" | "TEXT";
  options: OptionDraft[] | null;
  required: boolean;
  active: boolean;
}

function toDraft(row?: QuestionRow, nextOrder = 0): QuestionDraft {
  if (!row) {
    return {
      order: nextOrder,
      question: "",
      helpText: "",
      type: "SINGLE",
      options: [{ label: "", score: 1 }],
      required: true,
      active: true,
    };
  }
  return {
    id: row.id,
    order: row.order,
    question: row.question,
    helpText: row.helpText ?? "",
    type: row.type,
    options: row.options && row.options.length > 0 ? row.options : [{ label: "", score: 1 }],
    required: row.required,
    active: row.active,
  };
}

function QuestionForm({
  draft,
  onChange,
  onSave,
  onCancel,
  saving,
}: {
  draft: QuestionDraft;
  onChange: (d: QuestionDraft) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
}) {
  return (
    <div className="space-y-3 rounded-xl border border-white/15 bg-white/[0.04] p-4">
      <input
        value={draft.question}
        onChange={(e) => onChange({ ...draft, question: e.target.value })}
        placeholder="Texto de la pregunta"
        className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500"
      />
      <input
        value={draft.helpText}
        onChange={(e) => onChange({ ...draft, helpText: e.target.value })}
        placeholder="Texto de ayuda (opcional)"
        className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500"
      />

      <div className="flex flex-wrap items-center gap-4">
        <label className="text-xs text-white/60 flex items-center gap-2">
          Tipo
          <select
            value={draft.type}
            onChange={(e) =>
              onChange({ ...draft, type: e.target.value as QuestionDraft["type"] })
            }
            className="rounded-lg border border-white/15 bg-white/5 px-2 py-1.5 text-white"
          >
            <option value="SINGLE" className="bg-[#150d24]">Opción única</option>
            <option value="MULTI" className="bg-[#150d24]">Opción múltiple</option>
            <option value="TEXT" className="bg-[#150d24]">Texto libre</option>
          </select>
        </label>
        <label className="text-xs text-white/60 flex items-center gap-1.5">
          <input
            type="checkbox"
            checked={draft.required}
            onChange={(e) => onChange({ ...draft, required: e.target.checked })}
          />
          Obligatoria
        </label>
        <label className="text-xs text-white/60 flex items-center gap-1.5">
          <input
            type="checkbox"
            checked={draft.active}
            onChange={(e) => onChange({ ...draft, active: e.target.checked })}
          />
          Activa
        </label>
      </div>

      {draft.type !== "TEXT" && (
        <div className="space-y-2">
          <p className="text-xs text-white/50">
            Opciones (el puntaje suma al perfil del lead)
          </p>
          {draft.options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={opt.label}
                onChange={(e) => {
                  const options = [...draft.options];
                  options[i] = { ...options[i], label: e.target.value };
                  onChange({ ...draft, options });
                }}
                placeholder={`Opción ${i + 1}`}
                className="flex-1 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              <input
                type="number"
                value={opt.score}
                onChange={(e) => {
                  const options = [...draft.options];
                  options[i] = { ...options[i], score: Number(e.target.value) };
                  onChange({ ...draft, options });
                }}
                className="w-16 rounded-lg border border-white/15 bg-white/5 px-2 py-1.5 text-sm text-white"
              />
              <button
                onClick={() =>
                  onChange({
                    ...draft,
                    options: draft.options.filter((_, idx) => idx !== i),
                  })
                }
                className="text-white/40 hover:text-rose-400 text-sm px-1"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            onClick={() =>
              onChange({
                ...draft,
                options: [...draft.options, { label: "", score: 0 }],
              })
            }
            className="text-xs text-violet-300 hover:text-violet-200"
          >
            + Agregar opción
          </button>
        </div>
      )}

      <div className="flex items-center gap-3 pt-1">
        <button
          onClick={onSave}
          disabled={saving || !draft.question.trim()}
          className="rounded-full bg-violet-600 px-5 py-2 text-sm font-semibold hover:bg-violet-500 disabled:opacity-50"
        >
          {saving ? "Guardando..." : "Guardar"}
        </button>
        <button
          onClick={onCancel}
          className="rounded-full border border-white/15 px-5 py-2 text-sm text-white/70 hover:bg-white/5"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

export default function QuestionsManager({
  initialQuestions,
  campaignId = null,
}: {
  initialQuestions: QuestionRow[];
  /** null = the shared default quiz. Set = this campaign's own quiz. */
  campaignId?: string | null;
}) {
  const [questions, setQuestions] = useState(
    [...initialQuestions].sort((a, b) => a.order - b.order)
  );
  const [editingId, setEditingId] = useState<string | "new" | null>(null);
  const [draft, setDraft] = useState<QuestionDraft | null>(null);
  const [saving, setSaving] = useState(false);

  function startEdit(row?: QuestionRow) {
    setEditingId(row?.id ?? "new");
    setDraft(toDraft(row, questions.length));
  }

  async function save() {
    if (!draft) return;
    setSaving(true);
    const result = await upsertQuestion({
      id: draft.id,
      order: draft.order,
      question: draft.question,
      helpText: draft.helpText || null,
      type: draft.type,
      options:
        draft.type === "TEXT"
          ? undefined
          : draft.options.filter((o) => o.label.trim()),
      required: draft.required,
      active: draft.active,
      campaignId,
    });
    setSaving(false);
    if (!result.ok) {
      alert(result.error);
      return;
    }
    setEditingId(null);
    setDraft(null);
    location.reload();
  }

  async function remove(id: string) {
    if (!confirm("¿Eliminar esta pregunta? Se perderán las respuestas asociadas.")) return;
    await deleteQuestion(id, campaignId);
    setQuestions((qs) => qs.filter((q) => q.id !== id));
  }

  async function move(id: string, dir: -1 | 1) {
    const idx = questions.findIndex((q) => q.id === id);
    const swapWith = idx + dir;
    if (swapWith < 0 || swapWith >= questions.length) return;
    const next = [...questions];
    [next[idx], next[swapWith]] = [next[swapWith], next[idx]];
    setQuestions(next);
    await reorderQuestions(next.map((q) => q.id), campaignId);
  }

  return (
    <div className="space-y-3">
      {questions.map((q, i) =>
        editingId === q.id && draft ? (
          <QuestionForm
            key={q.id}
            draft={draft}
            onChange={setDraft}
            onSave={save}
            onCancel={() => setEditingId(null)}
            saving={saving}
          />
        ) : (
          <div
            key={q.id}
            className="flex items-start justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4"
          >
            <div className="min-w-0">
              <p className="font-medium">
                {q.question}{" "}
                {!q.active && (
                  <span className="ml-2 text-xs text-white/30">(inactiva)</span>
                )}
              </p>
              <p className="mt-1 text-xs text-white/40">
                {q.type === "SINGLE"
                  ? "Opción única"
                  : q.type === "MULTI"
                    ? "Opción múltiple"
                    : "Texto libre"}{" "}
                {q.required ? "· Obligatoria" : "· Opcional"}
              </p>
              {q.options && q.options.length > 0 && (
                <p className="mt-1 text-xs text-white/40 truncate">
                  {q.options.map((o) => o.label).join(" · ")}
                </p>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button
                onClick={() => move(q.id, -1)}
                disabled={i === 0}
                className="h-7 w-7 rounded text-white/50 hover:bg-white/10 disabled:opacity-20"
              >
                ↑
              </button>
              <button
                onClick={() => move(q.id, 1)}
                disabled={i === questions.length - 1}
                className="h-7 w-7 rounded text-white/50 hover:bg-white/10 disabled:opacity-20"
              >
                ↓
              </button>
              <button
                onClick={() => startEdit(q)}
                className="rounded-full border border-white/15 px-3 py-1.5 text-xs hover:bg-white/5"
              >
                Editar
              </button>
              <button
                onClick={() => remove(q.id)}
                className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10"
              >
                Eliminar
              </button>
            </div>
          </div>
        )
      )}

      {editingId === "new" && draft ? (
        <QuestionForm
          draft={draft}
          onChange={setDraft}
          onSave={save}
          onCancel={() => setEditingId(null)}
          saving={saving}
        />
      ) : (
        <button
          onClick={() => startEdit()}
          className="w-full rounded-xl border border-dashed border-white/20 py-4 text-sm text-white/60 hover:bg-white/5"
        >
          + Agregar pregunta
        </button>
      )}
    </div>
  );
}
