import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { MapTilerLogo } from './MapTilerLogo';
import { SoccerBallIcon } from './SoccerBallIcon';
import type { Persona } from '../types';
import '../styles/onboarding.css';

export function OnboardingModal() {
  const { stadiums, teams, dataLoading, completeOnboarding, demoMode, introGeneration } =
    useApp();
  const [step, setStep] = useState<'pick' | Persona>('pick');
  const [persona, setPersona] = useState<Persona | null>(null);
  const [teamId, setTeamId] = useState('bosnia');
  const [cityId, setCityId] = useState('sofi-stadium');

  useEffect(() => {
    setStep('pick');
    setPersona(null);
  }, [introGeneration]);

  useEffect(() => {
    if (!demoMode || dataLoading) return;
    const t1 = setTimeout(() => {
      setPersona('team');
      setStep('team');
      setTeamId('bosnia');
    }, 400);
    const t2 = setTimeout(() => completeOnboarding('team', 'bosnia'), 2800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [demoMode, dataLoading, completeOnboarding]);

  const cityOptions = [...stadiums].sort((a, b) =>
    a.country === b.country
      ? a.city.localeCompare(b.city)
      : a.country.localeCompare(b.country),
  );

  const confederationOrder = [
    'CONCACAF',
    'UEFA',
    'CONMEBOL',
    'CAF',
    'AFC',
    'OFC',
  ] as const;

  const teamsByConfederation = confederationOrder.map((conf) => ({
    conf,
    teams: teams
      .filter((t) => t.confederation === conf)
      .sort((a, b) => a.name.localeCompare(b.name)),
  }));

  const selectedTeam = useMemo(
    () => teams.find((t) => t.id === teamId),
    [teams, teamId],
  );

  const selectedStadium = useMemo(
    () => stadiums.find((s) => s.id === cityId),
    [stadiums, cityId],
  );

  const finish = () => {
    if (!persona) return;
    if (persona === 'team') completeOnboarding('team', teamId);
    else if (persona === 'city') completeOnboarding('city', undefined, cityId);
    else completeOnboarding('tournament');
  };

  const goBack = () => {
    setStep('pick');
    setPersona(null);
  };

  return (
    <div className="onboarding-screen">
      <div className="onboarding-pitch-bg" aria-hidden />

      <div className="onboarding-inner">
        <header className="onboarding-hero">
          <div className="onboarding-logo">
            <SoccerBallIcon size={56} className="onboarding-logo-ball" />
          </div>
          <a
            className="onboarding-badge"
            href="https://www.maptiler.com/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="MapTiler — maps for developers"
          >
            <span className="onboarding-badge-dot" />
            <span className="onboarding-badge-text">World Cup 2026</span>
            <span className="onboarding-badge-divider" aria-hidden />
            <MapTilerLogo height={16} className="onboarding-badge-logo" />
          </a>
          <h1>PitchPrice</h1>
          <p className="onboarding-tagline">
            Stadiums, matches & ticket vibes across USA, Mexico & Canada.
          </p>
          <div className="onboarding-stats">
            <span className="onboarding-stat">
              <strong>48</strong> nations
            </span>
            <span className="onboarding-stat">
              <strong>16</strong> host stadiums
            </span>
            <span className="onboarding-stat">
              <strong>104</strong> matches
            </span>
          </div>
        </header>

        <div className="onboarding-panel">
          {step === 'pick' && (
            <>
              <h2 className="onboarding-panel-title">Choose your matchday mode</h2>
              <p className="onboarding-panel-sub">
                Pick how you want the map to look and feel.
              </p>
              <div className="persona-grid">
                <button
                  type="button"
                  className="persona-card persona-card--team"
                  onClick={() => {
                    setPersona('team');
                    setStep('team');
                  }}
                >
                  <span className="persona-icon" aria-hidden>
                    🏳️
                  </span>
                  <span className="persona-text">
                    <span className="persona-title">Backing a country</span>
                    <span className="persona-desc">
                      Team colors, flight arcs to your venues
                    </span>
                  </span>
                  <span className="persona-arrow" aria-hidden>
                    →
                  </span>
                </button>

                <button
                  type="button"
                  className="persona-card persona-card--city"
                  onClick={() => {
                    setPersona('city');
                    setStep('city');
                  }}
                >
                  <span className="persona-icon" aria-hidden>
                    🏟️
                  </span>
                  <span className="persona-text">
                    <span className="persona-title">Exploring a host stadium</span>
                    <span className="persona-desc">
                      Each host city tints the whole map — LA sunset, Miami teal, etc.
                    </span>
                  </span>
                  <span className="persona-arrow" aria-hidden>
                    →
                  </span>
                </button>

                <button
                  type="button"
                  className="persona-card persona-card--fan"
                  onClick={() => completeOnboarding('tournament')}
                >
                  <span className="persona-icon" aria-hidden>
                    ⚽
                  </span>
                  <span className="persona-text">
                    <span className="persona-title">Casual fan tour</span>
                    <span className="persona-desc">
                      Overview first — click any stadium to load its city theme
                    </span>
                  </span>
                  <span className="persona-arrow" aria-hidden>
                    →
                  </span>
                </button>
              </div>
            </>
          )}

          {step === 'team' && (
            <div className="onboarding-detail">
              <button type="button" className="onboarding-back" onClick={goBack}>
                ← Back
              </button>
              <h2 className="onboarding-panel-title">Select your nation</h2>
              <p className="onboarding-panel-sub">
                We&apos;ll theme the map and draw routes to their stadiums.
              </p>

              {selectedTeam && (
                <div className="team-color-preview">
                  <span
                    className="team-color-swatch"
                    style={{ background: selectedTeam.colors.primary }}
                  />
                  <span
                    className="team-color-swatch team-color-swatch--accent"
                    style={{ background: selectedTeam.colors.accent }}
                  />
                  <span className="team-color-label">
                    Routing for <strong>{selectedTeam.name}</strong>
                  </span>
                </div>
              )}

              <div className="onboarding-field">
                <label htmlFor="team-select">Nation</label>
                <div className="onboarding-select-wrap">
                  <select
                    id="team-select"
                    className="onboarding-select team-select"
                    value={teamId}
                    onChange={(e) => setTeamId(e.target.value)}
                  >
                    {teamsByConfederation.map(
                      ({ conf, teams: group }) =>
                        group.length > 0 && (
                          <optgroup key={conf} label={conf}>
                            {group.map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.name}
                              </option>
                            ))}
                          </optgroup>
                        ),
                    )}
                  </select>
                  <span className="onboarding-select-chevron">▼</span>
                </div>
              </div>

              <button type="button" className="onboarding-cta" onClick={finish}>
                Kick off →
              </button>
            </div>
          )}

          {step === 'city' && (
            <div className="onboarding-detail">
              <button type="button" className="onboarding-back" onClick={goBack}>
                ← Back
              </button>
              <h2 className="onboarding-panel-title">Pick a host stadium</h2>
            <p className="onboarding-panel-sub">
              {selectedStadium
                ? `Fly into ${selectedStadium.name} — the map takes on ${selectedStadium.city}'s colors.`
                : 'Choose one of 16 official World Cup venues.'}
            </p>

            {selectedStadium && (
              <div className="team-color-preview">
                <span
                  className="team-color-swatch"
                  style={{ background: selectedStadium.theme.primary }}
                />
                <span
                  className="team-color-swatch team-color-swatch--accent"
                  style={{ background: selectedStadium.theme.accent }}
                />
                <span className="team-color-label">
                  <strong>{selectedStadium.city}</strong> map theme
                </span>
              </div>
            )}

              <div className="onboarding-field">
                <label htmlFor="city-select">Stadium</label>
                <div className="onboarding-select-wrap">
                  <select
                    id="city-select"
                    className="onboarding-select"
                    value={cityId}
                    onChange={(e) => setCityId(e.target.value)}
                  >
                    {cityOptions.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} — {s.city}, {s.country}
                      </option>
                    ))}
                  </select>
                  <span className="onboarding-select-chevron">▼</span>
                </div>
              </div>

              <button type="button" className="onboarding-cta" onClick={finish}>
                Fly to stadium →
              </button>
            </div>
          )}

          <p className="onboarding-footer">
            Fan project for MapTiler World Cup Map Competition · No official FIFA branding
          </p>
        </div>
      </div>
    </div>
  );
}
