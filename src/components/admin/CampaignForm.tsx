"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveCampaign } from "@/lib/actions/campaigns";
import type { CampaignContentData } from "@/lib/types";

function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-white/60">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500";

interface CampaignFormProps {
  campaign?: {
    id: string;
    name: string;
    slug: string;
    active: boolean;
    data: CampaignContentData;
  };
  defaultContent: CampaignContentData;
}

export default function CampaignForm({ campaign, defaultContent }: CampaignFormProps) {
  const router = useRouter();
  const [name, setName] = useState(campaign?.name ?? "");
  const [slug, setSlug] = useState(campaign?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!campaign);
  const [active, setActive] = useState(campaign?.active ?? true);
  const [content, setContent] = useState<CampaignContentData>(
    campaign?.data ?? structuredClone(defaultContent)
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function handleNameChange(value: string) {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  async function handleSave() {
    setError(null);
    setCopied(false);
    if (!name.trim()) {
      setError("Ponle un nombre a la campaña (ej: Ventas, Coaching, Talleres).");
      return;
    }
    if (!slug.trim()) {
      setError("El link de la campaña no puede estar vacío.");
      return;
    }

    setSaving(true);
    const result = await saveCampaign({
      id: campaign?.id,
      name: name.trim(),
      slug: slug.trim(),
      active,
      hero: content.hero,
      offer: content.offer,
    });
    setSaving(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setGeneratedLink(result.link);
    if (!campaign) {
      // Swap the URL to the edit page for this new campaign without a full
      // reload, so re-saving afterwards updates it instead of duplicating it.
      router.replace(`/admin/campanas/${result.id}`);
    } else {
      router.refresh();
    }
  }

  async function handleCopy() {
    if (!generatedLink) return;
    try {
      await navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API can fail without HTTPS/permissions — link is still
      // shown as selectable text so the admin can copy it manually.
    }
  }

  return (
    <div className="space-y-6 pb-24">
      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
        <h2 className="text-lg font-semibold">Datos de la campaña</h2>
        <p className="mt-1 text-sm text-white/50">
          El nombre es solo para identificarla en tu panel. El link es lo que
          compartes con tus clientes.
        </p>
        <div className="mt-4 grid sm:grid-cols-2 gap-4">
          <Field label="Nombre de la campaña">
            <input
              className={inputClass}
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Ventas, Coaching, Talleres..."
            />
          </Field>
          <Field label="Link de la campaña (se genera solo, puedes editarlo)">
            <input
              className={`${inputClass} font-mono`}
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(slugify(e.target.value));
              }}
              placeholder="ventas"
            />
          </Field>
        </div>
        <label className="mt-4 flex items-center gap-2 text-sm text-white/70">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
          />
          Campaña activa
        </label>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
        <h2 className="text-lg font-semibold">Hero de esta campaña</h2>
        <p className="mt-1 text-sm text-white/50">
          Lo que ve la persona en la parte superior de /oferta cuando llega
          desde el link de esta campaña.
        </p>
        <div className="mt-4 space-y-4">
          <Field label="Badge (texto pequeño superior)">
            <input
              className={inputClass}
              value={content.hero.badge}
              onChange={(e) =>
                setContent({ ...content, hero: { ...content.hero, badge: e.target.value } })
              }
            />
          </Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Título">
              <input
                className={inputClass}
                value={content.hero.title}
                onChange={(e) =>
                  setContent({ ...content, hero: { ...content.hero, title: e.target.value } })
                }
              />
            </Field>
            <Field label="Resaltado (color degradado)">
              <input
                className={inputClass}
                value={content.hero.highlight}
                onChange={(e) =>
                  setContent({
                    ...content,
                    hero: { ...content.hero, highlight: e.target.value },
                  })
                }
              />
            </Field>
          </div>
          <Field label="Subtítulo">
            <textarea
              className={inputClass}
              rows={2}
              value={content.hero.subtitle}
              onChange={(e) =>
                setContent({ ...content, hero: { ...content.hero, subtitle: e.target.value } })
              }
            />
          </Field>
          <Field label="Texto del botón principal">
            <input
              className={inputClass}
              value={content.hero.ctaLabel}
              onChange={(e) =>
                setContent({ ...content, hero: { ...content.hero, ctaLabel: e.target.value } })
              }
            />
          </Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Fuente del video">
              <select
                className={inputClass}
                value={content.hero.videoSource}
                onChange={(e) =>
                  setContent({
                    ...content,
                    hero: {
                      ...content.hero,
                      videoSource: e.target.value as CampaignContentData["hero"]["videoSource"],
                    },
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
                value={content.hero.videoUrl}
                onChange={(e) =>
                  setContent({ ...content, hero: { ...content.hero, videoUrl: e.target.value } })
                }
              />
            </Field>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
        <h2 className="text-lg font-semibold">Oferta y cronómetro de esta campaña</h2>
        <div className="mt-4 space-y-4">
          <label className="flex items-center gap-2 text-sm text-white/70">
            <input
              type="checkbox"
              checked={content.offer.enabled}
              onChange={(e) =>
                setContent({ ...content, offer: { ...content.offer, enabled: e.target.checked } })
              }
            />
            Mostrar bloque de oferta con cronómetro
          </label>
          <Field label="Título de la oferta">
            <input
              className={inputClass}
              value={content.offer.title}
              onChange={(e) =>
                setContent({ ...content, offer: { ...content.offer, title: e.target.value } })
              }
            />
          </Field>
          <Field label="Descripción">
            <textarea
              className={inputClass}
              rows={2}
              value={content.offer.description}
              onChange={(e) =>
                setContent({
                  ...content,
                  offer: { ...content.offer, description: e.target.value },
                })
              }
            />
          </Field>
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="Precio original (opcional)">
              <input
                className={inputClass}
                value={content.offer.priceOriginal ?? ""}
                onChange={(e) =>
                  setContent({
                    ...content,
                    offer: { ...content.offer, priceOriginal: e.target.value },
                  })
                }
              />
            </Field>
            <Field label="Precio de oferta (opcional)">
              <input
                className={inputClass}
                value={content.offer.priceOffer ?? ""}
                onChange={(e) =>
                  setContent({
                    ...content,
                    offer: { ...content.offer, priceOffer: e.target.value },
                  })
                }
              />
            </Field>
            <Field label="Expira el">
              <input
                type="datetime-local"
                className={inputClass}
                value={toLocalInputValue(content.offer.expiresAt)}
                onChange={(e) =>
                  setContent({
                    ...content,
                    offer: {
                      ...content.offer,
                      expiresAt: new Date(e.target.value).toISOString(),
                    },
                  })
                }
              />
            </Field>
          </div>
          <Field label="Mensaje cuando expira">
            <input
              className={inputClass}
              value={content.offer.expiredMessage}
              onChange={(e) =>
                setContent({
                  ...content,
                  offer: { ...content.offer, expiredMessage: e.target.value },
                })
              }
            />
          </Field>
        </div>
      </section>

      {generatedLink && (
        <section className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-emerald-300">
            ✓ Link de la campaña &ldquo;{name}&rdquo;
          </h2>
          <p className="mt-1 text-sm text-white/60">
            Comparte este link en anuncios, redes o donde quieras — los
            resultados se van a medir por separado en tu Resumen.
          </p>
          <div className="mt-3 flex flex-col sm:flex-row gap-2">
            <input
              readOnly
              value={generatedLink}
              onFocus={(e) => e.target.select()}
              className={`${inputClass} font-mono`}
            />
            <button
              onClick={handleCopy}
              className="shrink-0 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold hover:bg-emerald-500"
            >
              {copied ? "¡Copiado! ✓" : "Copiar link"}
            </button>
          </div>
        </section>
      )}

      <div className="fixed bottom-0 inset-x-0 md:left-64 z-20 border-t border-white/10 bg-[#0b0713]/95 backdrop-blur px-5 py-4 flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-full bg-violet-600 px-6 py-2.5 text-sm font-semibold hover:bg-violet-500 disabled:opacity-50"
        >
          {saving
            ? "Guardando..."
            : campaign
              ? "Guardar y generar link"
              : "Crear campaña y generar link"}
        </button>
        {error && <span className="text-sm text-rose-400">{error}</span>}
      </div>
    </div>
  );
}

function toLocalInputValue(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
