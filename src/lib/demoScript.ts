/** Timings for `?demo=1` screen recording (ms from page load). */
export const DEMO_TIMINGS = {
  /** Open Team mode with Switzerland pre-selected. */
  startTeamMs: 400,
  /** Finish onboarding → fly to Bern / team routes. */
  completeOnboardingMs: 2800,
  /** Select SoFi on the map (Switzerland vs. Bosnia fixture + banter). */
  selectStadiumMs: 7500,
  /** Turn on MapTiler 3D (Hybrid satellite + labels + venue marker). */
  enable3dMs: 11500,
  /** Show ticket bar easter egg tooltip. */
  showTicketEasterEggMs: 16000,
} as const;
