import { publicUrl } from '../lib/publicUrl';

interface Props {
  height?: number;
  className?: string;
}

/** Official MapTiler wordmark (from api.maptiler.com/resources/logo.svg) */
export function MapTilerLogo({ height = 18, className }: Props) {
  return (
    <img
      src={publicUrl('maptiler-logo.svg')}
      alt="MapTiler"
      className={className}
      height={height}
      width={Math.round(height * 3.35)}
      decoding="async"
    />
  );
}
