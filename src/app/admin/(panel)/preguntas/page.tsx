import { prisma } from "@/lib/prisma";
import QuestionsManager, {
  type QuestionRow,
} from "@/components/admin/QuestionsManager";

export const dynamic = "force-dynamic";

export default async function AdminQuestionsPage() {
  const questions = await prisma.quizQuestion.findMany({
    where: { campaignId: null },
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
      <h1 className="text-2xl font-bold mb-2">Preguntas del quiz (por defecto)</h1>
      <p className="text-sm text-white/50 mb-6">
        Estas preguntas se muestran antes de la landing para ir perfilando al
        cliente. El puntaje de cada opción se suma al perfil del lead. Son
        las que se usan cuando el link no pertenece a ninguna campaña, o
        cuando una campaña no tiene sus propias preguntas — cada campaña
        puede tener las suyas desde{" "}
        <span className="text-white/70">Campañas → editar campaña</span>.
      </p>
      <QuestionsManager initialQuestions={rows} />
    </div>
  );
}
