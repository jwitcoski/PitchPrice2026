/** Sample points along a quadratic bezier for a curved flight path */
export function buildArcCoordinates(
  start: [number, number],
  end: [number, number],
  steps = 64,
): [number, number][] {
  const midLng = (start[0] + end[0]) / 2;
  const midLat = (start[1] + end[1]) / 2;
  const ctrl: [number, number] = [midLng, midLat + 12];
  const coords: [number, number][] = [];

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const u = 1 - t;
    const lng = u * u * start[0] + 2 * u * t * ctrl[0] + t * t * end[0];
    const lat = u * u * start[1] + 2 * u * t * ctrl[1] + t * t * end[1];
    coords.push([lng, lat]);
  }
  return coords;
}
