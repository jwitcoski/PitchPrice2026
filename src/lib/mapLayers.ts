import type { Map } from '@maptiler/sdk';

type GeoJSONSource = { setData: (data: unknown) => void };
import type { Stadium, Team } from '../types';
import { buildArcCoordinates } from './arcGeometry';
import {
  ICON_DEFAULT,
  ICON_HIGHLIGHT,
  ensureStadiumSoccerIcons,
} from './stadiumMarkerIcon';

const STADIUM_SOURCE = 'stadiums-source';
const STADIUM_GLOW = 'stadiums-glow';
const STADIUM_PITCH = 'stadiums-pitch';
const STADIUM_LAYER = 'stadiums-symbol';
const ARC_SOURCE = 'team-arc-source';
const ARC_CASING_LAYER = 'team-arc-casing';
const ARC_LAYER = 'team-arc-layer';
const ORIGIN_SOURCE = 'team-origin-source';
const ORIGIN_LAYER = 'team-origin-layer';

export interface TeamRouteColors {
  line: string;
  casing: string;
  casingWidth: number;
  lineWidth: number;
  originFill: string;
  originStroke: string;
  originStrokeWidth: number;
}

function applyArcPaint(map: Map, colors: TeamRouteColors) {
  if (map.getLayer(ARC_CASING_LAYER)) {
    map.setPaintProperty(ARC_CASING_LAYER, 'line-color', colors.casing);
    map.setPaintProperty(ARC_CASING_LAYER, 'line-width', colors.casingWidth);
  }
  if (map.getLayer(ARC_LAYER)) {
    map.setPaintProperty(ARC_LAYER, 'line-color', colors.line);
    map.setPaintProperty(ARC_LAYER, 'line-width', colors.lineWidth);
  }
  if (map.getLayer(ORIGIN_LAYER)) {
    map.setPaintProperty(ORIGIN_LAYER, 'circle-color', colors.originFill);
    map.setPaintProperty(ORIGIN_LAYER, 'circle-stroke-color', colors.originStroke);
    map.setPaintProperty(ORIGIN_LAYER, 'circle-stroke-width', colors.originStrokeWidth);
  }
}

export interface StadiumLayerOptions {
  highlightIds?: string[];
  accentColor?: string;
  primaryColor?: string;
}

export function stadiumsToGeoJSON(
  stadiums: Stadium[],
  options?: StadiumLayerOptions,
) {
  const highlightIds = options?.highlightIds ?? [];
  const accent = options?.accentColor ?? '#69f0ae';
  const primary = options?.primaryColor ?? accent;

  return {
    type: 'FeatureCollection' as const,
    features: stadiums.map((s) => {
      const highlighted = highlightIds.includes(s.id);
      return {
        type: 'Feature' as const,
        properties: {
          id: s.id,
          name: s.name,
          city: s.city,
          highlighted,
          markerFill: highlighted ? accent : '#2a4035',
          markerStroke: highlighted ? primary : '#5c6b5e',
        },
        geometry: {
          type: 'Point' as const,
          coordinates: [s.lng, s.lat],
        },
      };
    }),
  };
}

function bindStadiumInteractions(map: Map) {
  if ((map as Map & { _stadiumBound?: boolean })._stadiumBound) return;
  (map as Map & { _stadiumBound?: boolean })._stadiumBound = true;

  const setCursor = (on: boolean) => {
    map.getCanvas().style.cursor = on ? 'pointer' : '';
  };

  for (const layer of [STADIUM_LAYER, STADIUM_PITCH, STADIUM_GLOW]) {
    map.on('mouseenter', layer, () => setCursor(true));
    map.on('mouseleave', layer, () => setCursor(false));
  }
}

function applyStadiumPitchPaint(map: Map) {
  map.setPaintProperty(STADIUM_PITCH, 'circle-radius', [
    'case',
    ['get', 'highlighted'],
    18,
    0,
  ]);
  map.setPaintProperty(STADIUM_PITCH, 'circle-color', ['get', 'markerFill']);
  map.setPaintProperty(STADIUM_PITCH, 'circle-opacity', [
    'case',
    ['get', 'highlighted'],
    0.55,
    0,
  ]);
  map.setPaintProperty(STADIUM_PITCH, 'circle-stroke-width', [
    'case',
    ['get', 'highlighted'],
    3,
    0,
  ]);
  map.setPaintProperty(STADIUM_PITCH, 'circle-stroke-color', ['get', 'markerStroke']);
  map.setPaintProperty(STADIUM_PITCH, 'circle-blur', 0.15);
}

