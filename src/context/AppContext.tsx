import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { publicUrl } from '../lib/publicUrl';
import { enrichTeamsWithVenues } from '../lib/teamVenues';
import {
  isKnockoutOnlyMatchup,
  pickBanterOpponentFromFixture,
} from '../lib/parseFixtureTeams';
import type {
  FixturesByStadium,
  Persona,
  Stadium,
  Team,
  TicketRange,
  TicketsByStadium,
} from '../types';

interface AppContextValue {
  persona: Persona | null;
  teamId: string | null;
  cityStadiumId: string | null;
  onboardingComplete: boolean;
  activeStadiumId: string | null;
  stadiums: Stadium[];
  teams: Team[];
  fixtures: FixturesByStadium;
  tickets: TicketsByStadium;
  dataLoading: boolean;
  completeOnboarding: (persona: Persona, teamId?: string, cityStadiumId?: string) => void;
  resetOnboarding: () => void;
  introGeneration: number;
  selectionId: number;
  setActiveStadiumId: (id: string | null) => void;
  selectedTeam: Team | null;
  activeStadium: Stadium | null;
  activeTicket: TicketRange | null;
  activeFixtures: import('../types').Fixture[];
  demoMode: boolean;
  stadium3dEnabled: boolean;
  setStadium3dEnabled: (enabled: boolean) => void;
  demoRevealTicket: boolean;
  setDemoRevealTicket: (reveal: boolean) => void;
  banterOpponentId: string | null;
  banterKnockoutMode: boolean;
  banterFixtureMatchup: string | null;
  setBanterFromFixture: (matchup: string) => void;
  clearBanter: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [persona, setPersona] = useState<Persona | null>(null);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [cityStadiumId, setCityStadiumId] = useState<string | null>('sofi-stadium');
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [activeStadiumId, setActiveStadiumId] = useState<string | null>(null);
  const [stadiums, setStadiums] = useState<Stadium[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [fixtures, setFixtures] = useState<FixturesByStadium>({});
  const [tickets, setTickets] = useState<TicketsByStadium>({});
  const [dataLoading, setDataLoading] = useState(true);
  const [introGeneration, setIntroGeneration] = useState(0);
  const [selectionId, setSelectionId] = useState(0);
  const [stadium3dEnabled, setStadium3dEnabled] = useState(false);
  const [demoRevealTicket, setDemoRevealTicket] = useState(false);
  const [banterOpponentId, setBanterOpponentId] = useState<string | null>(null);
  const [banterKnockoutMode, setBanterKnockoutMode] = useState(false);
  const [banterFixtureMatchup, setBanterFixtureMatchup] = useState<string | null>(
    null,
  );

  const demoMode =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('demo') === '1';

  useEffect(() => {
    Promise.all([
      fetch(publicUrl('data/stadiums.json')).then((r) => r.json()),
      fetch(publicUrl('data/teams.json')).then((r) => r.json()),
      fetch(publicUrl('data/fixtures.json')).then((r) => r.json()),
      fetch(publicUrl('data/ticketData.json')).then((r) => r.json()),
    ])
      .then(([s, t, f, tk]) => {
        setStadiums(s);
        setTeams(enrichTeamsWithVenues(t, f, s));
        setFixtures(f);
        setTickets(tk);
      })
      .finally(() => setDataLoading(false));
  }, []);

  const completeOnboarding = useCallback(
    (p: Persona, tid?: string, sid?: string) => {
      setPersona(p);
      setTeamId(tid ?? null);
      setCityStadiumId(sid ?? 'sofi-stadium');
      setOnboardingComplete(true);
      setActiveStadiumId(null);
      setSelectionId((id) => id + 1);
      sessionStorage.setItem('pitchprice-onboarded', '1');
    },
    [],
  );

  const resetOnboarding = useCallback(() => {
    setOnboardingComplete(false);
    setPersona(null);
    setTeamId(null);
    setActiveStadiumId(null);
    setBanterOpponentId(null);
    setBanterKnockoutMode(false);
    setBanterFixtureMatchup(null);
    setIntroGeneration((n) => n + 1);
    sessionStorage.removeItem('pitchprice-onboarded');
  }, []);

  const selectedTeam = useMemo(
    () => teams.find((t) => t.id === teamId) ?? null,
    [teams, teamId],
  );

  const activeStadium = useMemo(
    () => stadiums.find((s) => s.id === activeStadiumId) ?? null,
    [stadiums, activeStadiumId],
  );

  const activeTicket = activeStadiumId ? tickets[activeStadiumId] ?? null : null;
  const activeFixtures = activeStadiumId ? fixtures[activeStadiumId] ?? [] : [];

  const clearBanter = useCallback(() => {
    setBanterOpponentId(null);
    setBanterKnockoutMode(false);
    setBanterFixtureMatchup(null);
  }, []);

  const setBanterFromFixture = useCallback(
    (matchup: string) => {
      if (teams.length === 0) return;
      setBanterFixtureMatchup(matchup);
      if (isKnockoutOnlyMatchup(matchup, teams)) {
        setBanterOpponentId(null);
        setBanterKnockoutMode(true);
        return;
      }
      setBanterKnockoutMode(false);
      setBanterOpponentId(pickBanterOpponentFromFixture(matchup, teams));
    },
    [teams],
  );

  const setActiveStadiumIdWrapped = useCallback((id: string | null) => {
    setActiveStadiumId(id);
    if (!id) setStadium3dEnabled(false);
    setBanterOpponentId(null);
    setBanterKnockoutMode(false);
    setBanterFixtureMatchup(null);
  }, []);

  const value: AppContextValue = {
    persona,
    teamId,
    cityStadiumId,
    onboardingComplete,
    activeStadiumId,
    stadiums,
    teams,
    fixtures,
    tickets,
    dataLoading,
    completeOnboarding,
    resetOnboarding,
    introGeneration,
    selectionId,
    setActiveStadiumId: setActiveStadiumIdWrapped,
    selectedTeam,
    activeStadium,
    activeTicket,
    activeFixtures,
    demoMode,
    stadium3dEnabled,
    setStadium3dEnabled,
    demoRevealTicket,
    setDemoRevealTicket,
    banterOpponentId,
    banterKnockoutMode,
    banterFixtureMatchup,
    setBanterFromFixture,
    clearBanter,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
