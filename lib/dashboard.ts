import { prisma } from "@/lib/prisma";

export type DashboardEvent = Awaited<ReturnType<typeof loadDashboard>>["event"];

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
        orderBy: [{ order: "asc" }, { time: "asc" }]
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
    timetable: event.timetable,
    scoreCells: leaderboard.flatMap((team) => team.perGame),
    totals: {
      teams: teams.length,
      games: games.length,
      scores: games.reduce((count, game) => count + game.scores.length, 0)
    }
  };
}
