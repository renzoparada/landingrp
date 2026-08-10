-- =====================================================================
-- landingrp — Configuración inicial de la base de datos en Neon
-- Pega TODO este archivo (de arriba a abajo) en el SQL Editor de Neon
-- y presiona "Run" una sola vez.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) ESQUEMA (tablas)
-- ---------------------------------------------------------------------

CREATE TYPE "QuestionType" AS ENUM ('SINGLE', 'MULTI', 'TEXT');

CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SiteConfig" (
    "id" TEXT NOT NULL DEFAULT 'main',
    "data" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteConfig_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "QuizQuestion" (
    "id" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "question" TEXT NOT NULL,
    "helpText" TEXT,
    "type" "QuestionType" NOT NULL DEFAULT 'SINGLE',
    "options" JSONB,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuizQuestion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "QuizAnswer" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "answer" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuizAnswer_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifyToken" TEXT,
    "verifyTokenExpires" TIMESTAMP(3),
    "phoneDialCode" TEXT NOT NULL,
    "phoneCountryIso" TEXT,
    "phoneNumber" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "utmContent" TEXT,
    "utmTerm" TEXT,
    "utmId" TEXT,
    "referrer" TEXT,
    "landingPath" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AvailabilityRule" (
    "id" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "slotMinutes" INTEGER NOT NULL DEFAULT 30,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AvailabilityRule_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BlockedDate" (
    "id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "reason" TEXT,

    CONSTRAINT "BlockedDate_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'America/Lima',
    "status" TEXT NOT NULL DEFAULT 'confirmed',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");
CREATE INDEX "QuizQuestion_order_idx" ON "QuizQuestion"("order");
CREATE INDEX "QuizAnswer_leadId_idx" ON "QuizAnswer"("leadId");
CREATE INDEX "QuizAnswer_questionId_idx" ON "QuizAnswer"("questionId");
CREATE UNIQUE INDEX "Lead_verifyToken_key" ON "Lead"("verifyToken");
CREATE INDEX "Lead_email_idx" ON "Lead"("email");
CREATE INDEX "Lead_createdAt_idx" ON "Lead"("createdAt");
CREATE UNIQUE INDEX "BlockedDate_date_key" ON "BlockedDate"("date");
CREATE INDEX "Booking_leadId_idx" ON "Booking"("leadId");
CREATE UNIQUE INDEX "Booking_date_startTime_key" ON "Booking"("date", "startTime");

ALTER TABLE "QuizAnswer" ADD CONSTRAINT "QuizAnswer_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "QuizAnswer" ADD CONSTRAINT "QuizAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "QuizQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ---------------------------------------------------------------------
-- 2) DATOS INICIALES (seed)
-- ---------------------------------------------------------------------

-- Usuario administrador: admin@landingrp.com / Admin123!
INSERT INTO "AdminUser" ("id", "email", "passwordHash", "name", "createdAt", "updatedAt")
VALUES (
  'd3e49fe5-ef28-4ca1-a5b9-012be1ecccd9',
  'admin@landingrp.com',
  '$2b$10$MrL42ARKCy796hCZpgjLR.zjRr1btgDI0Xg.owUeQlQYwB2vFOnhe',
  'Administrador',
  now(),
  now()
);

