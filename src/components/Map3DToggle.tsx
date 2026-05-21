import { useApp } from '../context/AppContext';

export function Map3DToggle() {
  const {
    onboardingComplete,
    activeStadiumId,
    stadium3dEnabled,
    setStadium3dEnabled,
  } = useApp();

  if (!onboardingComplete || !activeStadiumId) return null;

  return (
    <button
      type="button"
      className={`map-3d-toggle ${stadium3dEnabled ? 'map-3d-toggle--on' : ''}`}
      aria-pressed={stadium3dEnabled}
      onClick={() => setStadium3dEnabled(!stadium3dEnabled)}
    >
      <span className="map-3d-toggle-icon" aria-hidden>
        3D
      </span>
      <span className="map-3d-toggle-text">
        {stadium3dEnabled ? 'MapTiler 3D on' : 'MapTiler 3D'}
      </span>
      <span className="map-3d-toggle-hint">
        {stadium3dEnabled ? 'Satellite · labels · 3D' : 'Stadium view'}
      </span>
    </button>
  );
}
