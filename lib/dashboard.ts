import { prisma } from "@/lib/prisma";

export type DashboardEvent = Awaited<ReturnType<typeof loadDashboard>>["event"];

function getTimeSortValue(value: string) {
  const normalized = value.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!normalized) return Number.MAX_SAFE_INTEGER;

  const hours = Number.parseInt(normalized[1], 10);
  const minutes = Number.parseInt(normalized[2], 10);

  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return Number.MAX_SAFE_INTEGER;
  return hours * 60 + minutes;
}

export async function loadDashboard() {
  const event = await prisma.familyDayEvent.findFirst({
    orderBy: [{ year: "desc" }, { createdAt: "desc" }],
    include: {
      teams: {
        orderBy: { name: "asc" },
        include: { members: { orderBy: { name: "asc" } } }
      },
      games: {
        orderBy: [{ order: "asc" }, { name: "asc" }],
        include: { scores: true }
      },
      timetable: {
        orderBy: [{ createdAt: "asc" }]
      }
    }
  });

  if (!event) {
    return {
      event: null,
      leaderboard: [],
      games: [],
      teams: [],
      timetable: [],
      scoreCells: [],
      totals: { teams: 0, games: 0, scores: 0 }
    };
  }

  const teams = event.teams;
  const games = event.games;
  const timetable = [...event.timetable].sort((a, b) => {
    const leftDate = a.scheduleDate ? new Date(a.scheduleDate).getTime() : Number.MAX_SAFE_INTEGER;
    const rightDate = b.scheduleDate ? new Date(b.scheduleDate).getTime() : Number.MAX_SAFE_INTEGER;

    return (
      leftDate - rightDate ||
      getTimeSortValue(a.time) - getTimeSortValue(b.time) ||
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime() ||
      a.title.localeCompare(b.title)
    );
  });
  const scoreMap = new Map<string, number>();

  for (const game of games) {
    for (const score of game.scores) {
      scoreMap.set(`${score.teamId}:${score.gameId}`, score.points);
    }
  }

  const leaderboard = teams
    .map((team) => {
      const perGame = games.map((game) => ({
        gameId: game.id,
        gameName: game.name,
        placement: scoreMap.get(`${team.id}:${game.id}`) ?? null
      }));
      const completedGames = perGame.filter((cell) => cell.placement !== null).length;

      return {
        id: team.id,
        name: team.name,
        members: team.members.map((member) => member.name),
        perGame,
        completedGames,
        totalPlacement: perGame.reduce((sum, cell) => sum + (cell.placement ?? 0), 0)
      };
    })
    .sort(
      (a, b) =>
        b.completedGames - a.completedGames ||
        a.totalPlacement - b.totalPlacement ||
        a.name.localeCompare(b.name)
    );

  return {
    event,
    leaderboard,
    games,
    teams,
    timetable,
    scoreCells: leaderboard.flatMap((team) => team.perGame),
    totals: {
      teams: teams.length,
      games: games.length,
      scores: games.reduce((count, game) => count + game.scores.length, 0)
    }
  };
}
