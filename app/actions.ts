"use server";

import { revalidatePath } from "next/cache";
import { requireEventOwner, requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type ActionResult = { error?: string };

function parseDate(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value.trim()) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function parseTime(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!trimmed) return "";

  const normalized = trimmed.match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);
  if (!normalized) return trimmed;

  let hours = Number.parseInt(normalized[1], 10);
  const minutes = Number.parseInt(normalized[2], 10);
  const meridiem = normalized[3]?.toUpperCase();

  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return trimmed;
  if (meridiem === "AM" && hours === 12) hours = 0;
  if (meridiem === "PM" && hours < 12) hours += 12;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function parseInteger(value: FormDataEntryValue | null, fallback = 0) {
  if (typeof value !== "string") return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseMembers(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return [];
  return value
    .split(/[\n,]/)
    .map((member) => member.trim())
    .filter(Boolean);
}

export async function saveEvent(formData: FormData): Promise<ActionResult> {
  const title = String(formData.get("title") ?? "").trim();
  const year = parseInteger(formData.get("year"));
  const startDate = parseDate(formData.get("startDate"));
  const endDate = parseDate(formData.get("endDate"));
  const location = String(formData.get("location") ?? "").trim() || null;
  const eventId = parseInteger(formData.get("eventId"), 0);

  if (!title || !year) return { error: "Event title and year are required." };

  const user = await requireUser();

  try {
    if (eventId) {
      await requireEventOwner(eventId);
      await prisma.familyDayEvent.update({
        where: { id: eventId },
        data: { title, year, startDate, endDate, location }
      });
    } else {
      await prisma.familyDayEvent.create({
        data: { userId: user.id, title, year, startDate, endDate, location }
      });
    }

    revalidatePath("/");
    revalidatePath("/dashboard");
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to save event." };
  }
}

export async function createTeam(formData: FormData): Promise<ActionResult> {
  const eventId = parseInteger(formData.get("eventId"));
  const name = String(formData.get("name") ?? "").trim();
  const members = parseMembers(formData.get("members"));

  if (!eventId || !name) return { error: "Event ID and team name are required." };

  try {
    await requireEventOwner(eventId);

    const team = await prisma.team.create({
      data: {
        eventId,
        name,
        members: {
          create: members.map((member) => ({ name: member }))
        }
      }
    });

    if (!team) return { error: "Failed to create team." };

    revalidatePath("/");
    revalidatePath("/dashboard");
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to create team." };
  }
}

export async function updateTeam(formData: FormData): Promise<ActionResult> {
  const teamId = parseInteger(formData.get("teamId"));
  const name = String(formData.get("name") ?? "").trim();
  const members = parseMembers(formData.get("members"));

  if (!teamId || !name) return { error: "Team ID and name are required." };

  try {
    const team = await prisma.team.findFirst({ where: { id: teamId, event: { userId: (await requireUser()).id } } });
    if (!team) return { error: "Team not found or you do not have access." };

    await prisma.team.update({
      where: { id: teamId },
      data: {
        name,
        members: {
          deleteMany: {},
          create: members.map((member) => ({ name: member }))
        }
      }
    });

    revalidatePath("/");
    revalidatePath("/dashboard");
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to update team." };
  }
}

export async function deleteTeam(formData: FormData): Promise<ActionResult> {
  const teamId = parseInteger(formData.get("teamId"));

  if (!teamId) return { error: "Team ID is required." };

  try {
    const team = await prisma.team.findFirst({ where: { id: teamId, event: { userId: (await requireUser()).id } } });
    if (!team) return { error: "Team not found or you do not have access." };

    await prisma.team.delete({
      where: { id: teamId }
    });

    revalidatePath("/");
    revalidatePath("/dashboard");
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to delete team." };
  }
}

export async function createGame(formData: FormData): Promise<ActionResult> {
  const eventId = parseInteger(formData.get("eventId"));
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const includeInScore = formData.get("includeInScore") === "on";
  const order = parseInteger(formData.get("order"), 0);
  const rounds = Math.max(1, parseInteger(formData.get("rounds"), 1));

  if (!eventId || !name) return { error: "Event ID and game name are required." };

  try {
    await requireEventOwner(eventId);

    await prisma.game.create({
      data: { eventId, name, description: description || null, includeInScore, order, rounds }
    });

    revalidatePath("/");
    revalidatePath("/dashboard");
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to create game." };
  }
}

export async function updateGame(formData: FormData): Promise<ActionResult> {
  const gameId = parseInteger(formData.get("gameId"));
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const includeInScore = formData.get("includeInScore") === "on";
  const order = parseInteger(formData.get("order"), 0);
  const rounds = Math.max(1, parseInteger(formData.get("rounds"), 1));

  if (!gameId || !name) return { error: "Game ID and name are required." };

  try {
    const game = await prisma.game.findFirst({ where: { id: gameId, event: { userId: (await requireUser()).id } } });
    if (!game) return { error: "Game not found or you do not have access." };

    await prisma.game.update({
      where: { id: gameId },
      data: { name, description: description || null, includeInScore, order, rounds }
    });

    revalidatePath("/");
    revalidatePath("/dashboard");
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to update game." };
  }
}

export async function deleteGame(formData: FormData): Promise<ActionResult> {
  const gameId = parseInteger(formData.get("gameId"));

  if (!gameId) return { error: "Game ID is required." };

  try {
    const game = await prisma.game.findFirst({ where: { id: gameId, event: { userId: (await requireUser()).id } } });
    if (!game) return { error: "Game not found or you do not have access." };

    await prisma.game.delete({
      where: { id: gameId }
    });

    revalidatePath("/");
    revalidatePath("/dashboard");
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to delete game." };
  }
}

export async function updateGameOrder(orderedGameIds: number[]): Promise<ActionResult> {
  if (!orderedGameIds || orderedGameIds.length === 0) return { error: "No game IDs provided." };

  try {
    const user = await requireUser();
    const ownedCount = await prisma.game.count({ where: { id: { in: orderedGameIds }, event: { userId: user.id } } });
    if (ownedCount !== orderedGameIds.length) return { error: "Some games do not belong to your account." };

    await prisma.$transaction(
      orderedGameIds.map((gameId, index) =>
        prisma.game.update({
          where: { id: gameId },
          data: { order: index + 1 }
        })
      )
    );

    revalidatePath("/");
    revalidatePath("/dashboard");
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to update game order." };
  }
}

export async function createTentativeSchedule(formData: FormData): Promise<ActionResult> {
  const eventId = parseInteger(formData.get("eventId"));
  const scheduleDate = parseDate(formData.get("scheduleDate"));
  const time = parseTime(formData.get("time"));
  const title = String(formData.get("title") ?? "").trim();
  const pic = String(formData.get("pic") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!eventId || !time || !title) return { error: "Event ID, time, and activity title are required." };

  try {
    await requireEventOwner(eventId);

    await prisma.tentativeSchedule.create({
      data: {
        eventId,
        scheduleDate,
        time,
        title,
        pic: pic || null,
        location: location || null,
        notes: notes || null
      }
    });

    revalidatePath("/");
    revalidatePath("/dashboard");
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to create agenda slot." };
  }
}

export async function updateTentativeSchedule(formData: FormData): Promise<ActionResult> {
  const scheduleId = parseInteger(formData.get("scheduleId"));
  const scheduleDate = parseDate(formData.get("scheduleDate"));
  const time = parseTime(formData.get("time"));
  const title = String(formData.get("title") ?? "").trim();
  const pic = String(formData.get("pic") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!scheduleId || !time || !title) return { error: "Schedule ID, time, and title are required." };

  try {
    const schedule = await prisma.tentativeSchedule.findFirst({ where: { id: scheduleId, event: { userId: (await requireUser()).id } } });
    if (!schedule) return { error: "Agenda item not found or you do not have access." };

    await prisma.tentativeSchedule.update({
      where: { id: scheduleId },
      data: {
        scheduleDate,
        time,
        title,
        pic: pic || null,
        location: location || null,
        notes: notes || null
      }
    });

    revalidatePath("/");
    revalidatePath("/dashboard");
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to update agenda slot." };
  }
}

export async function deleteTentativeSchedule(formData: FormData): Promise<ActionResult> {
  const scheduleId = parseInteger(formData.get("scheduleId"));

  if (!scheduleId) return { error: "Schedule ID is required." };

  try {
    const schedule = await prisma.tentativeSchedule.findFirst({ where: { id: scheduleId, event: { userId: (await requireUser()).id } } });
    if (!schedule) return { error: "Agenda item not found or you do not have access." };

    await prisma.tentativeSchedule.delete({
      where: { id: scheduleId }
    });

    revalidatePath("/");
    revalidatePath("/dashboard");
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to delete agenda slot." };
  }
}

export async function saveScore(formData: FormData): Promise<ActionResult> {
  const eventId = parseInteger(formData.get("eventId"));
  const teamId = parseInteger(formData.get("teamId"));
  const gameId = parseInteger(formData.get("gameId"));
  const round = Math.max(1, parseInteger(formData.get("round"), 1));
  const placement = parseInteger(formData.get("placement"));

  if (!eventId || !teamId || !gameId || placement < 1) return { error: "Event, team, game, and placement are required." };

  try {
    await requireEventOwner(eventId);
    const team = await prisma.team.findFirst({ where: { id: teamId, eventId } });
    const game = await prisma.game.findFirst({ where: { id: gameId, eventId } });
    if (!team || !game || round > game.rounds) return { error: "Invalid team, game, or round." };

    await prisma.score.upsert({
      where: { teamId_gameId_round: { teamId, gameId, round } },
      update: { eventId, points: placement },
      create: { eventId, teamId, gameId, round, points: placement }
    });

    revalidatePath("/");
    revalidatePath("/dashboard");
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to save score." };
  }
}

export async function saveGamePlacements(formData: FormData): Promise<ActionResult> {
  const eventId = parseInteger(formData.get("eventId"));
  const gameId = parseInteger(formData.get("gameId"));
  const round = Math.max(1, parseInteger(formData.get("round"), 1));
  const orderedTeamIds = String(formData.get("orderedTeamIds") ?? "")
    .split(",")
    .map((value) => Number.parseInt(value, 10))
    .filter((value) => Number.isFinite(value) && value > 0);

  if (!eventId || !gameId || orderedTeamIds.length === 0) return { error: "Event, game, and at least one team are required." };

  try {
    await requireEventOwner(eventId);
    const game = await prisma.game.findFirst({ where: { id: gameId, eventId } });
    const teamCount = await prisma.team.count({ where: { id: { in: orderedTeamIds }, eventId } });
    if (!game || round > game.rounds || teamCount !== orderedTeamIds.length) return { error: "Invalid game or team selection." };

    await prisma.$transaction([
      prisma.score.deleteMany({ where: { gameId, round } }),
      prisma.score.createMany({
        data: orderedTeamIds.map((teamId, index) => ({
          eventId,
          gameId,
          teamId,
          round,
          points: index + 1
        }))
      })
    ]);

    revalidatePath("/");
    revalidatePath("/dashboard");
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to save placements." };
  }
}

export async function clearGamePlacements(formData: FormData): Promise<ActionResult> {
  const gameId = parseInteger(formData.get("gameId"));
  const round = Math.max(1, parseInteger(formData.get("round"), 1));

  if (!gameId) return { error: "Game ID is required." };

  try {
    const game = await prisma.game.findFirst({ where: { id: gameId, event: { userId: (await requireUser()).id } } });
    if (!game || round > game.rounds) return { error: "Game not found or invalid round." };

    await prisma.score.deleteMany({
      where: { gameId, round }
    });

    revalidatePath("/");
    revalidatePath("/dashboard");
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to clear placements." };
  }
}

export async function deleteScore(formData: FormData): Promise<ActionResult> {
  const teamId = parseInteger(formData.get("teamId"));
  const gameId = parseInteger(formData.get("gameId"));
  const round = Math.max(1, parseInteger(formData.get("round"), 1));

  if (!teamId || !gameId) return { error: "Team ID and game ID are required." };

  try {
    const user = await requireUser();
    const score = await prisma.score.findFirst({ where: { teamId, gameId, round, event: { userId: user.id } } });
    if (!score) return { error: "Score not found or you do not have access." };

    await prisma.score.deleteMany({
      where: { teamId, gameId, round }
    });

    revalidatePath("/");
    revalidatePath("/dashboard");
    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to delete score." };
  }
}