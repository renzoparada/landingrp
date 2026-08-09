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

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
