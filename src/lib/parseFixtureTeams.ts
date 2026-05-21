import type { Team } from '../types';

const LABEL_ALIASES: Record<string, string> = {
  'united states': 'usa',
  'u.s.': 'usa',
  'bosnia & herzegovina': 'bosnia',
  'bosnia and herzegovina': 'bosnia',
  'ir iran': 'iran',
  'korea republic': 'korea-republic',
  "côte d'ivoire": 'ivory-coast',
  'cote divoire': 'ivory-coast',
  'congo dr': 'congo-dr',
  'curacao': 'curacao',
  'türkiye': 'turkey',
  'turkiye': 'turkey',
};

const NON_TEAM_LABELS =
  /^(round of|quarterfinal|semifinal|final|play-off|playoff)/i;

export function isResolvableTeamLabel(label: string): boolean {
  const t = label.trim();
  if (!t || NON_TEAM_LABELS.test(t)) return false;
  return true;
}

export function resolveTeamIdFromLabel(label: string, teams: Team[]): string | null {
  const raw = label.trim();
  if (!isResolvableTeamLabel(raw)) return null;

  const norm = raw.toLowerCase();
  if (LABEL_ALIASES[norm]) return LABEL_ALIASES[norm];

  const byExact = teams.find((t) => t.name.toLowerCase() === norm);
  if (byExact) return byExact.id;

  const byPartial = teams.find(
    (t) =>
      norm.includes(t.name.toLowerCase()) || t.name.toLowerCase().includes(norm),
  );
  return byPartial?.id ?? null;
}

/** Parse "Team A vs. Team B" into two team ids when possible. */
export function parseFixtureTeamIds(matchup: string, teams: Team[]): string[] {
  if (NON_TEAM_LABELS.test(matchup.trim())) return [];

  const parts = matchup.split(/\s+vs\.?\s+/i);
  if (parts.length < 2) return [];

  const ids: string[] = [];
  for (const part of parts) {
    const id = resolveTeamIdFromLabel(part, teams);
    if (id && !ids.includes(id)) ids.push(id);
  }
  return ids;
}

/** Team to roast from a fixture click (prefer anyone but Bosnia). */
export function pickBanterOpponentFromFixture(
  matchup: string,
  teams: Team[],
): string | null {
  const ids = parseFixtureTeamIds(matchup, teams);
  if (ids.length === 0) return null;
  const nonBih = ids.filter((id) => id !== 'bosnia');
  return nonBih[0] ?? ids[0];
}

export function isKnockoutOnlyMatchup(matchup: string, teams: Team[]): boolean {
  return parseFixtureTeamIds(matchup, teams).length === 0;
}
