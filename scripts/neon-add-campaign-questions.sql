-- =====================================================================
-- landingrp — Permite que cada campaña tenga sus propias preguntas de quiz
-- Pega TODO este archivo en el SQL Editor de Neon (proyecto neon-coral-door)
-- y presiona "Run". No borra ni toca ninguna tabla existente.
-- =====================================================================

ALTER TABLE "QuizQuestion" ADD COLUMN     "campaignId" TEXT;

CREATE INDEX "QuizQuestion_campaignId_idx" ON "QuizQuestion"("campaignId");

ALTER TABLE "QuizQuestion" ADD CONSTRAINT "QuizQuestion_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- =====================================================================
-- Listo. Ahora en Campañas → editar campaña puedes agregarle preguntas
-- propias con su propio puntaje.
-- =====================================================================
