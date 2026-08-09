import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSiteConfig } from "@/lib/config";

export const dynamic = "force-dynamic";

async function verifyToken(token: string | undefined) {
  if (!token) return { status: "missing" as const };

  const lead = await prisma.lead.findUnique({ where: { verifyToken: token } });
  if (!lead) {
    // Could already have been verified (token cleared) — treat gracefully.
    return { status: "invalid" as const };
  }

  if (lead.emailVerified) {
    return { status: "already" as const, fullName: lead.fullName };
  }

  if (lead.verifyTokenExpires && lead.verifyTokenExpires < new Date()) {
    return { status: "expired" as const };
  }

  await prisma.lead.update({
    where: { id: lead.id },
    data: { emailVerified: true, verifyToken: null, verifyTokenExpires: null },
  });

  return { status: "ok" as const, fullName: lead.fullName };
}

export default async function VerificarPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const [result, config] = await Promise.all([verifyToken(token), getSiteConfig()]);

  const brandVars = {
    ["--brand-primary" as string]: config.brand.primaryColor,
    ["--brand-secondary" as string]: config.brand.secondaryColor,
  };

  const content = (() => {
    switch (result.status) {
      case "ok":
      case "already":
        return {
          icon: "✅",
          title: `¡Correo confirmado, ${result.fullName.split(" ")[0]}!`,
          message:
            "Tu registro quedó verificado. Ya puedes continuar con tu proceso.",
        };
      case "expired":
        return {
          icon: "⏰",
          title: "El enlace expiró",
          message:
            "Vuelve a iniciar el proceso para recibir un nuevo enlace de confirmación.",
        };
      default:
        return {
          icon: "⚠️",
          title: "Enlace inválido",
          message: "No pudimos verificar este enlace. Intenta nuevamente.",
        };
    }
  })();

  return (
    <div
      style={brandVars}
      className="min-h-screen flex items-center justify-center bg-[#0b0713] text-white px-5"
    >
      <div className="animate-fade-up max-w-md w-full text-center rounded-2xl border border-white/10 bg-white/[0.03] p-8">
        <div className="text-5xl">{content.icon}</div>
        <h1 className="mt-4 text-2xl font-bold">{content.title}</h1>
        <p className="mt-2 text-white/60 text-sm">{content.message}</p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] px-6 py-3 text-sm font-semibold"
        >
          Ir al inicio
        </Link>
      </div>
    </div>
  );
}
