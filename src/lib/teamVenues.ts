import type { FixturesByStadium, Stadium, Team } from '../types';

const US_STADIUM_IDS = [
  'lumen-field',
  'levis-stadium',
  'sofi-stadium',
  'att-stadium',
  'nrg-stadium',
  'arrowhead-stadium',
  'mercedes-benz-stadium',
  'gillette-stadium',
  'metlife-stadium',
  'lincoln-financial-field',
  'hard-rock-stadium',
];

const MEXICO_STADIUM_IDS = ['estadio-azteca', 'estadio-akron', 'estadio-bbva'];
const CANADA_STADIUM_IDS = ['bmo-field', 'bc-place'];

/** Match team names in fixture strings (longest phrases first) */
const MATCH_ALIASES: Record<string, string[]> = {
  usa: ['United States', 'USA'],
  canada: ['Canada'],
  mexico: ['Mexico'],
  japan: ['Japan'],
  'new-zealand': ['New Zealand'],
  iran: ['IR Iran', 'Iran'],
  argentina: ['Argentina'],
  uzbekistan: ['Uzbekistan'],
  'korea-republic': ['Korea Republic', 'South Korea'],
  jordan: ['Jordan'],
  australia: ['Australia'],
  ecuador: ['Ecuador'],
  brazil: ['Brazil'],
  uruguay: ['Uruguay'],
  paraguay: ['Paraguay'],
  colombia: ['Colombia'],
  morocco: ['Morocco'],
  tunisia: ['Tunisia'],
  egypt: ['Egypt'],
  algeria: ['Algeria'],
  ghana: ['Ghana'],
  iraq: ['Iraq'],
  qatar: ['Qatar'],
  'saudi-arabia': ['Saudi Arabia'],
  curacao: ['Curaçao', 'Curacao'],
  haiti: ['Haiti'],
  panama: ['Panama'],
  bosnia: ['Bosnia & Herzegovina', 'Bosnia and Herzegovina'],
  croatia: ['Croatia'],
  england: ['England'],
  france: ['France'],
  germany: ['Germany'],
  netherlands: ['Netherlands'],
  portugal: ['Portugal'],
  spain: ['Spain'],
  belgium: ['Belgium'],
  switzerland: ['Switzerland'],
  austria: ['Austria'],
  norway: ['Norway'],
  scotland: ['Scotland'],
  sweden: ['Sweden'],
  czechia: ['Czechia', 'Czech Republic'],
  turkey: ['Türkiye', 'Turkey'],
  'congo-dr': ['Congo DR', 'DR Congo'],
  'cabo-verde': ['Cabo Verde', 'Cape Verde'],
  'ivory-coast': ["Côte d'Ivoire", 'Ivory Coast'],
  senegal: ['Senegal'],
  'south-africa': ['South Africa'],
};

function fixtureMentionsTeam(matchup: string, phrases: string[]): boolean {
  const m = matchup.toLowerCase();
  return phrases.some((p) => m.includes(p.toLowerCase()));
}

export function deriveStadiumIdsForTeam(
  team: Team,
  fixtures: FixturesByStadium,
  allStadiums: Stadium[],
): string[] {
  if (team.id === 'usa') return US_STADIUM_IDS;
  if (team.id === 'mexico') return MEXICO_STADIUM_IDS;
  if (team.id === 'canada') return CANADA_STADIUM_IDS;

  const aliases = MATCH_ALIASES[team.id] ?? [team.name];
  const found = new Set<string>();

  for (const [stadiumId, games] of Object.entries(fixtures)) {
    for (const g of games) {
      if (fixtureMentionsTeam(g.matchup, aliases)) {
        found.add(stadiumId);
      }
    }
  }

  if (found.size > 0) {
    return [...found].sort();
  }

  // Teams not yet in published schedules (e.g. Iraq) — nearest host region
  const conf = team.confederation;
  if (conf === 'CONCACAF') {
    return [...MEXICO_STADIUM_IDS, ...US_STADIUM_IDS.slice(0, 3)];
  }
  if (conf === 'CONMEBOL') {
    return ['metlife-stadium', 'hard-rock-stadium', 'estadio-akron'];
  }
  if (conf === 'AFC' || conf === 'OFC') {
    return ['sofi-stadium', 'lumen-field', 'bc-place'];
  }
  if (conf === 'CAF') {
    return ['mercedes-benz-stadium', 'metlife-stadium', 'gillette-stadium'];
  }
  return allStadiums.slice(0, 4).map((s) => s.id);
}

export function enrichTeamsWithVenues(
  teams: Team[],
  fixtures: FixturesByStadium,
  stadiums: Stadium[],
): Team[] {
  return teams.map((t) => ({
    ...t,
    stadiumIds: deriveStadiumIdsForTeam(t, fixtures, stadiums),
  }));
}
