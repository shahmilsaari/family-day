import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const event = await prisma.familyDayEvent.upsert({
    where: { year: 2026 },
    update: {
      title: "Family Day 2026",
      tentativeDate: new Date("2026-08-08")
    },
    create: {
      title: "Family Day 2026",
      year: 2026,
      tentativeDate: new Date("2026-08-08")
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

  await prisma.teamMember.createMany({
    data: [
      { teamId: teams[0].id, name: "Aina" },
      { teamId: teams[0].id, name: "Hakim" },
      { teamId: teams[1].id, name: "Mei Ling" },
      { teamId: teams[1].id, name: "Daniel" }
    ],
    skipDuplicates: true
  });

  const games = await Promise.all([
    prisma.game.upsert({
      where: { eventId_name: { eventId: event.id, name: "Sack Race" } },
      update: { order: 1 },
      create: { eventId: event.id, name: "Sack Race", order: 1 }
    }),
    prisma.game.upsert({
      where: { eventId_name: { eventId: event.id, name: "Ball Toss" } },
      update: { order: 2 },
      create: { eventId: event.id, name: "Ball Toss", order: 2 }
    })
  ]);

  await prisma.score.upsert({
    where: { teamId_gameId: { teamId: teams[0].id, gameId: games[0].id } },
    update: { points: 10, eventId: event.id },
    create: {
      eventId: event.id,
      teamId: teams[0].id,
      gameId: games[0].id,
      points: 10
    }
  });

  await prisma.score.upsert({
    where: { teamId_gameId: { teamId: teams[1].id, gameId: games[0].id } },
    update: { points: 8, eventId: event.id },
    create: {
      eventId: event.id,
      teamId: teams[1].id,
      gameId: games[0].id,
      points: 8
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

