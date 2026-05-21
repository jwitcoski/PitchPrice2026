export type Persona = 'team' | 'city' | 'tournament';

/** City-inspired basemap palette (not official civic branding) */
export interface CityMapTheme {
  primary: string;
  accent: string;
  water: string;
  background: string;
  land: string;
  buildings3d?: boolean;
}

export interface Stadium {
  id: string;
  name: string;
  city: string;
  country: string;
  lng: number;
  lat: number;
  isOfficialHost2026: boolean;
  theme: CityMapTheme;
}

export type Confederation =
  | 'UEFA'
  | 'CONMEBOL'
  | 'CONCACAF'
  | 'CAF'
  | 'AFC'
  | 'OFC';

export interface Team {
  id: string;
  name: string;
  confederation: Confederation;
  colors: { primary: string; accent: string };
  origin: [number, number];
  originLabel: string;
  stadiumIds: string[];
}

export interface Fixture {
  date: string;
  matchup: string;
  stage: string;
}

export interface TicketRange {
  priceMin: number;
  priceMax: number;
  currency: string;
  label: string;
  categories: string[];
  easterEgg: string;
}

export type FixturesByStadium = Record<string, Fixture[]>;
export type TicketsByStadium = Record<string, TicketRange>;
