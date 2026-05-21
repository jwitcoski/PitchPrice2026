import type { Map } from '@maptiler/sdk';
import type { CityMapTheme, Persona, Stadium, Team } from '../types';

const LAYER_CANDIDATES = {
  water: ['water', 'Water', 'waterway'],
  background: ['background', 'Background'],
  land: ['landuse', 'landcover', 'Landcover', 'land'],
};

function trySetPaint(map: Map, layerIds: string[], prop: string, value: unknown) {
  for (const id of layerIds) {
    if (map.getLayer(id)) {
      try {
        map.setPaintProperty(id, prop, value);
      } catch {
        /* layer may not support property */
      }
    }
  }
}

function findLayer(map: Map, candidates: string[]): string | null {
  const style = map.getStyle();
  if (!style?.layers) return null;
  for (const c of candidates) {
    if (style.layers.some((l) => l.id === c)) return c;
  }
  return null;
}

export interface ThemePreset {
  water?: string;
  background?: string;
  land?: string;
  fog?: boolean;
  terrain3d: boolean;
  buildings3d: boolean;
}

export const PERSONA_PRESETS: Record<Persona, ThemePreset> = {
  team: {
    water: '#002395',
    background: '#0a1628',
    land: '#1a2744',
    terrain3d: false,
    buildings3d: false,
  },
  city: {
    water: '#0d1b2a',
    background: '#050508',
    land: '#1b263b',
    fog: true,
    terrain3d: true,
    buildings3d: true,
  },
  tournament: {
    water: '#1b4332',
    background: '#081c15',
    land: '#2d6a4f',
    terrain3d: false,
    buildings3d: false,
  },
};

function applyThemePreset(map: Map, preset: ThemePreset) {
  const waterLayer = findLayer(map, LAYER_CANDIDATES.water);
  const bgLayer = findLayer(map, LAYER_CANDIDATES.background);
  const landLayer = findLayer(map, LAYER_CANDIDATES.land);

  if (preset.water && waterLayer) {
    trySetPaint(map, [waterLayer], 'fill-color', preset.water);
  }
  if (preset.background && bgLayer) {
    trySetPaint(map, [bgLayer], 'background-color', preset.background);
  }
  if (preset.land && landLayer) {
    trySetPaint(map, [landLayer], 'fill-color', preset.land);
  }

  set3DMode(map, preset.terrain3d, preset.buildings3d);
}

/** Full basemap tint for a host city (like team mode, but per stadium/city) */
export function applyCityMapTheme(map: Map, theme: CityMapTheme) {
  applyThemePreset(map, {
    water: theme.water,
    background: theme.background,
    land: theme.land,
    terrain3d: theme.buildings3d ?? true,
    buildings3d: theme.buildings3d ?? true,
  });
}

export function applyStadiumMapTheme(map: Map, stadium: Stadium) {
  applyCityMapTheme(map, stadium.theme);
}

export function applyPersonaTheme(map: Map, persona: Persona, team?: Team | null) {
  const preset = { ...PERSONA_PRESETS[persona] };

  if (persona === 'team' && team) {
    preset.water = '#0f2847';
    preset.background = '#070d18';
    preset.land = '#1c2f4a';
    preset.terrain3d = false;
    preset.buildings3d = false;
  }

  applyThemePreset(map, preset);
}

export function set3DMode(map: Map, terrain: boolean, buildings: boolean) {
  try {
    if (terrain) {
      if (!map.getTerrain()) {
        map.enableTerrain();
      }
    } else if (map.getTerrain()) {
      map.disableTerrain();
    }
  } catch {
    /* terrain not available */
  }

  const buildingLayer = map.getStyle()?.layers?.find((l) =>
    l.id.toLowerCase().includes('building'),
  )?.id;

  if (buildingLayer) {
    try {
      map.setLayoutProperty(buildingLayer, 'visibility', buildings ? 'visible' : 'none');
    } catch {
      /* ignore */
    }
  }
}
