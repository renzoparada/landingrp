"use server";

import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validation";
import { createAdminSession, destroyAdminSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

export type LoginResult = { ok: true } | { ok: false; error: string };

export async function login(input: {
  email: string;
  password: string;
}): Promise<LoginResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Ingresa un correo y contraseña válidos." };
  }

  const admin = await prisma.adminUser.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
  });
  if (!admin) {
    return { ok: false, error: "Credenciales incorrectas." };
  }

  const valid = await bcrypt.compare(parsed.data.password, admin.passwordHash);
  if (!valid) {
    return { ok: false, error: "Credenciales incorrectas." };
  }

  await createAdminSession({ sub: admin.id, email: admin.email });
  return { ok: true };
}

export async function logout() {
  await destroyAdminSession();
}
