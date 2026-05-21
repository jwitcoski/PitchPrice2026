import { useEffect, useRef } from 'react';
import { Map, MapStyle, config } from '@maptiler/sdk';
import '@maptiler/sdk/dist/maptiler-sdk.css';
import { useApp } from '../context/AppContext';
import { runPersonaIntro, flyToStadium } from '../lib/mapChoreography';
import {
  applyStadium3dView,
  disposeStadium3dLayer,
  flyToStadium3d,
} from '../lib/mapStadium3d';
import { resetMapView } from '../lib/mapReset';
import { getStadiumLayerId } from '../lib/mapLayers';
import { DEMO_TIMINGS } from '../lib/demoScript';
import { refreshMapOverlays } from '../lib/mapOverlays';
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
    stadium3dEnabled,
    setStadium3dEnabled,
    setDemoRevealTicket,
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
      void refreshMapOverlays(map, {
        stadiums,
        accentColor: '#69f0ae',
        primaryColor: '#a7f3d0',
      });
    });

    map.on('click', getStadiumLayerId(), (e) => {
      const f = e.features?.[0];
      const id = f?.properties?.id as string | undefined;
      if (id) setActiveStadiumId(id);
    });

    return () => {
      disposeStadium3dLayer(map);
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

    const accent =
      persona === 'team' && selectedTeam
        ? selectedTeam.colors.accent
        : stadium.theme.accent;
    const primary =
      persona === 'team' && selectedTeam
        ? selectedTeam.colors.primary
        : stadium.theme.primary;

    const highlight =
      persona === 'team' ? selectedTeam?.stadiumIds : [activeStadiumId];

    const run = async () => {
      if (!map.loaded()) {
        await new Promise<void>((resolve) => map.once('load', () => resolve()));
      }

      if (stadium3dEnabled) {
        await applyStadium3dView(
          map,
          stadium,
          true,
          persona,
          selectedTeam,
          accent,
        );
        await flyToStadium3d(map, stadium);
      } else {
        await applyStadium3dView(
          map,
          stadium,
          false,
          persona,
          selectedTeam,
          accent,
        );
        if (persona === 'city' || persona === 'tournament') {
          applyStadiumMapTheme(map, stadium);
        }
        await flyToStadium(map, stadium, persona);
      }

      await refreshMapOverlays(map, {
        stadiums,
        highlightIds: highlight,
        accentColor: accent,
        primaryColor: primary,
        showStadiumNameLabels: stadium3dEnabled,
        team: selectedTeam,
        persona,
      });
    };

    void run();
  }, [
    activeStadiumId,
    persona,
    stadiums,
    selectedTeam,
    cityStadiumId,
    onboardingComplete,
    stadium3dEnabled,
  ]);

  useEffect(() => {
    if (!demoMode || dataLoading || !onboardingComplete) return;

    const timers = [
      setTimeout(() => setActiveStadiumId('sofi-stadium'), DEMO_TIMINGS.selectStadiumMs),
      setTimeout(() => setStadium3dEnabled(true), DEMO_TIMINGS.enable3dMs),
      setTimeout(() => setDemoRevealTicket(true), DEMO_TIMINGS.showTicketEasterEggMs),
    ];

    return () => timers.forEach(clearTimeout);
  }, [
    demoMode,
    dataLoading,
    onboardingComplete,
    setActiveStadiumId,
    setStadium3dEnabled,
    setDemoRevealTicket,
  ]);

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
