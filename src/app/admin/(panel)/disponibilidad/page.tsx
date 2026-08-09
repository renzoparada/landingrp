import { prisma } from "@/lib/prisma";
import AvailabilityManager from "@/components/admin/AvailabilityManager";

export const dynamic = "force-dynamic";

export default async function AdminAvailabilityPage() {
  const [rules, blocked] = await Promise.all([
    prisma.availabilityRule.findMany({
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    }),
    prisma.blockedDate.findMany({ orderBy: { date: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Disponibilidad</h1>
      <AvailabilityManager initialRules={rules} initialBlocked={blocked} />
    </div>
  );
}
