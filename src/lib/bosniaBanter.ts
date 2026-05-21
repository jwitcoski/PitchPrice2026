import { publicUrl } from './publicUrl';
import type { Persona, Team } from '../types';

export interface BosniaBanterData {
  panelKicker?: string;
  self: string;
  vsTeam: Record<string, string>;
  cityCulture: Record<string, string>;
  genericVs: string;
  genericCity: string;
  knockoutFixture: string;
}

let cache: BosniaBanterData | null = null;

export async function loadBosniaBanter(): Promise<BosniaBanterData> {
  if (cache) return cache;
  const res = await fetch(publicUrl('data/bosniaBanter.json'));
  cache = (await res.json()) as BosniaBanterData;
  return cache;
}

export function getVsTeamBanter(
  data: BosniaBanterData,
  teamId: string,
  teamName: string,
): string {
  return (
    data.vsTeam[teamId] ??
    data.genericVs.replaceAll('{team}', teamName)
  );
}

export function getCityBanter(
  data: BosniaBanterData,
  stadiumId: string,
  cityLabel: string,
): string {
  return (
    data.cityCulture[stadiumId] ??
    data.genericCity.replaceAll('{city}', cityLabel)
  );
}

export interface BanterContext {
  persona: Persona;
  stadiumId: string | null;
  cityLabel: string;
  selectedTeam: Team | null;
  banterOpponentId: string | null;
  teams: Team[];
  data: BosniaBanterData;
}

export function resolveBanterMessage(ctx: BanterContext): {
  title: string;
  body: string;
  hint?: string;
} | null {
  const { persona, stadiumId, selectedTeam, banterOpponentId, teams, data } = ctx;

  if (persona === 'city' || persona === 'tournament') {
    if (banterOpponentId) {
      const opponent = teams.find((t) => t.id === banterOpponentId);
      const name = opponent?.name ?? 'that team';
      return {
        title: `Bosnia > ${name}`,
        body: getVsTeamBanter(data, banterOpponentId, name),
        hint: 'From the fixture you clicked.',
      };
    }
    if (!stadiumId) return null;
    return {
      title: 'Bosnia in this host city',
      body: getCityBanter(data, stadiumId, ctx.cityLabel),
      hint: 'Tap a match below to compare Bosnia vs. that opponent.',
    };
  }

  if (persona === 'team') {
    const opponentId =
      banterOpponentId ??
      (selectedTeam?.id !== 'bosnia' ? selectedTeam?.id : null);

    if (!opponentId) {
      if (!stadiumId) {
        if (selectedTeam?.id === 'bosnia') {
          return { title: 'Correct choice', body: data.self };
        }
        if (selectedTeam) {
          return {
            title: `Bosnia > ${selectedTeam.name}`,
            body: getVsTeamBanter(data, selectedTeam.id, selectedTeam.name),
            hint: 'Click a stadium marker to see fixtures—and click a match to switch opponents.',
          };
        }
        return null;
      }
      return {
        title: 'Why Bosnia anyway?',
        body: data.self,
        hint: 'Click a fixture to roast the opponent.',
      };
    }

    if (opponentId === 'bosnia') {
      return {
        title: 'Correct choice',
        body: data.self,
      };
    }

    const opponent = teams.find((t) => t.id === opponentId);
    const name = opponent?.name ?? 'that team';
    return {
      title: `Bosnia > ${name}`,
      body: getVsTeamBanter(data, opponentId, name),
      hint: banterOpponentId
        ? 'From the fixture you clicked.'
        : `You picked ${name} — here's the truth.`,
    };
  }

  return null;
}
