import type { Map } from '@maptiler/sdk';
import type { Persona, Stadium, Team } from '../types';
import { applyPersonaTheme, applyStadiumMapTheme } from './themes';
import { getTeamRouteColors } from './arcColors';
import { clearTeamRouteLayers, setTeamArc, upsertStadiumLayers } from './mapLayers';

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function runPersonaIntro(
  map: Map,
  persona: Persona,
  stadiums: Stadium[],
  team: Team | null,
  cityStadiumId: string,
) {
  map.stop();
  clearTeamRouteLayers(map);
  applyPersonaTheme(map, persona, team ?? undefined);

  if (persona === 'team' && team) {
    const highlighted = team.stadiumIds;
    const accent = team.colors.accent;
    await upsertStadiumLayers(map, stadiums, {
      highlightIds: highlighted,
      accentColor: accent,
      primaryColor: team.colors.primary,
    });
    setTeamArc(map, team, stadiums, getTeamRouteColors(team));

    await map.flyTo({
      center: team.origin,
      zoom: 4,
      duration: 2200,
      essential: true,
    });
    await wait(800);

    await map.flyTo({
      center: [-60, 25],
      zoom: 2.2,
      duration: 2800,
      essential: true,
    });
    await wait(600);

    const primary =
      stadiums.find((s) => s.id === 'sofi-stadium' && highlighted.includes(s.id)) ??
      stadiums.find((s) => highlighted.includes(s.id));
    if (primary) {
      await map.flyTo({
        center: [primary.lng, primary.lat],
        zoom: highlighted.length > 4 ? 4.5 : 10,
        pitch: highlighted.length > 4 ? 0 : 35,
        duration: 3200,
        essential: true,
      });
    }
    return;
  }

  if (persona === 'city') {
    const target = stadiums.find((s) => s.id === cityStadiumId) ?? stadiums[0];
    applyStadiumMapTheme(map, target);
    await upsertStadiumLayers(map, stadiums, {
      highlightIds: [target.id],
      accentColor: target.theme.accent,
      primaryColor: target.theme.primary,
    });

    await map.flyTo({
      center: [-100, 40],
      zoom: 3.5,
      duration: 1500,
      essential: true,
    });

    await map.flyTo({
      center: [target.lng, target.lat],
      zoom: 16,
      pitch: 58,
      bearing: -20,
      duration: 4000,
      essential: true,
    });
    return;
  }

  // tournament — neutral overview; city themes apply when you click a stadium
  applyPersonaTheme(map, 'tournament');
  await upsertStadiumLayers(map, stadiums, {
    highlightIds: [],
    accentColor: '#69f0ae',
    primaryColor: '#a7f3d0',
  });
  await map.flyTo({
    center: [-98, 42],
    zoom: 3.8,
    pitch: 0,
    bearing: 0,
    duration: 2800,
    essential: true,
  });
}

export async function flyToStadium(map: Map, stadium: Stadium, persona: Persona) {
  const isCity = persona === 'city';
  await map.flyTo({
    center: [stadium.lng, stadium.lat],
    zoom: isCity ? 16.5 : 14,
    pitch: isCity ? 58 : 52,
    bearing: -25,
    duration: 1800,
    essential: true,
  });
}
