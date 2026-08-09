import { PrismaClient, QuestionType, type Prisma } from "../src/generated/prisma";
import bcrypt from "bcryptjs";
import { defaultSiteConfig } from "../src/lib/types";

const prisma = new PrismaClient();

async function main() {
  // --- Admin user -----------------------------------------------------
  const adminEmail = process.env.ADMIN_EMAIL || "admin@landingrp.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin123!";

  const existingAdmin = await prisma.adminUser.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await prisma.adminUser.create({
      data: { email: adminEmail, passwordHash, name: "Administrador" },
    });
    console.log(`Admin creado: ${adminEmail} / ${adminPassword}`);
  } else {
    console.log(`Admin ya existe: ${adminEmail}`);
  }

  // --- Site config ------------------------------------------------------
  await prisma.siteConfig.upsert({
    where: { id: "main" },
    update: {},
    create: {
      id: "main",
      data: defaultSiteConfig as unknown as Prisma.InputJsonValue,
    },
  });

  // --- Quiz questions -----------------------------------------------------
  const questionCount = await prisma.quizQuestion.count();
  if (questionCount === 0) {
    await prisma.quizQuestion.createMany({
      data: [
        {
          order: 1,
          question: "¿Cuál es tu nivel de experiencia laboral?",
          type: QuestionType.SINGLE,
          options: [
            { label: "Sin experiencia", score: 1 },
            { label: "1 a 3 años", score: 2 },
            { label: "Más de 3 años", score: 3 },
          ],
          required: true,
          active: true,
        },
        {
          order: 2,
          question: "¿En qué país te gustaría trabajar?",
          type: QuestionType.SINGLE,
          options: [
            { label: "España", score: 2 },
            { label: "Alemania", score: 3 },
            { label: "Canadá", score: 3 },
            { label: "Otro", score: 1 },
          ],
          required: true,
          active: true,
        },
        {
          order: 3,
          question: "¿Con qué disponibilidad cuentas para viajar?",
          type: QuestionType.SINGLE,
          options: [
            { label: "Inmediata", score: 3 },
            { label: "En los próximos 3 meses", score: 2 },
            { label: "Aún no lo sé", score: 1 },
          ],
          required: true,
          active: true,
        },
        {
          order: 4,
          question: "Cuéntanos brevemente tu objetivo principal",
          type: QuestionType.TEXT,
          required: false,
          active: true,
        },
      ],
    });
    console.log("Preguntas del quiz creadas");
  }

  // --- Availability (Mon-Fri 09:00-18:00, 30 min slots) -----------------
  const availCount = await prisma.availabilityRule.count();
  if (availCount === 0) {
    const rules = [1, 2, 3, 4, 5].map((day) => ({
      dayOfWeek: day,
      startTime: "09:00",
      endTime: "18:00",
      slotMinutes: 30,
      active: true,
    }));
    await prisma.availabilityRule.createMany({ data: rules });
    console.log("Disponibilidad por defecto creada (Lun-Vie 9:00-18:00)");
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
