import { useApp } from '../context/AppContext';

export function MapBackButton() {
  const { onboardingComplete, resetOnboarding, persona, selectedTeam } = useApp();

  if (!onboardingComplete) return null;

  const modeLabel =
    persona === 'team' && selectedTeam
      ? selectedTeam.name
      : persona === 'city'
        ? 'Host stadium'
        : persona === 'tournament'
          ? 'Fan tour'
          : 'Explore';

  return (
    <button
      type="button"
      className="map-back-btn"
      onClick={resetOnboarding}
      aria-label="Back to welcome screen and change mode"
    >
      <span className="map-back-icon" aria-hidden>
        ←
      </span>
      <span className="map-back-text">
        <span className="map-back-label">Change mode</span>
        <span className="map-back-mode">{modeLabel}</span>
      </span>
    </button>
  );
}