export async function upsertStadiumLayers(
  map: Map,
  stadiums: Stadium[],
  options?: StadiumLayerOptions,
) {
  const geojson = stadiumsToGeoJSON(stadiums, options);
  const accent = options?.accentColor ?? '#69f0ae';

  await ensureStadiumSoccerIcons(map, accent);

  if (map.getSource(STADIUM_SOURCE)) {
    (map.getSource(STADIUM_SOURCE) as unknown as GeoJSONSource).setData(geojson);
    if (map.getLayer(STADIUM_GLOW)) {
      map.setPaintProperty(STADIUM_GLOW, 'circle-color', accent);
    }
    if (map.getLayer(STADIUM_PITCH)) applyStadiumPitchPaint(map);
    return;
  }

  map.addSource(STADIUM_SOURCE, { type: 'geojson', data: geojson });

  map.addLayer({
    id: STADIUM_GLOW,
    type: 'circle',
    source: STADIUM_SOURCE,
    paint: {
      'circle-radius': ['case', ['get', 'highlighted'], 32, 0],
      'circle-color': accent,
      'circle-opacity': ['case', ['get', 'highlighted'], 0.45, 0],
      'circle-blur': 0.75,
    },
  });

  map.addLayer({
    id: STADIUM_PITCH,
    type: 'circle',
    source: STADIUM_SOURCE,
    paint: {
      'circle-radius': ['case', ['get', 'highlighted'], 18, 0],
      'circle-color': ['get', 'markerFill'],
      'circle-opacity': ['case', ['get', 'highlighted'], 0.55, 0],
      'circle-stroke-width': ['case', ['get', 'highlighted'], 3, 0],
      'circle-stroke-color': ['get', 'markerStroke'],
      'circle-blur': 0.15,
    },
  });

  map.addLayer({
    id: STADIUM_LAYER,
    type: 'symbol',
    source: STADIUM_SOURCE,
    layout: {
      'icon-image': [
        'case',
        ['get', 'highlighted'],
        ICON_HIGHLIGHT,
        ICON_DEFAULT,
      ],
      'icon-size': 1,
      'icon-allow-overlap': true,
      'icon-ignore-placement': true,
    },
  });

  bindStadiumInteractions(map);
}

export function setTeamArc(
  map: Map,
  team: Team,
  stadiums: Stadium[],
  colors: TeamRouteColors,
) {
  const targets = stadiums.filter((s) => team.stadiumIds.includes(s.id));
  if (targets.length === 0) return;

  const arcTargets = targets.slice(0, 4);
  const features = arcTargets.map((end, index) => ({
    type: 'Feature' as const,
    geometry: {
      type: 'LineString' as const,
      coordinates: buildArcCoordinates(team.origin, [end.lng, end.lat]),
    },
    properties: { index },
  }));

  const collection = {
    type: 'FeatureCollection' as const,
    features,
  };

  if (map.getSource(ARC_SOURCE)) {
    (map.getSource(ARC_SOURCE) as unknown as GeoJSONSource).setData(collection);
    applyArcPaint(map, colors);
  } else {
    map.addSource(ARC_SOURCE, { type: 'geojson', data: collection });
    map.addLayer({
      id: ARC_CASING_LAYER,
      type: 'line',
      source: ARC_SOURCE,
      paint: {
        'line-color': colors.casing,
        'line-width': colors.casingWidth,
        'line-opacity': 0.95,
      },
      layout: { 'line-cap': 'round', 'line-join': 'round' },
    });
    map.addLayer({
      id: ARC_LAYER,
      type: 'line',
      source: ARC_SOURCE,
      paint: {
        'line-color': colors.line,
        'line-width': colors.lineWidth,
        'line-opacity': 1,
      },
      layout: { 'line-cap': 'round', 'line-join': 'round' },
    });
  }

  const originFeature = {
    type: 'Feature' as const,
    geometry: { type: 'Point' as const, coordinates: team.origin },
    properties: { label: team.originLabel },
  };

  if (map.getSource(ORIGIN_SOURCE)) {
    (map.getSource(ORIGIN_SOURCE) as unknown as GeoJSONSource).setData(originFeature);
    applyArcPaint(map, colors);
  } else {
    map.addSource(ORIGIN_SOURCE, { type: 'geojson', data: originFeature });
    map.addLayer({
      id: ORIGIN_LAYER,
      type: 'circle',
      source: ORIGIN_SOURCE,
      paint: {
        'circle-radius': 12,
        'circle-color': colors.originFill,
        'circle-stroke-width': colors.originStrokeWidth,
        'circle-stroke-color': colors.originStroke,
        'circle-opacity': 1,
      },
    });
  }
}

export function clearTeamRouteLayers(map: Map) {
  for (const id of [ARC_LAYER, ARC_CASING_LAYER, ORIGIN_LAYER]) {
    if (map.getLayer(id)) map.removeLayer(id);
  }
  for (const id of [ARC_SOURCE, ORIGIN_SOURCE]) {
    if (map.getSource(id)) map.removeSource(id);
  }
}

export function removeStadiumLayers(map: Map) {
  for (const id of [STADIUM_LAYER, STADIUM_PITCH, STADIUM_GLOW]) {
    if (map.getLayer(id)) map.removeLayer(id);
  }
  if (map.getSource(STADIUM_SOURCE)) map.removeSource(STADIUM_SOURCE);
}

export function clearTeamLayers(map: Map) {
  clearTeamRouteLayers(map);
  removeStadiumLayers(map);
}

export function getStadiumLayerId() {
  return STADIUM_LAYER;
}
