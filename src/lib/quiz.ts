import { prisma } from "@/lib/prisma";

/**
 * Resolves which quiz questions to show for an incoming ?utm_campaign=<slug>.
 * If that campaign exists, is active, and has its own questions, those are
 * used; otherwise falls back to the shared default quiz (campaignId = null)
 * so campaigns without a custom quiz keep working exactly as before.
 */
export async function getQuizQuestionsForCampaignSlug(campaignSlug?: string) {
  if (campaignSlug) {
    const campaign = await prisma.campaign.findUnique({
      where: { slug: campaignSlug },
    });
    if (campaign && campaign.active) {
      const campaignQuestions = await prisma.quizQuestion.findMany({
        where: { campaignId: campaign.id, active: true },
        orderBy: { order: "asc" },
      });
      if (campaignQuestions.length > 0) return campaignQuestions;
    }
  }

  return prisma.quizQuestion.findMany({
    where: { campaignId: null, active: true },
    orderBy: { order: "asc" },
  });
}
