import { useId } from 'react';

// Marca do EtmosGram: a partícula "Olho-centelha" — um olho com uma centelha
// no lugar da pupila, dentro de um círculo aberto (a lente que guarda o instante)
export const SIGIL_RING = 'M37.79 12.43 A18 18 0 1 1 30.16 7.09';
export const SIGIL_EYE = 'M12.5 24 Q24 14 35.5 24 Q24 34 12.5 24 Z';
export const SIGIL_SPARK = 'M24 18.6 Q25.1 22.9 29.4 24 Q25.1 25.1 24 29.4 Q22.9 25.1 18.6 24 Q22.9 22.9 24 18.6 Z';

export function SigilMark({ size = 28, className = '' }) {
  const id = useId().replace(/:/g, '');
  // traço mais grosso quando o símbolo é pequeno, para continuar legível
  const sw = size <= 32 ? 3.6 : 3;
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <defs>
        <linearGradient id={`sg-${id}`} x1="4" y1="44" x2="44" y2="4" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#2dd4bf" />
          <stop offset="0.55" stopColor="#fbbf24" />
          <stop offset="1" stopColor="#fb923c" />
        </linearGradient>
      </defs>
      <g fill="none" stroke={`url(#sg-${id})`} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <path d={SIGIL_RING} />
        <path d={SIGIL_EYE} />
      </g>
      <path d={SIGIL_SPARK} fill={`url(#sg-${id})`} />
    </svg>
  );
}

export function Wordmark({ className = '' }) {
  return (
    <span className={`wordmark ${className}`}>
      <SigilMark size={24} />
      <span>etmosgram</span>
    </span>
  );
}
