import { getSiteConfig } from "@/lib/config";
import ContentEditor from "@/components/admin/ContentEditor";

export const dynamic = "force-dynamic";

export default async function AdminContentPage() {
  const config = await getSiteConfig();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Contenido de la landing</h1>
      <ContentEditor initialConfig={config} />
    </div>
  );
}
