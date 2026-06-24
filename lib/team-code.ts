import { prisma } from "@/lib/prisma";

/** Friendly palette assigned to teams for the live display + join pages. */
export const TEAM_COLORS = [
  "#38BDF8", // sky
  "#FB7185", // coral
  "#22C55E", // green
  "#E1A800", // gold
  "#A855F7", // purple
  "#F97316", // orange
  "#14B8A6", // teal
  "#EC4899", // pink
];

// Ambiguous characters (0/O, 1/I) removed so codes are easy to read aloud / type.
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 6;

export function makeJoinCode(): string {
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i += 1) {
    code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return code;
}

/** Normalizes user-entered codes (URL/query) to the canonical stored form. */
export function normalizeJoinCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, CODE_LENGTH);
}

/** Generates a join code guaranteed unique against the teams table. */
export async function generateUniqueJoinCode(): Promise<string> {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const code = makeJoinCode();
    const existing = await prisma.team.findUnique({ where: { joinCode: code } });
    if (!existing) return code;
  }
  // Extremely unlikely fallback: append entropy.
  return `${makeJoinCode()}${Date.now().toString(36).toUpperCase().slice(-2)}`.slice(0, CODE_LENGTH + 2);
}

/** Picks a color for a new team, cycling the palette by current team count. */
export function pickTeamColor(index: number): string {
  return TEAM_COLORS[index % TEAM_COLORS.length];
}
