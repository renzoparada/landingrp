"use server";

import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";
import { questionUpsertSchema } from "@/lib/validation";
import { revalidatePath } from "next/cache";
import type { QuestionType } from "@/generated/prisma";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function upsertQuestion(
  input: unknown
): Promise<ActionResult> {
  try {
    await requireAdminSession();
  } catch {
    return { ok: false, error: "No autorizado." };
  }

  const parsed = questionUpsertSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  const data = parsed.data;

  try {
    if (data.id) {
      await prisma.quizQuestion.update({
        where: { id: data.id },
        data: {
          order: data.order,
          question: data.question,
          helpText: data.helpText || null,
          type: data.type as QuestionType,
          options: data.options ?? undefined,
          required: data.required,
          active: data.active,
        },
      });
    } else {
      await prisma.quizQuestion.create({
        data: {
          order: data.order,
          question: data.question,
          helpText: data.helpText || null,
          type: data.type as QuestionType,
          options: data.options ?? undefined,
          required: data.required,
          active: data.active,
        },
      });
    }
  } catch (error) {
    console.error("Error guardando pregunta:", error);
    return { ok: false, error: "No se pudo guardar la pregunta." };
  }

  revalidatePath("/admin/preguntas");
  return { ok: true };
}

export async function deleteQuestion(id: string): Promise<ActionResult> {
  try {
    await requireAdminSession();
  } catch {
    return { ok: false, error: "No autorizado." };
  }

  await prisma.quizQuestion.delete({ where: { id } });
  revalidatePath("/admin/preguntas");
  return { ok: true };
}

export async function reorderQuestions(
  orderedIds: string[]
): Promise<ActionResult> {
  try {
    await requireAdminSession();
  } catch {
    return { ok: false, error: "No autorizado." };
  }

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.quizQuestion.update({ where: { id }, data: { order: index } })
    )
  );
  revalidatePath("/admin/preguntas");
  return { ok: true };
}