-- Configuración del sitio (textos, hero, oferta, testimonios, FAQs, etc.)
INSERT INTO "SiteConfig" ("id", "data", "updatedAt")
VALUES (
  'main',
  '{
    "brand": {
      "name": "Global Talent",
      "primaryColor": "#7c3aed",
      "secondaryColor": "#0ea5e9"
    },
    "quizIntro": {
      "eyebrow": "Antes de continuar",
      "title": "Responde 4 preguntas rápidas",
      "subtitle": "Así podemos preparar una propuesta a tu medida antes de tu entrevista."
    },
    "hero": {
      "badge": "Cupos limitados esta semana",
      "title": "Trabaja y vive en el extranjero",
      "highlight": "con acompañamiento 100% personalizado",
      "subtitle": "Programa integral de reubicación laboral: preparamos tu perfil, tu CV y te conectamos con empleadores verificados.",
      "ctaLabel": "Reservar mi entrevista gratis",
      "videoSource": "youtube",
      "videoUrl": "https://www.youtube.com/embed/dQw4w9WgXcQ"
    },
    "offer": {
      "enabled": true,
      "title": "Oferta de lanzamiento",
      "description": "Asesoría inicial y evaluación de perfil sin costo — solo para los próximos inscritos.",
      "expiresAt": "2026-08-12T00:00:00.000Z",
      "expiredMessage": "Esta oferta ha expirado, pero puedes escribirnos para conocer los cupos disponibles.",
      "priceOriginal": "$149",
      "priceOffer": "Gratis"
    },
    "benefits": [
      { "id": "b1", "icon": "🌍", "title": "Ofertas verificadas", "description": "Trabajamos solo con empleadores y programas verificados." },
      { "id": "b2", "icon": "🧭", "title": "Acompañamiento completo", "description": "Desde tu CV hasta la visa: te guiamos en cada paso." },
      { "id": "b3", "icon": "⏱️", "title": "Proceso rápido", "description": "Empieza tu proceso en menos de 30 minutos." },
      { "id": "b4", "icon": "🤝", "title": "Asesoría 1 a 1", "description": "Un asesor dedicado analiza tu perfil personalmente." }
    ],
    "testimonials": [
      { "id": "t1", "name": "Camila R.", "role": "Enfermera — ahora en España", "quote": "En menos de dos meses tenía mi oferta firmada. El acompañamiento fue clave.", "rating": 5 },
      { "id": "t2", "name": "Jorge M.", "role": "Técnico en logística — ahora en Alemania", "quote": "Muy profesionales, respondieron todas mis dudas sin presionar.", "rating": 5 },
      { "id": "t3", "name": "Valeria P.", "role": "Asistente administrativa — ahora en Canadá", "quote": "El proceso fue transparente de principio a fin. Lo recomiendo.", "rating": 5 }
    ],
    "faqs": [
      { "id": "f1", "question": "¿Tiene algún costo la evaluación inicial?", "answer": "No, la primera evaluación de tu perfil es completamente gratuita." },
      { "id": "f2", "question": "¿Necesito experiencia previa?", "answer": "Depende del programa; muchas de nuestras vacantes son para nivel inicial." },
      { "id": "f3", "question": "¿Cuánto dura el proceso completo?", "answer": "En promedio entre 6 y 12 semanas, dependiendo del país y del perfil." }
    ],
    "booking": {
      "title": "Agenda tu entrevista",
      "subtitle": "Elige el día y la hora que mejor te acomode.",
      "timezone": "America/Lima",
      "meetingDurationLabel": "30 minutos por videollamada",
      "confirmationMessage": "¡Listo! Tu entrevista quedó agendada. Te enviamos la confirmación por correo."
    },
    "footer": {
      "text": "© Global Talent. Todos los derechos reservados."
    }
  }'::jsonb,
  now()
);

-- Deja la cuenta regresiva de la oferta apuntando a 48 horas desde que se
-- ejecuta este script (en vez de una fecha fija que quedaría vieja).
UPDATE "SiteConfig"
SET data = jsonb_set(
  data,
  '{offer,expiresAt}',
  to_jsonb(to_char(now() + interval '48 hours', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'))
)
WHERE id = 'main';

-- Preguntas del quiz
INSERT INTO "QuizQuestion" ("id", "order", "question", "helpText", "type", "options", "required", "active", "createdAt", "updatedAt")
VALUES
(
  '3eba76d7-cfbd-40ec-b15c-24594598561f',
  1,
  '¿Cuál es tu nivel de experiencia laboral?',
  NULL,
  'SINGLE',
  '[{"label":"Sin experiencia","score":1},{"label":"1 a 3 años","score":2},{"label":"Más de 3 años","score":3}]'::jsonb,
  true,
  true,
  now(),
  now()
),
(
  '85e62e0e-aa7a-4e13-8c1d-4595ae0101cc',
  2,
  '¿En qué país te gustaría trabajar?',
  NULL,
  'SINGLE',
  '[{"label":"España","score":2},{"label":"Alemania","score":3},{"label":"Canadá","score":3},{"label":"Otro","score":1}]'::jsonb,
  true,
  true,
  now(),
  now()
),
(
  '100d0a6e-e96b-4bd6-bc94-abeb855a69e4',
  3,
  '¿Con qué disponibilidad cuentas para viajar?',
  NULL,
  'SINGLE',
  '[{"label":"Inmediata","score":3},{"label":"En los próximos 3 meses","score":2},{"label":"Aún no lo sé","score":1}]'::jsonb,
  true,
  true,
  now(),
  now()
),
(
  '467375fe-e6ae-4ff1-9c68-6a596388ce62',
  4,
  'Cuéntanos brevemente tu objetivo principal',
  NULL,
  'TEXT',
  NULL,
  false,
  true,
  now(),
  now()
);

-- Disponibilidad por defecto (Lunes a Viernes, 09:00–18:00, turnos de 30 min)
INSERT INTO "AvailabilityRule" ("id", "dayOfWeek", "startTime", "endTime", "slotMinutes", "active", "createdAt", "updatedAt")
VALUES
('1f523df5-eb2d-42c2-8eda-fbb88d4d1e11', 1, '09:00', '18:00', 30, true, now(), now()),
('8a3f466b-7d00-4a0b-a982-98e17b0fd98d', 2, '09:00', '18:00', 30, true, now(), now()),
('5471ebcd-0c85-4fc4-b57f-0d2131b72803', 3, '09:00', '18:00', 30, true, now(), now()),
('7c00dcf7-17f5-4122-8893-9c052ba36ae6', 4, '09:00', '18:00', 30, true, now(), now()),
('2ae991f0-2720-488f-ac67-843e7a6dbba9', 5, '09:00', '18:00', 30, true, now(), now());

-- =====================================================================
-- Listo. Si todo corrió sin errores, tu base de datos ya tiene las
-- tablas y los datos iniciales (admin, textos del sitio, preguntas del
-- quiz y horarios disponibles).
-- =====================================================================
