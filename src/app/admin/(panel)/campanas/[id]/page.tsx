import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSiteConfig } from "@/lib/config";
import CampaignForm from "@/components/admin/CampaignForm";
import type { CampaignContentData } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function EditCampaignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [campaign, config] = await Promise.all([
    prisma.campaign.findUnique({ where: { id } }),
    getSiteConfig(),
  ]);

  if (!campaign) notFound();

  const defaultContent: CampaignContentData = {
    hero: config.hero,
    offer: config.offer,
  };

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
    </div>
  );
}
