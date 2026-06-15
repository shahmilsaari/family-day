"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

function parseDate(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value.trim()) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
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

export async function saveEvent(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const year = parseInteger(formData.get("year"));
  const startDate = parseDate(formData.get("startDate"));
  const endDate = parseDate(formData.get("endDate"));
  const location = String(formData.get("location") ?? "").trim() || null;
  const eventId = parseInteger(formData.get("eventId"), 0);

  if (!title || !year) return;

  if (eventId) {
    await prisma.familyDayEvent.update({
      where: { id: eventId },
      data: { title, year, startDate, endDate, location }
    });
  } else {
    await prisma.familyDayEvent.create({
      data: { title, year, startDate, endDate, location }
    });
  }

  revalidatePath("/");
  revalidatePath("/dashboard");
}

export async function createTeam(formData: FormData) {
  const eventId = parseInteger(formData.get("eventId"));
  const name = String(formData.get("name") ?? "").trim();
  const members = parseMembers(formData.get("members"));

  if (!eventId || !name) return;

  const team = await prisma.team.create({
    data: {
      eventId,
      name,
      members: {
        create: members.map((member) => ({ name: member }))
      }
    }
  });

  if (!team) return;

  revalidatePath("/");
  revalidatePath("/dashboard");
}

export async function updateTeam(formData: FormData) {
  const teamId = parseInteger(formData.get("teamId"));
  const name = String(formData.get("name") ?? "").trim();
  const members = parseMembers(formData.get("members"));

  if (!teamId || !name) return;

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
}

export async function deleteTeam(formData: FormData) {
  const teamId = parseInteger(formData.get("teamId"));

  if (!teamId) return;

  await prisma.team.delete({
    where: { id: teamId }
  });

  revalidatePath("/");
  revalidatePath("/dashboard");
}

export async function createGame(formData: FormData) {
  const eventId = parseInteger(formData.get("eventId"));
  const name = String(formData.get("name") ?? "").trim();
  const order = parseInteger(formData.get("order"), 0);

  if (!eventId || !name) return;

  await prisma.game.create({
    data: { eventId, name, order }
  });

  revalidatePath("/");
  revalidatePath("/dashboard");
}

export async function updateGame(formData: FormData) {
  const gameId = parseInteger(formData.get("gameId"));
  const name = String(formData.get("name") ?? "").trim();
  const order = parseInteger(formData.get("order"), 0);

  if (!gameId || !name) return;

  await prisma.game.update({
    where: { id: gameId },
    data: { name, order }
  });

  revalidatePath("/");
  revalidatePath("/dashboard");
}

export async function deleteGame(formData: FormData) {
  const gameId = parseInteger(formData.get("gameId"));

  if (!gameId) return;

  await prisma.game.delete({
    where: { id: gameId }
  });

  revalidatePath("/");
  revalidatePath("/dashboard");
}

export async function updateGameOrder(orderedGameIds: number[]) {
  if (!orderedGameIds || orderedGameIds.length === 0) return;

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
}

export async function createTentativeSchedule(formData: FormData) {
  const eventId = parseInteger(formData.get("eventId"));
  const time = String(formData.get("time") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const order = parseInteger(formData.get("order"), 0);

  if (!eventId || !time || !title) return;

  await prisma.tentativeSchedule.create({
    data: {
      eventId,
      time,
      title,
      location: location || null,
      notes: notes || null,
      order
    }
  });

  revalidatePath("/");
  revalidatePath("/dashboard");
}

export async function updateTentativeSchedule(formData: FormData) {
  const scheduleId = parseInteger(formData.get("scheduleId"));
  const time = String(formData.get("time") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const order = parseInteger(formData.get("order"), 0);

  if (!scheduleId || !time || !title) return;

  await prisma.tentativeSchedule.update({
    where: { id: scheduleId },
    data: {
      time,
      title,
      location: location || null,
      notes: notes || null,
      order
    }
  });

  revalidatePath("/");
  revalidatePath("/dashboard");
}

export async function deleteTentativeSchedule(formData: FormData) {
  const scheduleId = parseInteger(formData.get("scheduleId"));

  if (!scheduleId) return;

  await prisma.tentativeSchedule.delete({
    where: { id: scheduleId }
  });

  revalidatePath("/");
  revalidatePath("/dashboard");
}

export async function saveScore(formData: FormData) {
  const eventId = parseInteger(formData.get("eventId"));
  const teamId = parseInteger(formData.get("teamId"));
  const gameId = parseInteger(formData.get("gameId"));
  const placement = parseInteger(formData.get("placement"));

  if (!eventId || !teamId || !gameId || placement < 1) return;

  await prisma.score.upsert({
    where: { teamId_gameId: { teamId, gameId } },
    update: { eventId, points: placement },
    create: { eventId, teamId, gameId, points: placement }
  });

  revalidatePath("/");
  revalidatePath("/dashboard");
}

export async function saveGamePlacements(formData: FormData) {
  const eventId = parseInteger(formData.get("eventId"));
  const gameId = parseInteger(formData.get("gameId"));
  const orderedTeamIds = String(formData.get("orderedTeamIds") ?? "")
    .split(",")
    .map((value) => Number.parseInt(value, 10))
    .filter((value) => Number.isFinite(value) && value > 0);

  if (!eventId || !gameId || orderedTeamIds.length === 0) return;

  await prisma.$transaction([
    prisma.score.deleteMany({ where: { gameId } }),
    prisma.score.createMany({
      data: orderedTeamIds.map((teamId, index) => ({
        eventId,
        gameId,
        teamId,
        points: index + 1
      }))
    })
  ]);

  revalidatePath("/");
  revalidatePath("/dashboard");
}

export async function clearGamePlacements(formData: FormData) {
  const gameId = parseInteger(formData.get("gameId"));

  if (!gameId) return;

  await prisma.score.deleteMany({
    where: { gameId }
  });

  revalidatePath("/");
  revalidatePath("/dashboard");
}

export async function deleteScore(formData: FormData) {
  const teamId = parseInteger(formData.get("teamId"));
  const gameId = parseInteger(formData.get("gameId"));

  if (!teamId || !gameId) return;

  await prisma.score.deleteMany({
    where: { teamId, gameId }
  });

  revalidatePath("/");
  revalidatePath("/dashboard");
}
