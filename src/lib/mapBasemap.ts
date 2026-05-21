import { MapStyle, styleToStyle, type Map } from '@maptiler/sdk';
import type { Persona } from '../types';
import { applyPersonaTheme } from './themes';

export const BASEMAP_STREETS = styleToStyle(MapStyle.STREETS);
/** Satellite imagery with place labels — best for stadium-level 3D. */
export const BASEMAP_AERIAL = styleToStyle(MapStyle.HYBRID);

let activeBasemap: string | null = null;

export function waitForStyleReady(map: Map): Promise<void> {
  return new Promise((resolve) => {
    const finish = () => resolve();
    if (map.isStyleLoaded()) {
      map.once('idle', finish);
      return;
    }
    map.once('style.load', () => map.once('idle', finish));
  });
}

export async function setMapBasemap(map: Map, style: string): Promise<void> {
  const next = style;
  if (activeBasemap === next && map.isStyleLoaded()) return;

  map.setStyle(style);
  activeBasemap = next;
  await waitForStyleReady(map);
}

export async function enableAerialBasemap(map: Map): Promise<void> {
  await setMapBasemap(map, BASEMAP_AERIAL);
}

export async function restoreStreetsBasemap(
  map: Map,
  persona: Persona,
  team?: import('../types').Team | null,
): Promise<void> {
  await setMapBasemap(map, BASEMAP_STREETS);
  applyPersonaTheme(map, persona, team ?? undefined);
}

/** Style swap removes custom layers; call after HYBRID/STREETS change. */
export function markBasemapLayersCleared() {
  activeBasemap = null;
}
