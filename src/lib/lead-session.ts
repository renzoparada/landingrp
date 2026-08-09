import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

// Lightweight signed cookie that identifies a visitor who has completed the
// pre-landing quiz. This is what "unlocks" /oferta and /reservar without
// requiring a full login — it's just proof they filled the qualification form.

const LEAD_COOKIE = "landingrp_lead";
const LEAD_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error(
      "AUTH_SECRET no está configurado. Defínelo en tus variables de entorno."
    );
  }
  return new TextEncoder().encode(secret);
}

export async function createLeadSession(leadId: string) {
  const token = await new SignJWT({ leadId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${LEAD_TTL_SECONDS}s`)
    .sign(getSecret());

  const cookieStore = await cookies();
  cookieStore.set(LEAD_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: LEAD_TTL_SECONDS,
  });
}

export async function getLeadSession(): Promise<{ leadId: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(LEAD_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret());
    return { leadId: payload.leadId as string };
  } catch {
    return null;
  }
}
