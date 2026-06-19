"use server";

import { redirect } from "next/navigation";
import { createSession, destroySession, hashPassword, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function normalizeEmail(value: FormDataEntryValue | null) {
  return String(value ?? "").trim().toLowerCase();
}

export async function registerUser(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = normalizeEmail(formData.get("email"));
  const password = String(formData.get("password") ?? "");

  if (!name || !email || password.length < 6) return;

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: hashPassword(password)
    }
  });

  await createSession(user.id);
  redirect("/dashboard");
}

export async function loginUser(formData: FormData) {
  const email = normalizeEmail(formData.get("email"));
  const password = String(formData.get("password") ?? "");

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !verifyPassword(password, user.passwordHash)) return;

  await createSession(user.id);
  redirect("/dashboard");
}

export async function logoutUser() {
  await destroySession();
  redirect("/login");
}
