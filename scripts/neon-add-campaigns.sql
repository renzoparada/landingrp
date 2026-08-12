-- =====================================================================
-- landingrp — Agrega la tabla de Campañas
-- Pega TODO este archivo en el SQL Editor de Neon (proyecto neon-coral-door)
-- y presiona "Run". No borra ni toca ninguna tabla existente.
-- =====================================================================

CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Campaign_slug_key" ON "Campaign"("slug");
CREATE INDEX "Campaign_slug_idx" ON "Campaign"("slug");

-- =====================================================================
-- Listo. Ya puedes crear campañas desde /admin/campanas
-- =====================================================================
