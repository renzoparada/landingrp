"use server";

import { prisma } from "@/lib/prisma";
import { leadSubmitSchema, type LeadSubmitInput } from "@/lib/validation";
import { nanoid } from "nanoid";
import { createLeadSession } from "@/lib/lead-session";
import { sendEmail, verificationEmailTemplate } from "@/lib/email";
import { getSiteConfig } from "@/lib/config";
import { getBaseUrl } from "@/lib/url";

interface QuestionOption {
  label: string;
  score?: number;
}

export type SubmitLeadResult =
  | { ok: true; leadId: string }
  | { ok: false; error: string };

export async function submitLead(
  input: LeadSubmitInput
): Promise<SubmitLeadResult> {
  const parsed = leadSubmitSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }
  const data = parsed.data;

  // --- Lead scoring based on the option scores configured per question ---
  const questions = await prisma.quizQuestion.findMany({
    where: { active: true },
  });

  let score = 0;
  for (const ans of data.answers) {
    const question = questions.find((q) => q.id === ans.questionId);
    if (!question || !question.options) continue;
    const options = question.options as unknown as QuestionOption[];
    const chosen = Array.isArray(ans.answer) ? ans.answer : [ans.answer];
    for (const label of chosen) {
      const opt = options.find((o) => o.label === label);
      if (opt) score += opt.score ?? 0;
    }
  }

  const verifyToken = nanoid(40);

  let lead;
  try {
    lead = await prisma.lead.create({
      data: {
        fullName: data.fullName,
        email: data.email.toLowerCase(),
        phoneDialCode: data.phoneDialCode,
        phoneCountryIso: data.phoneCountryIso,
        phoneNumber: data.phoneNumber,
        city: data.city,
        country: data.country,
        score,
        verifyToken,
        verifyTokenExpires: new Date(Date.now() + 1000 * 60 * 60 * 48),
        utmSource: data.utmSource || undefined,
        utmMedium: data.utmMedium || undefined,
        utmCampaign: data.utmCampaign || undefined,
        utmContent: data.utmContent || undefined,
        utmTerm: data.utmTerm || undefined,
        utmId: data.utmId || undefined,
        referrer: data.referrer || undefined,
        landingPath: data.landingPath || "/",
        answers: {
          create: data.answers
            .filter((a) => questions.some((q) => q.id === a.questionId))
            .map((a) => ({
              questionId: a.questionId,
              answer: a.answer as unknown as object,
            })),
        },
      },
    });
  } catch (error) {
    console.error("Error creando lead:", error);
    return {
      ok: false,
      error: "No pudimos guardar tus datos. Intenta nuevamente.",
    };
  }

  await createLeadSession(lead.id);

  // Fire-and-forget the double opt-in email (don't block the funnel on it).
  const config = await getSiteConfig();
  const baseUrl = await getBaseUrl();
  const verifyUrl = `${baseUrl}/verificar?token=${verifyToken}`;
  sendEmail({
    to: lead.email,
    subject: `Confirma tu correo — ${config.brand.name}`,
    html: verificationEmailTemplate({
      fullName: lead.fullName,
      verifyUrl,
      brandName: config.brand.name,
      primaryColor: config.brand.primaryColor,
    }),
  }).catch((e) => console.error("Error enviando email de verificación:", e));

  return { ok: true, leadId: lead.id };
}
