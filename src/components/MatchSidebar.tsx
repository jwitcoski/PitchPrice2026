import { useApp } from '../context/AppContext';
import { TicketPriceBar } from './TicketPriceBar';

export function MatchSidebar() {
  const { activeStadium, activeFixtures, activeTicket, persona, selectedTeam } =
    useApp();

  if (!activeStadium) {
    return (
      <aside className="sidebar">
        <div className="sidebar-empty">
          <h2>Match &amp; prices</h2>
          <p>Click a stadium on the map to see fixtures and ticket ranges.</p>
          {persona === 'team' && selectedTeam && (
            <p className="hint">
              {selectedTeam.name} plays at {selectedTeam.stadiumIds.length} host
              {selectedTeam.stadiumIds.length === 1 ? '' : 's'} — click a marker.
            </p>
          )}
        </div>
      </aside>
    );
  }

  const heroFixture = activeFixtures[0];

  return (
    <aside className="sidebar">
      <header className="sidebar-header">
        <h2>{activeStadium.name}</h2>
        <p>
          {activeStadium.city}, {activeStadium.country}
        </p>
      </header>

      {heroFixture && (
        <div
          className="matchup-hero"
          style={
            persona !== 'team'
              ? {
                  background: `linear-gradient(145deg, ${activeStadium.theme.primary}, ${activeStadium.theme.land})`,
                  borderColor: `${activeStadium.theme.accent}55`,
                }
              : undefined
          }
        >
          <p
            className="matchup-date"
            style={
              persona !== 'team'
                ? { color: activeStadium.theme.accent }
                : undefined
            }
          >
            {heroFixture.date}
          </p>
          <p className="matchup-teams">{heroFixture.matchup}</p>
          <p className="matchup-stage">{heroFixture.stage}</p>
        </div>
      )}

      <section className="fixtures-section">
        <h3>Fixtures</h3>
        <ul>
          {activeFixtures.map((f, i) => (
            <li key={`${f.date}-${i}`}>
              <strong>{f.date}</strong> — {f.matchup}
              <span className="fixture-stage">{f.stage}</span>
            </li>
          ))}
        </ul>
      </section>

      {activeTicket && <TicketPriceBar ticket={activeTicket} />}
    </aside>
  );
}
