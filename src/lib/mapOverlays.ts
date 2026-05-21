import type { Map } from '@maptiler/sdk';
import type { Persona, Stadium, Team } from '../types';
import { getTeamRouteColors } from './arcColors';
import {
  clearTeamRouteLayers,
  resetStadiumLayerBindings,
  setTeamArc,
  upsertStadiumLayers,
} from './mapLayers';

export interface MapOverlayOptions {
  stadiums: Stadium[];
  highlightIds?: string[];
  accentColor?: string;
  primaryColor?: string;
  showStadiumNameLabels?: boolean;
  team?: Team | null;
  persona?: Persona | null;
}

/** Re-apply PitchPrice layers after a basemap style swap. */
export async function refreshMapOverlays(map: Map, options: MapOverlayOptions) {
  resetStadiumLayerBindings(map);

  await upsertStadiumLayers(map, options.stadiums, {
    highlightIds: options.highlightIds,
    accentColor: options.accentColor,
    primaryColor: options.primaryColor,
    showStadiumNameLabels: options.showStadiumNameLabels,
  });

  if (options.persona === 'team' && options.team) {
    setTeamArc(map, options.team, options.stadiums, getTeamRouteColors(options.team));
  } else {
    clearTeamRouteLayers(map);
  }
}
