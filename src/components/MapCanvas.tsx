import { useEffect, useRef } from 'react';
import { Map, MapStyle, config } from '@maptiler/sdk';
import '@maptiler/sdk/dist/maptiler-sdk.css';
import { useApp } from '../context/AppContext';
import { runPersonaIntro, flyToStadium } from '../lib/mapChoreography';
import { resetMapView } from '../lib/mapReset';
import { getStadiumLayerId, upsertStadiumLayers } from '../lib/mapLayers';
import { applyStadiumMapTheme } from '../lib/themes';

config.apiKey = import.meta.env.VITE_MAPTILER_API_KEY ?? '';

export function MapCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const lastIntroSelection = useRef(-1);
  const hasLeftWelcome = useRef(false);

  const {
    persona,
    onboardingComplete,
    stadiums,
    selectedTeam,
    cityStadiumId,
    activeStadiumId,
    setActiveStadiumId,
    demoMode,
    dataLoading,
    introGeneration,
    selectionId,
  } = useApp();

  useEffect(() => {
    if (!containerRef.current || mapRef.current || dataLoading) return;

    const map = new Map({
      container: containerRef.current,
      style: MapStyle.STREETS,
      center: [-98, 42],
      zoom: 3,
      pitch: 0,
      bearing: 0,
    });

    mapRef.current = map;

    map.on('load', () => {
      void upsertStadiumLayers(map, stadiums, { accentColor: '#69f0ae' });
    });

    map.on('click', getStadiumLayerId(), (e) => {
      const f = e.features?.[0];
      const id = f?.properties?.id as string | undefined;
      if (id) setActiveStadiumId(id);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [dataLoading, stadiums, setActiveStadiumId]);

  useEffect(() => {
    if (onboardingComplete) hasLeftWelcome.current = true;
  }, [onboardingComplete]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !hasLeftWelcome.current || onboardingComplete) return;

    const run = async () => {
      if (!map.loaded()) {
        await new Promise<void>((resolve) => map.once('load', () => resolve()));
      }
      lastIntroSelection.current = -1;
      await resetMapView(map, stadiums);
    };
    void run();
  }, [onboardingComplete, introGeneration, stadiums]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !onboardingComplete || !persona) return;
    if (lastIntroSelection.current === selectionId) return;

    const run = async () => {
      if (!map.loaded()) {
        await new Promise<void>((resolve) => map.once('load', () => resolve()));
      }
      await runPersonaIntro(
        map,
        persona,
        stadiums,
        selectedTeam,
        cityStadiumId ?? 'sofi-stadium',
      );
      lastIntroSelection.current = selectionId;
    };
    void run();
  }, [
    onboardingComplete,
    persona,
    stadiums,
    selectedTeam,
    cityStadiumId,
    selectionId,
  ]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !activeStadiumId || !persona || !onboardingComplete) return;
    const stadium = stadiums.find((s) => s.id === activeStadiumId);
    if (!stadium) return;

    if (persona === 'city' || persona === 'tournament') {
      applyStadiumMapTheme(map, stadium);
    }

    const highlight =
      persona === 'team'
        ? selectedTeam?.stadiumIds
        : [activeStadiumId];

    void upsertStadiumLayers(map, stadiums, {
      highlightIds: highlight,
      accentColor:
        persona === 'team' && selectedTeam
          ? selectedTeam.colors.accent
          : stadium.theme.accent,
      primaryColor:
        persona === 'team' && selectedTeam
          ? selectedTeam.colors.primary
          : stadium.theme.primary,
    });

    void flyToStadium(map, stadium, persona);
  }, [
    activeStadiumId,
    persona,
    stadiums,
    selectedTeam,
    cityStadiumId,
    onboardingComplete,
  ]);

  useEffect(() => {
    if (!demoMode || dataLoading || !onboardingComplete) return;

    const timers: ReturnType<typeof setTimeout>[] = [];

    timers.push(
      setTimeout(() => {
        setActiveStadiumId('sofi-stadium');
      }, 9000),
    );

    return () => timers.forEach(clearTimeout);
  }, [demoMode, dataLoading, onboardingComplete, setActiveStadiumId]);

  if (!import.meta.env.VITE_MAPTILER_API_KEY) {
    return (
      <div className="map-error">
        <p>
          Missing <code>VITE_MAPTILER_API_KEY</code> in <code>.env</code>
        </p>
      </div>
    );
  }

  return <div ref={containerRef} className="map-canvas" />;
}
