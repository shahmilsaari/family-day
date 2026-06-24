import { getCurrentUser } from "@/lib/auth";
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

export async function loadDashboard(eventId?: number) {
  const user = await getCurrentUser();

  // Authenticated users see only their own events.
  // Unauthenticated visitors can view a specific event by ID (for the public display page).
  // Without a user or eventId, return an empty state (public landing page).
  const where = user
    ? eventId
      ? { id: eventId, userId: user.id }
      : { userId: user.id }
    : eventId
      ? { id: eventId }
      : null;

  if (!where) {
    return {
      event: null,
      leaderboard: [],
      games: [],
      teams: [],
      timetable: [],
      scoreCells: [],
      totals: { teams: 0, games: 0, scores: 0, rounds: 0 }
    };
  }

  const event = await prisma.familyDayEvent.findFirst({
    where,
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
      totals: { teams: 0, games: 0, scores: 0, rounds: 0 }
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
  const scoringGames = games.filter((game) => game.includeInScore);
  const gamePlacementMap = new Map<string, number>();
  const gameWinMap = new Map<number, number>();
  const gameSecondMap = new Map<number, number>();
  const gameThirdMap = new Map<number, number>();

  for (const game of scoringGames) {
    const teamStats = teams
      .map((team) => {
        const scores = game.scores.filter((score) => score.teamId === team.id);
        return {
          teamId: team.id,
          name: team.name,
          completedRounds: scores.length,
          totalRoundPoints: scores.reduce((sum, score) => sum + score.points, 0),
          roundWins: scores.filter((score) => score.points === 1).length,
          secondPlaces: scores.filter((score) => score.points === 2).length,
          thirdPlaces: scores.filter((score) => score.points === 3).length
        };
      })
      .filter((stat) => stat.completedRounds > 0)
      .sort(
        (a, b) =>
          b.roundWins - a.roundWins ||
          a.totalRoundPoints - b.totalRoundPoints ||
          b.secondPlaces - a.secondPlaces ||
          b.thirdPlaces - a.thirdPlaces ||
          b.completedRounds - a.completedRounds ||
          a.name.localeCompare(b.name)
      );

    teamStats.forEach((stat, index) => {
      const gamePlacement = index + 1;
      gamePlacementMap.set(`${stat.teamId}:${game.id}`, gamePlacement);
      if (gamePlacement === 1) gameWinMap.set(stat.teamId, (gameWinMap.get(stat.teamId) ?? 0) + 1);
      if (gamePlacement === 2) gameSecondMap.set(stat.teamId, (gameSecondMap.get(stat.teamId) ?? 0) + 1);
      if (gamePlacement === 3) gameThirdMap.set(stat.teamId, (gameThirdMap.get(stat.teamId) ?? 0) + 1);
    });
  }

  // Highest score wins: a team placing Pth among `teamCount` teams in a game
  // earns (teamCount - P + 1) points, so 1st place earns the most.
  const teamCount = teams.length;
  const pointsForPlacement = (placement: number | null) =>
    placement === null ? 0 : Math.max(0, teamCount - placement + 1);

  const leaderboard = teams
    .map((team) => {
      const perGame = scoringGames.map((game) => {
        const placement = gamePlacementMap.get(`${team.id}:${game.id}`) ?? null;
        return {
          gameId: game.id,
          gameName: game.name,
          placement,
          points: placement === null ? null : pointsForPlacement(placement)
        };
      });
      const completedGames = perGame.filter((cell) => cell.placement !== null).length;
      const roundWins = gameWinMap.get(team.id) ?? 0;
      const secondPlaces = gameSecondMap.get(team.id) ?? 0;
      const thirdPlaces = gameThirdMap.get(team.id) ?? 0;

      return {
        id: team.id,
        name: team.name,
        color: team.color ?? null,
        members: team.members.map((member) => member.name),
        perGame,
        completedGames,
        roundWins,
        secondPlaces,
        thirdPlaces,
        totalScore: perGame.reduce((sum, cell) => sum + (cell.points ?? 0), 0),
        totalPlacement: perGame.reduce((sum, cell) => sum + (cell.placement ?? 0), 0)
      };
    })
    .sort(
      (a, b) =>
        b.totalScore - a.totalScore ||
        b.roundWins - a.roundWins ||
        b.secondPlaces - a.secondPlaces ||
        b.thirdPlaces - a.thirdPlaces ||
        b.completedGames - a.completedGames ||
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
      scores: scoringGames.reduce((count, game) => count + game.scores.length, 0),
      rounds: scoringGames.reduce((count, game) => count + (Number.isFinite(game.rounds) && game.rounds > 0 ? game.rounds : 1), 0)
    }
  };
}
