import { Layer3D, AltitudeReference, SourceOrientation } from '@maptiler/3d';
import { LngLat, type Map } from '@maptiler/sdk';
import {
  enableAerialBasemap,
  markBasemapLayersCleared,
  restoreStreetsBasemap,
} from './mapBasemap';
import type { Persona, Stadium, Team } from '../types';
import { applyStadium3dEnvironment } from './themes';

const LAYER_ID = 'pitchprice-stadium-3d';
const MESH_ID = 'stadium-venue-marker';
const LIGHT_ID = 'stadium-key-light';

/** Khronos sample mesh (no upload required) — marks the venue in 3D mode. */
const VENUE_MARKER_GLB =
  'https://cdn.jsdelivr.net/gh/KhronosGroup/glTF-Sample-Assets@main/Models/Duck/glTF-Binary/Duck.glb';

let stadiumLayer: Layer3D | null = null;

function waitForMapReady(map: Map): Promise<void> {
  if (map.loaded()) return Promise.resolve();
  return new Promise((resolve) => map.once('load', () => resolve()));
}

async function ensureStadiumLayer(map: Map): Promise<Layer3D> {
  if (!map.getLayer(LAYER_ID)) {
    stadiumLayer = null;
  }
  if (stadiumLayer && map.getLayer(LAYER_ID)) return stadiumLayer;

  await waitForMapReady(map);

  const layer = new Layer3D(LAYER_ID);
  map.addLayer(layer);
  layer.setAmbientLight({ intensity: 2 });
  layer.addPointLight(LIGHT_ID, {
    lngLat: [0, 0],
    intensity: 50,
    altitude: 120,
    altitudeReference: AltitudeReference.MEAN_SEA_LEVEL,
  });

  stadiumLayer = layer;
  return layer;
}

async function upsertVenueMarker(
  layer: Layer3D,
  stadium: Stadium,
  accent: string,
) {
  const lngLat: [number, number] = [stadium.lng, stadium.lat];
  const existing = layer.getItem3D(MESH_ID);

  if (existing) {
    existing.setLngLat(new LngLat(stadium.lng, stadium.lat));
    existing.modify({ visible: true, scale: 38, altitude: 12 });
    return;
  }

  await layer.addMeshFromURL(MESH_ID, VENUE_MARKER_GLB, {
    lngLat,
    altitude: 12,
    altitudeReference: AltitudeReference.GROUND,
    scale: 38,
    sourceOrientation: SourceOrientation.Y_UP,
    heading: 25,
    opacity: 0.92,
    userData: { accent, stadiumId: stadium.id },
  });
}

function hideVenueMarker(layer: Layer3D) {
  const item = layer.getItem3D(MESH_ID);
  if (item) item.modify({ visible: false });
}

export async function applyStadium3dView(
  map: Map,
  stadium: Stadium,
  enabled: boolean,
  persona: Persona,
  team: Team | null | undefined,
  accentColor: string,
) {
  if (enabled) {
    markBasemapLayersCleared();
    stadiumLayer = null;
    await enableAerialBasemap(map);
    applyStadium3dEnvironment(map, stadium.theme.buildings3d ?? true);
    const layer = await ensureStadiumLayer(map);
    layer.modifyPointLight(LIGHT_ID, { lngLat: [stadium.lng, stadium.lat] });
    await upsertVenueMarker(layer, stadium, accentColor);
    return;
  }

  if (stadiumLayer) hideVenueMarker(stadiumLayer);
  markBasemapLayersCleared();
  stadiumLayer = null;
  await restoreStreetsBasemap(map, persona, team ?? undefined);
}

export async function flyToStadium3d(map: Map, stadium: Stadium) {
  await map.flyTo({
    center: [stadium.lng, stadium.lat],
    zoom: 17,
    pitch: 64,
    bearing: -32,
    duration: 1800,
    essential: true,
  });
}

export function disposeStadium3dLayer(map: Map) {
  if (stadiumLayer && map.getLayer(LAYER_ID)) {
    try {
      map.removeLayer(LAYER_ID);
    } catch {
      /* already removed */
    }
  }
  stadiumLayer = null;
}
