import { z } from "zod";

export const quizAnswerSchema = z.object({
  questionId: z.string().min(1),
  answer: z.union([z.string(), z.array(z.string())]),
});

export const leadSubmitSchema = z.object({
  fullName: z.string().trim().min(3, "Ingresa tu nombre completo"),
  email: z.string().trim().email("Ingresa un correo válido"),
  phoneDialCode: z.string().min(1, "Selecciona tu país"),
  phoneCountryIso: z.string().optional(),
  phoneNumber: z
    .string()
    .trim()
    .min(5, "Ingresa un número de teléfono válido")
    .max(20),
  city: z.string().trim().min(2, "Ingresa tu ciudad"),
  country: z.string().trim().min(2, "Selecciona tu país"),
  answers: z.array(quizAnswerSchema).default([]),
  // "/" for the quiz funnel, "/agendar" for the direct-booking shortcut link.
  landingPath: z.string().optional(),
  utmSource: z.string().optional().nullable(),
  utmMedium: z.string().optional().nullable(),
  utmCampaign: z.string().optional().nullable(),
  utmContent: z.string().optional().nullable(),
  utmTerm: z.string().optional().nullable(),
  utmId: z.string().optional().nullable(),
  referrer: z.string().optional().nullable(),
});

export type LeadSubmitInput = z.infer<typeof leadSubmitSchema>;

export const bookingSubmitSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  notes: z.string().max(500).optional(),
});

export const questionOptionSchema = z.object({
  label: z.string().min(1),
  score: z.number().int().min(0).max(10).default(0),
});

export const questionUpsertSchema = z.object({
  id: z.string().optional(),
  order: z.number().int().default(0),
  question: z.string().min(3),
  helpText: z.string().optional().nullable(),
  type: z.enum(["SINGLE", "MULTI", "TEXT"]),
  options: z.array(questionOptionSchema).optional(),
  required: z.boolean().default(true),
  active: z.boolean().default(true),
  // null/omitted = shared default quiz. Set = belongs only to that campaign.
  campaignId: z.string().optional().nullable(),
});

export const availabilityRuleSchema = z.object({
  id: z.string().optional(),
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  slotMinutes: z.number().int().min(5).max(240),
  active: z.boolean().default(true),
});

export const blockedDateSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reason: z.string().optional().nullable(),
});

export const campaignHeroSchema = z.object({
  badge: z.string().default(""),
  title: z.string().min(1, "Ingresa un título"),
  highlight: z.string().default(""),
  subtitle: z.string().default(""),
  ctaLabel: z.string().min(1, "Ingresa el texto del botón"),
  videoSource: z.enum(["youtube", "vimeo", "mp4", "none"]),
  videoUrl: z.string().default(""),
});

export const campaignOfferSchema = z.object({
  enabled: z.boolean().default(true),
  title: z.string().default(""),
  description: z.string().default(""),
  expiresAt: z.string().min(1),
  expiredMessage: z.string().default(""),
  priceOriginal: z.string().optional(),
  priceOffer: z.string().optional(),
});

export const campaignSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2, "Ingresa un nombre para la campaña"),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(2, "El link debe tener al menos 2 caracteres")
    .max(60, "Máximo 60 caracteres")
    .regex(
      /^[a-z0-9]+(-[a-z0-9]+)*$/,
      "Solo minúsculas, números y guiones (sin espacios ni tildes)"
    ),
  active: z.boolean().default(true),
  hero: campaignHeroSchema,
  offer: campaignOfferSchema,
});

export type CampaignInput = z.infer<typeof campaignSchema>;

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
