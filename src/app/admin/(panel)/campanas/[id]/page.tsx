import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSiteConfig } from "@/lib/config";
import CampaignForm from "@/components/admin/CampaignForm";
import QuestionsManager, {
  type QuestionRow,
} from "@/components/admin/QuestionsManager";
import type { CampaignContentData } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function EditCampaignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [campaign, config, campaignQuestions] = await Promise.all([
    prisma.campaign.findUnique({ where: { id } }),
    getSiteConfig(),
    prisma.quizQuestion.findMany({
      where: { campaignId: id },
      orderBy: { order: "asc" },
    }),
  ]);

  if (!campaign) notFound();

  const defaultContent: CampaignContentData = {
    hero: config.hero,
    offer: config.offer,
  };

  const questionRows: QuestionRow[] = campaignQuestions.map((q) => ({
    id: q.id,
    order: q.order,
    question: q.question,
    helpText: q.helpText,
    type: q.type,
    options: q.options as { label: string; score: number }[] | null,
    required: q.required,
    active: q.active,
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Editar campaña</h1>
      <p className="text-sm text-white/50 mb-6">{campaign.name}</p>
      <CampaignForm
        campaign={{
          id: campaign.id,
          name: campaign.name,
          slug: campaign.slug,
          active: campaign.active,
          data: campaign.data as unknown as CampaignContentData,
        }}
        defaultContent={defaultContent}
      />

      <div className="mt-10 pb-24">
        <h2 className="text-xl font-bold mb-1">Preguntas del quiz de esta campaña</h2>
        <p className="text-sm text-white/50 mb-6">
          Opcional. Si agregas preguntas aquí, quien entre por el link de{" "}
          <strong className="text-white/70">{campaign.name}</strong> responde
          estas en vez de las preguntas por defecto — con su propio puntaje
          por opción. Si no agregas ninguna, se usan las preguntas generales
          de <span className="text-white/70">Preguntas del quiz</span>.
        </p>
        <QuestionsManager initialQuestions={questionRows} campaignId={campaign.id} />
      </div>
    </div>
  );
}
