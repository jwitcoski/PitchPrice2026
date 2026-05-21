import type { Team } from '../types';

function hexLuminance(hex: string): number {
  const c = hex.replace('#', '');
  if (c.length < 6) return 0.5;
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

/** Arc + origin colors that stay readable over themed water (not team primary on ocean) */
export function getTeamRouteColors(team: Team) {
  const accentIsLight = hexLuminance(team.colors.accent) > 0.72;
  const line = accentIsLight ? team.colors.primary : team.colors.accent;
  const casing = accentIsLight ? '#0d1117' : '#ffffff';

  return {
    line,
    casing,
    casingWidth: 7,
    lineWidth: 4,
    originFill: line,
    originStroke: casing,
    originStrokeWidth: 4,
  };
}
