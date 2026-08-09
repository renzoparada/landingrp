"use client";

import { useState } from "react";
import { updateSiteConfig } from "@/lib/actions/admin-config";
import type {
  SiteConfigData,
  BenefitItem,
  TestimonialItem,
  FaqItem,
} from "@/lib/types";
import { nanoid } from "nanoid";

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
      <h2 className="text-lg font-semibold">{title}</h2>
      {description && (
        <p className="mt-1 text-sm text-white/50">{description}</p>
      )}
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-white/60">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500";

export default function ContentEditor({
  initialConfig,
}: {
  initialConfig: SiteConfigData;
}) {
  const [config, setConfig] = useState<SiteConfigData>(initialConfig);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setError(null);
    const result = await updateSiteConfig(config);
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSavedAt(Date.now());
  }

  function updateBenefit(id: string, patch: Partial<BenefitItem>) {
    setConfig((c) => ({
      ...c,
      benefits: c.benefits.map((b) => (b.id === id ? { ...b, ...patch } : b)),
    }));
  }

  function updateTestimonial(id: string, patch: Partial<TestimonialItem>) {
    setConfig((c) => ({
      ...c,
      testimonials: c.testimonials.map((t) =>
        t.id === id ? { ...t, ...patch } : t
      ),
    }));
  }

  function updateFaq(id: string, patch: Partial<FaqItem>) {
    setConfig((c) => ({
      ...c,
      faqs: c.faqs.map((f) => (f.id === id ? { ...f, ...patch } : f)),
    }));
  }

  return (
    <div className="space-y-6 pb-24">
      <Section title="Marca" description="Nombre y colores de tu landing.">
        <div className="grid sm:grid-cols-3 gap-4">
          <Field label="Nombre de marca">
            <input
              className={inputClass}
              value={config.brand.name}
              onChange={(e) =>
                setConfig({ ...config, brand: { ...config.brand, name: e.target.value } })
              }
            />
          </Field>
          <Field label="Color primario">
            <input
              type="color"
              className="h-10 w-full rounded-lg border border-white/15 bg-white/5"
              value={config.brand.primaryColor}
              onChange={(e) =>
                setConfig({
                  ...config,
                  brand: { ...config.brand, primaryColor: e.target.value },
                })
              }
            />
          </Field>
          <Field label="Color secundario">
            <input
              type="color"
              className="h-10 w-full rounded-lg border border-white/15 bg-white/5"
              value={config.brand.secondaryColor}
              onChange={(e) =>
                setConfig({
                  ...config,
                  brand: { ...config.brand, secondaryColor: e.target.value },
                })
              }
            />
          </Field>
        </div>
      </Section>

      <Section
        title="Quiz previo"
        description="Textos de la pantalla de bienvenida antes de las preguntas."
      >
        <Field label="Etiqueta superior">
          <input
            className={inputClass}
            value={config.quizIntro.eyebrow}
            onChange={(e) =>
              setConfig({ ...config, quizIntro: { ...config.quizIntro, eyebrow: e.target.value } })
            }
          />
        </Field>
        <Field label="Título">
          <input
            className={inputClass}
            value={config.quizIntro.title}
            onChange={(e) =>
              setConfig({ ...config, quizIntro: { ...config.quizIntro, title: e.target.value } })
            }
          />
        </Field>
        <Field label="Subtítulo">
          <textarea
            className={inputClass}
            rows={2}
            value={config.quizIntro.subtitle}
            onChange={(e) =>
              setConfig({ ...config, quizIntro: { ...config.quizIntro, subtitle: e.target.value } })
            }
          />
        </Field>
      </Section>

      <Section title="Hero de la landing" description="Título principal, video y botón.">
        <Field label="Badge (texto pequeño superior)">
          <input
            className={inputClass}
            value={config.hero.badge}
            onChange={(e) => setConfig({ ...config, hero: { ...config.hero, badge: e.target.value } })}
          />
        </Field>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Título">
            <input
              className={inputClass}
              value={config.hero.title}
              onChange={(e) => setConfig({ ...config, hero: { ...config.hero, title: e.target.value } })}
            />
          </Field>
          <Field label="Resaltado (color degradado)">
            <input
              className={inputClass}
              value={config.hero.highlight}
              onChange={(e) =>
                setConfig({ ...config, hero: { ...config.hero, highlight: e.target.value } })
              }
            />
          </Field>
        </div>
        <Field label="Subtítulo">
          <textarea
            className={inputClass}
            rows={2}
            value={config.hero.subtitle}
            onChange={(e) => setConfig({ ...config, hero: { ...config.hero, subtitle: e.target.value } })}
          />
        </Field>
        <Field label="Texto del botón principal">
          <input
            className={inputClass}
            value={config.hero.ctaLabel}
            onChange={(e) => setConfig({ ...config, hero: { ...config.hero, ctaLabel: e.target.value } })}
          />
        </Field>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Fuente del video">
            <select
              className={inputClass}
              value={config.hero.videoSource}
              onChange={(e) =>
                setConfig({
                  ...config,
                  hero: { ...config.hero, videoSource: e.target.value as SiteConfigData["hero"]["videoSource"] },
                })
              }
            >
              <option value="youtube" className="bg-[#150d24]">YouTube</option>
              <option value="vimeo" className="bg-[#150d24]">Vimeo</option>
              <option value="mp4" className="bg-[#150d24]">Video MP4 directo</option>
              <option value="none" className="bg-[#150d24]">Sin video</option>
            </select>
          </Field>
          <Field label="URL del video">
            <input
              className={inputClass}
              value={config.hero.videoUrl}
              onChange={(e) => setConfig({ ...config, hero: { ...config.hero, videoUrl: e.target.value } })}
            />
          </Field>
        </div>
      </Section>

      <Section
        title="Oferta y cronómetro"
        description="Configura la fecha/hora en que expira la oferta."
      >
        <label className="flex items-center gap-2 text-sm text-white/70">
          <input
            type="checkbox"
            checked={config.offer.enabled}
            onChange={(e) =>
              setConfig({ ...config, offer: { ...config.offer, enabled: e.target.checked } })
            }
          />
          Mostrar bloque de oferta con cronómetro
        </label>
        <Field label="Título de la oferta">
          <input
            className={inputClass}
            value={config.offer.title}
            onChange={(e) => setConfig({ ...config, offer: { ...config.offer, title: e.target.value } })}
          />
        </Field>
        <Field label="Descripción">
          <textarea
            className={inputClass}
            rows={2}
            value={config.offer.description}
            onChange={(e) =>
              setConfig({ ...config, offer: { ...config.offer, description: e.target.value } })
            }
          />
        </Field>
        <div className="grid sm:grid-cols-3 gap-4">
          <Field label="Precio original (opcional)">
            <input
              className={inputClass}
              value={config.offer.priceOriginal ?? ""}
              onChange={(e) =>
                setConfig({ ...config, offer: { ...config.offer, priceOriginal: e.target.value } })
              }
            />
          </Field>
          <Field label="Precio de oferta (opcional)">
            <input
              className={inputClass}
              value={config.offer.priceOffer ?? ""}
              onChange={(e) =>
                setConfig({ ...config, offer: { ...config.offer, priceOffer: e.target.value } })
              }
            />
          </Field>
          <Field label="Expira el">
            <input
              type="datetime-local"
              className={inputClass}
              value={toLocalInputValue(config.offer.expiresAt)}
              onChange={(e) =>
                setConfig({
                  ...config,
                  offer: { ...config.offer, expiresAt: new Date(e.target.value).toISOString() },
                })
              }
            />
          </Field>
        </div>
        <Field label="Mensaje cuando expira">
          <input
            className={inputClass}
            value={config.offer.expiredMessage}
            onChange={(e) =>
              setConfig({ ...config, offer: { ...config.offer, expiredMessage: e.target.value } })
            }
          />
        </Field>
      </Section>

      <Section title="Beneficios">
        <div className="space-y-3">
          {config.benefits.map((b) => (
            <div key={b.id} className="grid sm:grid-cols-[60px_1fr_1fr_auto] gap-2 items-start">
              <input
                className={inputClass}
                value={b.icon}
                onChange={(e) => updateBenefit(b.id, { icon: e.target.value })}
                placeholder="🌍"
              />
              <input
                className={inputClass}
                value={b.title}
                onChange={(e) => updateBenefit(b.id, { title: e.target.value })}
                placeholder="Título"
              />
              <input
                className={inputClass}
                value={b.description}
                onChange={(e) => updateBenefit(b.id, { description: e.target.value })}
                placeholder="Descripción"
              />
              <button
                onClick={() =>
                  setConfig((c) => ({
                    ...c,
                    benefits: c.benefits.filter((x) => x.id !== b.id),
                  }))
                }
                className="text-rose-400 text-sm px-2 py-2.5"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            onClick={() =>
              setConfig((c) => ({
                ...c,
                benefits: [
                  ...c.benefits,
                  { id: nanoid(8), icon: "✨", title: "", description: "" },
                ],
              }))
            }
            className="text-xs text-violet-300 hover:text-violet-200"
          >
            + Agregar beneficio
          </button>
        </div>
      </Section>

      <Section title="Testimonios">
        <div className="space-y-4">
          {config.testimonials.map((t) => (
            <div key={t.id} className="rounded-xl border border-white/10 p-4 space-y-2">
              <div className="grid sm:grid-cols-2 gap-2">
                <input
                  className={inputClass}
                  value={t.name}
                  onChange={(e) => updateTestimonial(t.id, { name: e.target.value })}
                  placeholder="Nombre"
                />
                <input
                  className={inputClass}
                  value={t.role}
                  onChange={(e) => updateTestimonial(t.id, { role: e.target.value })}
                  placeholder="Rol / contexto"
                />
              </div>
              <textarea
                className={inputClass}
                rows={2}
                value={t.quote}
                onChange={(e) => updateTestimonial(t.id, { quote: e.target.value })}
                placeholder="Testimonio"
              />
              <div className="flex items-center gap-3">
                <label className="text-xs text-white/50">
                  Calificación
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={t.rating}
                    onChange={(e) =>
                      updateTestimonial(t.id, { rating: Number(e.target.value) })
                    }
                    className="ml-2 w-16 rounded-lg border border-white/15 bg-white/5 px-2 py-1"
                  />
                </label>
                <button
                  onClick={() =>
                    setConfig((c) => ({
                      ...c,
                      testimonials: c.testimonials.filter((x) => x.id !== t.id),
                    }))
                  }
                  className="text-rose-400 text-xs"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
          <button
            onClick={() =>
              setConfig((c) => ({
                ...c,
                testimonials: [
                  ...c.testimonials,
                  { id: nanoid(8), name: "", role: "", quote: "", rating: 5 },
                ],
              }))
            }
            className="text-xs text-violet-300 hover:text-violet-200"
          >
            + Agregar testimonio
          </button>
        </div>
      </Section>

      <Section title="Preguntas frecuentes">
        <div className="space-y-3">
          {config.faqs.map((f) => (
            <div key={f.id} className="rounded-xl border border-white/10 p-4 space-y-2">
              <input
                className={inputClass}
                value={f.question}
                onChange={(e) => updateFaq(f.id, { question: e.target.value })}
                placeholder="Pregunta"
              />
              <textarea
                className={inputClass}
                rows={2}
                value={f.answer}
                onChange={(e) => updateFaq(f.id, { answer: e.target.value })}
                placeholder="Respuesta"
              />
              <button
                onClick={() =>
                  setConfig((c) => ({ ...c, faqs: c.faqs.filter((x) => x.id !== f.id) }))
                }
                className="text-rose-400 text-xs"
              >
                Eliminar
              </button>
            </div>
          ))}
          <button
            onClick={() =>
              setConfig((c) => ({
                ...c,
                faqs: [...c.faqs, { id: nanoid(8), question: "", answer: "" }],
              }))
            }
            className="text-xs text-violet-300 hover:text-violet-200"
          >
            + Agregar pregunta
          </button>
        </div>
      </Section>

      <Section title="Reserva de citas">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Título">
            <input
              className={inputClass}
              value={config.booking.title}
              onChange={(e) =>
                setConfig({ ...config, booking: { ...config.booking, title: e.target.value } })
              }
            />
          </Field>
          <Field label="Zona horaria (IANA)">
            <input
              className={inputClass}
              value={config.booking.timezone}
              onChange={(e) =>
                setConfig({ ...config, booking: { ...config.booking, timezone: e.target.value } })
              }
              placeholder="America/Lima"
            />
          </Field>
        </div>
        <Field label="Subtítulo">
          <input
            className={inputClass}
            value={config.booking.subtitle}
            onChange={(e) =>
              setConfig({ ...config, booking: { ...config.booking, subtitle: e.target.value } })
            }
          />
        </Field>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Duración de la cita (texto)">
            <input
              className={inputClass}
              value={config.booking.meetingDurationLabel}
              onChange={(e) =>
                setConfig({
                  ...config,
                  booking: { ...config.booking, meetingDurationLabel: e.target.value },
                })
              }
            />
          </Field>
          <Field label="Mensaje de confirmación">
            <input
              className={inputClass}
              value={config.booking.confirmationMessage}
              onChange={(e) =>
                setConfig({
                  ...config,
                  booking: { ...config.booking, confirmationMessage: e.target.value },
                })
              }
            />
          </Field>
        </div>
      </Section>

      <Section title="Pie de página">
        <Field label="Texto del footer">
          <input
            className={inputClass}
            value={config.footer.text}
            onChange={(e) => setConfig({ ...config, footer: { ...config.footer, text: e.target.value } })}
          />
        </Field>
      </Section>

      <div className="fixed bottom-0 inset-x-0 md:left-64 z-20 border-t border-white/10 bg-[#0b0713]/95 backdrop-blur px-5 py-4 flex items-center gap-4">
        <button
          onClick={save}
          disabled={saving}
          className="rounded-full bg-violet-600 px-6 py-2.5 text-sm font-semibold hover:bg-violet-500 disabled:opacity-50"
        >
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
        {error && <span className="text-sm text-rose-400">{error}</span>}
        {savedAt && !error && (
          <span className="text-sm text-emerald-400">Cambios guardados ✓</span>
        )}
      </div>
    </div>
  );
}

function toLocalInputValue(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
