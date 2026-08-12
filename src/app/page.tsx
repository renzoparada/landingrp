import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getSiteConfig } from "@/lib/config";
import QuizWizard, { type WizardQuestion } from "@/components/QuizWizard";

export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;

function pick(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const h = await headers();
  const referrer = h.get("referer") ?? undefined;

  const [questionRows, config] = await Promise.all([
    prisma.quizQuestion
      .findMany({
        where: { active: true },
        orderBy: { order: "asc" },
      })
      .catch((error) => {
        // Falls back to an empty list when the DB isn't reachable yet (e.g.
        // during a build/static-generation pass before DATABASE_URL is
        // configured) so the app can still build and render instead of
        // hard-failing, mirroring getSiteConfig()'s fallback below.
        console.error("No se pudieron cargar las preguntas del quiz:", error);
        return [];
      }),
    getSiteConfig(),
  ]);

  const questions: WizardQuestion[] = questionRows.map((q) => ({
    id: q.id,
    question: q.question,
    helpText: q.helpText,
    type: q.type,
    options: (q.options as { label: string; score?: number }[] | null) ?? null,
    required: q.required,
  }));

  return (
    <QuizWizard
      questions={questions}
      config={{ quizIntro: config.quizIntro, brand: config.brand }}
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
  );
}
