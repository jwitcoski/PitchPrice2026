import { AppProvider, useApp } from './context/AppContext';
import { MapBackButton } from './components/MapBackButton';
import { MapCanvas } from './components/MapCanvas';
import { MatchSidebar } from './components/MatchSidebar';
import { OnboardingModal } from './components/OnboardingModal';
import './styles/layout.css';

function AppShell() {
  const { onboardingComplete, dataLoading } = useApp();

  if (dataLoading) {
    return (
      <div className="loading-screen">
        <p>Loading tournament data…</p>
      </div>
    );
  }

  return (
    <div className="app-root">
      {!onboardingComplete && <OnboardingModal />}
      <main className={`main-layout ${onboardingComplete ? 'visible' : ''}`}>
        <div className="map-panel">
          <MapBackButton />
          <MapCanvas />
        </div>
        <MatchSidebar />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
