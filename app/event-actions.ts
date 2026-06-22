"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type EventActionResult = { error?: string };

function parseInteger(value: FormDataEntryValue | null, fallback = 0) {
  if (typeof value !== "string") return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export async function createEventWorkspace(formData: FormData): Promise<EventActionResult> {
  const user = await requireUser();
  const title = String(formData.get("title") ?? "").trim() || "Family Day";
  const year = parseInteger(formData.get("year"), new Date().getFullYear());
  const location = String(formData.get("location") ?? "").trim() || null;

  if (!year) return { error: "A valid year is required." };

  try {
    const event = await prisma.familyDayEvent.create({
      data: { userId: user.id, title, year, location }
    });

    revalidatePath("/events");
    revalidatePath("/dashboard");
    redirect(`/dashboard?eventId=${event.id}`);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to create event." };
  }
}

export async function duplicateEventWorkspace(formData: FormData): Promise<EventActionResult> {
  const user = await requireUser();
  const sourceEventId = parseInteger(formData.get("eventId"));
  const targetYear = parseInteger(formData.get("targetYear"), new Date().getFullYear() + 1);

  if (!sourceEventId) return { error: "Source event ID is required." };

  try {
    const source = await prisma.familyDayEvent.findFirst({
      where: { id: sourceEventId, userId: user.id },
      include: {
        games: { orderBy: [{ order: "asc" }, { name: "asc" }] },
        timetable: { orderBy: [{ createdAt: "asc" }] },
        teams: { include: { members: true }, orderBy: { name: "asc" } }
      }
    });

    if (!source) return { error: "Source event not found or you do not have access." };

    const event = await prisma.familyDayEvent.create({
      data: {
        userId: user.id,
        title: source.title.replace(String(source.year), String(targetYear)) || source.title,
        year: targetYear,
        location: source.location,
        startDate: null,
        endDate: null,
        games: {
          create: source.games.map((game) => ({ name: game.name, description: game.description, includeInScore: game.includeInScore, order: game.order, rounds: game.rounds }))
        },
        timetable: {
          create: source.timetable.map((item) => ({
            scheduleDate: null,
            time: item.time,
            title: item.title,
            pic: item.pic,
            location: item.location,
            notes: item.notes,
            order: item.order
          }))
        },
        teams: {
          create: source.teams.map((team) => ({
            name: team.name,
            members: { create: team.members.map((member) => ({ name: member.name })) }
          }))
        }
      }
    });

    revalidatePath("/events");
    revalidatePath("/dashboard");
    redirect(`/dashboard?eventId=${event.id}`);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to duplicate event." };
  }
}