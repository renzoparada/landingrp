import { prisma } from "@/lib/prisma";
import QuestionsManager, {
  type QuestionRow,
} from "@/components/admin/QuestionsManager";

export const dynamic = "force-dynamic";

export default async function AdminQuestionsPage() {
  const questions = await prisma.quizQuestion.findMany({
    orderBy: { order: "asc" },
  });

  const rows: QuestionRow[] = questions.map((q) => ({
    id: q.id,
    order: q.order,
    question: q.question,
    helpText: q.helpText,
    type: q.type,
    options: q.options as { label: string; score: number }[] | null,
    required: q.required,
    active: q.active,
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Preguntas del quiz</h1>
      <p className="text-sm text-white/50 mb-6">
        Estas preguntas se muestran antes de la landing para ir perfilando al
        cliente. El puntaje de cada opción se suma al perfil del lead.
      </p>
      <QuestionsManager initialQuestions={rows} />
    </div>
  );
}
