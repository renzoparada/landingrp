import { headers } from "next/headers";
import { getLeadSession } from "@/lib/lead-session";
import { prisma } from "@/lib/prisma";
import { getSiteConfig } from "@/lib/config";
import { getAvailableDays } from "@/lib/availability";
import BookingCalendar from "@/components/BookingCalendar";
import DirectBookingForm from "@/components/DirectBookingForm";

export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;

function pick(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * A shortcut booking link that skips the quiz + oferta landing entirely —
 * for sharing directly (WhatsApp, bio, email signature) when the goal is
 * just to get someone on the calendar. It still creates a Lead (so it shows
 * up in /admin/leads and in campaign performance, same as the quiz funnel)
 * from a short contact form before revealing the calendar.
 */
export default async function AgendarPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const h = await headers();
  const referrer = h.get("referer") ?? undefined;

  const [session, config, availableDays] = await Promise.all([
    getLeadSession(),
    getSiteConfig(),
    getAvailableDays(60),
  ]);

  // Someone who already has a lead session (e.g. came through the quiz
  // funnel, or already used this same link) skips straight to the calendar.
  const lead = session
    ? await prisma.lead.findUnique({ where: { id: session.leadId } })
    : null;

  return (
    <div className="relative min-h-screen bg-[#0b0713] text-white overflow-x-hidden px-5 sm:px-10 py-12">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="animate-float-blob absolute -top-40 -left-32 h-[28rem] w-[28rem] rounded-full bg-[var(--brand-primary)]/20 blur-[120px]" />
      </div>
      <div className="relative z-10 max-w-3xl mx-auto">
        {lead ? (
          <BookingCalendar
            initialAvailableDays={availableDays}
            brand={config.brand}
            booking={config.booking}
            leadFirstName={lead.fullName.trim().split(/\s+/)[0]}
          />
        ) : (
          <DirectBookingForm
            brand={config.brand}
            booking={config.booking}
            initialAvailableDays={availableDays}
            utm={{
              utmSource: pick(sp.utm_source),
              utmMedium: pick(sp.utm_medium),
              utmCampaign: pick(sp.utm_campaign),
              utmContent: pick(sp.utm_content),
              utmTerm: pick(sp.utm_term),
              utmId: pick(sp.utm_id),
            }}
            referrer={referrer}
          />
        )}
      </div>
    </div>
  );
}
