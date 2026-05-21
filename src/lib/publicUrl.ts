/** Public asset or JSON path (files in `public/`) with Vite `base` prefix. */
export function publicUrl(path: string): string {
  const normalized = path.replace(/^\//, '');
  return `${import.meta.env.BASE_URL}${normalized}`;
}
