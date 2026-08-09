import { redirect } from "next/navigation";
import Link from "next/link";
import { getLeadSession } from "@/lib/lead-session";
import { prisma } from "@/lib/prisma";
import { getSiteConfig } from "@/lib/config";
import CountdownTimer from "@/components/CountdownTimer";
import VideoEmbed from "@/components/VideoEmbed";
import StarRating from "@/components/StarRating";
import FaqAccordion from "@/components/FaqAccordion";

export const dynamic = "force-dynamic";

export default async function OfertaPage() {
  const session = await getLeadSession();
  if (!session) redirect("/");

  const [lead, config] = await Promise.all([
    prisma.lead.findUnique({ where: { id: session.leadId } }),
    getSiteConfig(),
  ]);

  if (!lead) redirect("/");

  const brandVars = {
    ["--brand-primary" as string]: config.brand.primaryColor,
    ["--brand-secondary" as string]: config.brand.secondaryColor,
  };

  const firstName = lead.fullName.trim().split(/\s+/)[0];

  return (
    <div style={brandVars} className="relative min-h-screen bg-[#0b0713] text-white overflow-x-hidden">
      {/* Decorative background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="animate-float-blob absolute -top-40 -left-32 h-[28rem] w-[28rem] rounded-full bg-[var(--brand-primary)]/25 blur-[120px]" />
        <div className="animate-float-blob absolute top-1/2 -right-32 h-[28rem] w-[28rem] rounded-full bg-[var(--brand-secondary)]/20 blur-[120px]" style={{ animationDelay: "4s" }} />
      </div>

      {/* Top bar */}
      <header className="relative z-10 flex items-center justify-between px-5 sm:px-10 py-5">
        <div className="flex items-center gap-2 font-bold text-lg">
          <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-secondary)]" />
          {config.brand.name}
        </div>
        <span className="hidden sm:inline text-sm text-white/50">
          Hola, {firstName} 👋
        </span>
      </header>

      {/* Hero */}
      <section className="relative z-10 px-5 sm:px-10 pt-6 pb-16 max-w-5xl mx-auto text-center">
        <span className="animate-fade-up inline-block rounded-full bg-white/10 border border-white/15 px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-white/80">
          {config.hero.badge}
        </span>
        <h1 className="animate-fade-up mt-5 text-3xl sm:text-5xl font-bold leading-tight">
          {config.hero.title}{" "}
          <span className="bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] bg-clip-text text-transparent">
            {config.hero.highlight}
          </span>
        </h1>
        <p className="animate-fade-up mt-5 text-white/70 text-base sm:text-lg max-w-2xl mx-auto">
          {config.hero.subtitle}
        </p>

        <div className="animate-fade-up mt-8">
          <Link
            href="/reservar"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] px-8 py-4 text-base font-semibold shadow-lg shadow-[var(--brand-primary)]/30 transition hover:scale-[1.03] active:scale-95"
          >
            {config.hero.ctaLabel} <span aria-hidden>→</span>
          </Link>
        </div>

        {config.hero.videoSource !== "none" && config.hero.videoUrl && (
          <div className="animate-fade-up mt-12 mx-auto max-w-3xl aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/40">
            <VideoEmbed
              source={config.hero.videoSource}
              url={config.hero.videoUrl}
              className="h-full w-full"
            />
          </div>
        )}
      </section>

      {/* Offer / countdown */}
      {config.offer.enabled && (
        <section className="relative z-10 px-5 sm:px-10 pb-16">
          <div className="max-w-3xl mx-auto rounded-2xl border border-white/10 bg-white/[0.04] p-6 sm:p-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-[var(--brand-secondary)]">
              {config.offer.title}
            </p>
            <p className="mt-2 text-white/70 text-sm sm:text-base max-w-xl mx-auto">
              {config.offer.description}
            </p>
            {(config.offer.priceOriginal || config.offer.priceOffer) && (
              <div className="mt-4 flex items-center justify-center gap-3">
                {config.offer.priceOriginal && (
                  <span className="text-white/40 line-through text-lg">
                    {config.offer.priceOriginal}
                  </span>
                )}
                {config.offer.priceOffer && (
                  <span className="text-2xl font-bold text-white">
                    {config.offer.priceOffer}
                  </span>
                )}
              </div>
            )}
            <div className="mt-6 flex justify-center">
              <CountdownTimer
                targetIso={config.offer.expiresAt}
                expiredMessage={config.offer.expiredMessage}
              />
            </div>
          </div>
        </section>
      )}

      {/* Benefits */}
      <section className="relative z-10 px-5 sm:px-10 pb-16 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {config.benefits.map((b) => (
            <div
              key={b.id}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center hover:bg-white/[0.06] transition"
            >
              <div className="text-3xl">{b.icon}</div>
              <h3 className="mt-3 font-semibold">{b.title}</h3>
              <p className="mt-1.5 text-sm text-white/60">{b.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      {config.testimonials.length > 0 && (
        <section className="relative z-10 px-5 sm:px-10 pb-16 max-w-5xl mx-auto">
          <h2 className="text-center text-2xl sm:text-3xl font-bold mb-8">
            Historias reales
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {config.testimonials.map((t) => (
              <div
                key={t.id}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
              >
                <StarRating rating={t.rating} />
                <p className="mt-3 text-sm text-white/80 leading-relaxed">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <p className="mt-4 text-sm font-semibold">{t.name}</p>
                <p className="text-xs text-white/50">{t.role}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* FAQ */}
      {config.faqs.length > 0 && (
        <section className="relative z-10 px-5 sm:px-10 pb-24 max-w-2xl mx-auto">
          <h2 className="text-center text-2xl sm:text-3xl font-bold mb-8">
            Preguntas frecuentes
          </h2>
          <FaqAccordion faqs={config.faqs} />
        </section>
      )}

      {/* Final CTA */}
      <section className="relative z-10 px-5 sm:px-10 pb-24 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold">
          ¿Listo para dar el siguiente paso, {firstName}?
        </h2>
        <div className="mt-6">
          <Link
            href="/reservar"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] px-8 py-4 text-base font-semibold shadow-lg shadow-[var(--brand-primary)]/30 transition hover:scale-[1.03] active:scale-95"
          >
            {config.hero.ctaLabel} <span aria-hidden>→</span>
          </Link>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/10 px-5 sm:px-10 py-8 text-center text-xs text-white/40">
        {config.footer.text}
      </footer>

      {/* Sticky mobile CTA */}
      <div className="fixed bottom-0 inset-x-0 z-20 border-t border-white/10 bg-[#0b0713]/90 backdrop-blur-sm p-3 sm:hidden">
        <Link
          href="/reservar"
          className="block w-full rounded-full bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] py-3.5 text-center text-sm font-semibold"
        >
          {config.hero.ctaLabel}
        </Link>
      </div>
      <div className="h-16 sm:hidden" />
    </div>
  );
}
