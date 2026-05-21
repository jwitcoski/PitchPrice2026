export function hexToRgb(hex: string): [number, number, number] {
  const c = hex.replace('#', '');
  const full =
    c.length === 3 ? c.split('').map((x) => x + x).join('') : c.slice(0, 6);
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  return `#${[clamp(r), clamp(g), clamp(b)]
    .map((x) => x.toString(16).padStart(2, '0'))
    .join('')}`;
}

/** Blend two hex colors; t=0 → a, t=1 → b */
export function blendHex(a: string, b: string, t: number): string {
  const [ar, ag, ab] = hexToRgb(a);
  const [br, bg, bb] = hexToRgb(b);
  const m = Math.max(0, Math.min(1, t));
  return rgbToHex(
    ar + (br - ar) * m,
    ag + (bg - ag) * m,
    ab + (bb - ab) * m,
  );
}

export function pitchColorsFromAccent(accent: string, strength: number) {
  const baseLight = '#3d9a5f';
  const baseDark = '#1b5e20';
  const s = Math.max(0, Math.min(1, strength));
  return {
    light: blendHex(accent, baseLight, s * 0.7),
    dark: blendHex(accent, baseDark, s * 0.55),
    ring: accent,
  };
}
