"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { normalizeJoinCode } from "@/lib/team-code";

const MAX_TEAM_SIZE = 200;

function sanitizeName(raw: string): string {
  return raw
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 40);
}

/** Public, no-auth: add the visitor to a team by its join code. */
export async function joinTeam(formData: FormData): Promise<void> {
  const code = normalizeJoinCode(String(formData.get("code") ?? ""));
  const name = sanitizeName(String(formData.get("name") ?? ""));

  if (!code) {
    redirect(`/join?error=${encodeURIComponent("That code is not valid.")}`);
  }
  if (!name) {
    redirect(`/join/${code}?error=${encodeURIComponent("Please enter your name.")}`);
  }

  const team = await prisma.team.findUnique({
    where: { joinCode: code },
    include: { _count: { select: { members: true } } },
  });

  if (!team) {
    redirect(`/join/${code}?error=${encodeURIComponent("No team found for that code.")}`);
  }
  if (team._count.members >= MAX_TEAM_SIZE) {
    redirect(`/join/${code}?error=${encodeURIComponent("This team is already full.")}`);
  }

  await prisma.teamMember.create({ data: { teamId: team.id, name } });

  revalidatePath("/dashboard");
  revalidatePath("/display");
  revalidatePath("/overview");

  redirect(`/join/${code}?joined=1&name=${encodeURIComponent(name)}`);
}

/** Public: jump from the manual code-entry form to that team's join page. */
export async function enterJoinCode(formData: FormData): Promise<void> {
  const code = normalizeJoinCode(String(formData.get("code") ?? ""));
  if (!code) {
    redirect(`/join?error=${encodeURIComponent("Enter the 6-character code.")}`);
  }
  redirect(`/join/${code}`);
}
