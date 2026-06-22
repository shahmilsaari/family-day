import { randomBytes, pbkdf2Sync } from "node:crypto";
import { prisma } from "../lib/prisma.ts";

/**
 * Mirrors the hashing logic in lib/auth.ts but without importing
 * `"server-only"` or Next.js headers so the seed script can run
 * as a plain Node.js process.
 */
function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = pbkdf2Sync(password, salt, 120000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: {
      name: "Demo Organizer",
      email: "demo@example.com",
      passwordHash: hashPassword("demo1234")
    }
  });

  const event = await prisma.familyDayEvent.upsert({
    where: { userId_year: { userId: user.id, year: 2026 } },
    update: {
      title: "Family Day 2026",
      startDate: new Date("2026-08-08")
    },
    create: {
      userId: user.id,
      title: "Family Day 2026",
      year: 2026,
      startDate: new Date("2026-08-08")
    }
  });

  const teams = await Promise.all([
    prisma.team.upsert({
      where: { eventId_name: { eventId: event.id, name: "Red Hawks" } },
      update: {},
      create: { eventId: event.id, name: "Red Hawks" }
    }),
    prisma.team.upsert({
      where: { eventId_name: { eventId: event.id, name: "Blue Waves" } },
      update: {},
      create: { eventId: event.id, name: "Blue Waves" }
    })
  ]);

  await prisma.teamMember.deleteMany({ where: { teamId: { in: teams.map((team) => team.id) } } });
  await prisma.teamMember.createMany({
    data: [
      { teamId: teams[0].id, name: "Aina" },
      { teamId: teams[0].id, name: "Hakim" },
      { teamId: teams[1].id, name: "Mei Ling" },
      { teamId: teams[1].id, name: "Daniel" }
    ]
  });

  const games = await Promise.all([
    prisma.game.upsert({
      where: { eventId_name: { eventId: event.id, name: "Sack Race" } },
      update: { description: "Classic race while hopping in a sack.", order: 1, rounds: 1 },
      create: { eventId: event.id, name: "Sack Race", description: "Classic race while hopping in a sack.", includeInScore: true, order: 1, rounds: 1 }
    }),
    prisma.game.upsert({
      where: { eventId_name: { eventId: event.id, name: "Ball Toss" } },
      update: { description: "Toss balls into targets to rank teams.", order: 2, rounds: 1 },
      create: { eventId: event.id, name: "Ball Toss", description: "Toss balls into targets to rank teams.", includeInScore: true, order: 2, rounds: 1 }
    })
  ]);

  await prisma.score.upsert({
    where: { teamId_gameId_round: { teamId: teams[0].id, gameId: games[0].id, round: 1 } },
    update: { points: 1, eventId: event.id },
    create: {
      eventId: event.id,
      teamId: teams[0].id,
      gameId: games[0].id,
      round: 1,
      points: 1
    }
  });

  await prisma.score.upsert({
    where: { teamId_gameId_round: { teamId: teams[1].id, gameId: games[0].id, round: 1 } },
    update: { points: 2, eventId: event.id },
    create: {
      eventId: event.id,
      teamId: teams[1].id,
      gameId: games[0].id,
      round: 1,
      points: 2
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
