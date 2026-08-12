import { getSiteConfig } from "@/lib/config";
import CampaignForm from "@/components/admin/CampaignForm";
import type { CampaignContentData } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function NewCampaignPage() {
  const config = await getSiteConfig();
  const defaultContent: CampaignContentData = {
    hero: config.hero,
    offer: config.offer,
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Nueva campaña</h1>
      <p className="text-sm text-white/50 mb-6">
        Empieza con el contenido actual de tu landing y ajusta lo que
        necesites para esta campaña.
      </p>
      <CampaignForm defaultContent={defaultContent} />
    </div>
  );
}
