import type { Map } from '@maptiler/sdk';
import type { Stadium } from '../types';
import {
  clearTeamRouteLayers,
  removeStadiumLayers,
  upsertStadiumLayers,
} from './mapLayers';
import { applyPersonaTheme } from './themes';

const DEFAULT_CENTER: [number, number] = [-98, 42];

/** Baseline view before a new persona intro runs */
export async function resetMapView(map: Map, stadiums: Stadium[]) {
  map.stop();

  clearTeamRouteLayers(map);
  removeStadiumLayers(map);

  applyPersonaTheme(map, 'tournament');
  map.setPitch(0);
  map.setBearing(0);

  await map.flyTo({
    center: DEFAULT_CENTER,
    zoom: 3,
    pitch: 0,
    bearing: 0,
    duration: 1000,
    essential: true,
  });

  await upsertStadiumLayers(map, stadiums, { accentColor: '#69f0ae' });
}
