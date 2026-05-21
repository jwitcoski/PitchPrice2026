interface Props {
  size?: number;
  className?: string;
}

export function SoccerBallIcon({ size = 48, className }: Props) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="32" cy="32" r="30" fill="#f8faf8" stroke="#0f172a" strokeWidth="2" />
      <path
        d="M32 14 L38 26 L52 28 L41 37 L44 52 L32 44 L20 52 L23 37 L12 28 L26 26 Z"
        fill="#0f172a"
      />
      <path
        d="M32 14 L26 26 M32 14 L38 26 M26 26 L12 28 M38 26 L52 28"
        stroke="#334155"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
