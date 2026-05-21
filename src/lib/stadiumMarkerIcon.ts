import type { Map } from '@maptiler/sdk';
import { pitchColorsFromAccent } from './colorUtils';

const ICON_DEFAULT = 'stadium-soccer';
const ICON_HIGHLIGHT = 'stadium-soccer-highlight';

function drawSoccerBall(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = '#fafafa';
  ctx.fill();
  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth = Math.max(1, r * 0.12);
  ctx.stroke();

  const pentagonR = r * 0.38;
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const a = (i * 2 * Math.PI) / 5 - Math.PI / 2;
    const x = cx + pentagonR * Math.cos(a);
    const y = cy + pentagonR * Math.sin(a);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = '#333';
  ctx.lineWidth = Math.max(0.5, r * 0.08);
  for (let i = 0; i < 5; i++) {
    const a = (i * 2 * Math.PI) / 5 - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
    ctx.stroke();
  }
  ctx.restore();
}

function drawPitchMarker(
  size: number,
  highlight: boolean,
  accentRing: string,
  tintStrength: number,
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const dpr = 2;
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(dpr, dpr);
  const cx = size / 2;
  const cy = size / 2;
  const outer = size / 2 - 2;
  const pitch = pitchColorsFromAccent(
    accentRing,
    highlight ? Math.max(0.75, tintStrength) : tintStrength * 0.35,
  );

  if (highlight) {
    ctx.beginPath();
    ctx.arc(cx, cy, outer + 5, 0, Math.PI * 2);
    ctx.fillStyle = pitch.ring;
    ctx.globalAlpha = 0.5;
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.beginPath();
    ctx.arc(cx, cy, outer + 2, 0, Math.PI * 2);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.85;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  const grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, outer);
  grad.addColorStop(0, pitch.light);
  grad.addColorStop(1, pitch.dark);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, outer, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = highlight ? '#ffffff' : 'rgba(255,255,255,0.75)';
  ctx.lineWidth = highlight ? 2.5 : 1.5;
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255,255,255,0.7)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx, cy - outer + 4);
  ctx.lineTo(cx, cy + outer - 4);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, outer * 0.32, 0, Math.PI * 2);
  ctx.stroke();

  const boxW = outer * 0.55;
  ctx.strokeRect(cx - boxW, cy - outer + 3, boxW * 2, outer * 0.28);
  ctx.strokeRect(cx - boxW, cy + outer - 3 - outer * 0.28, boxW * 2, outer * 0.28);

  drawSoccerBall(ctx, cx, cy, highlight ? outer * 0.36 : outer * 0.3);

  return canvas;
}

function canvasToImageData(canvas: HTMLCanvasElement): ImageData {
  const ctx = canvas.getContext('2d')!;
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

let iconsLoadedForMap = new WeakMap<Map, string>();

export async function ensureStadiumSoccerIcons(
  map: Map,
  accentColor = '#69f0ae',
): Promise<void> {
  const key = accentColor;
  if (iconsLoadedForMap.get(map) === key) return;

  const defaultCanvas = drawPitchMarker(40, false, accentColor, 1);
  const highlightCanvas = drawPitchMarker(52, true, accentColor, 1);

  const defaultImg = canvasToImageData(defaultCanvas);
  const highlightImg = canvasToImageData(highlightCanvas);

  if (map.hasImage(ICON_DEFAULT)) map.removeImage(ICON_DEFAULT);
  if (map.hasImage(ICON_HIGHLIGHT)) map.removeImage(ICON_HIGHLIGHT);

  map.addImage(ICON_DEFAULT, defaultImg, { pixelRatio: 2 });
  map.addImage(ICON_HIGHLIGHT, highlightImg, { pixelRatio: 2 });

  iconsLoadedForMap.set(map, key);
}

export { ICON_DEFAULT, ICON_HIGHLIGHT };
