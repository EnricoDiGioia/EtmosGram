import { useId } from 'react';

// Marca do EtmosGram: um balão de fala com uma partícula brilhando dentro
// (em Etmos, a magia é linguagem: o feitiço é uma frase dita ao mundo)
export const SIGIL_BUBBLE = 'M9 27.5 A16 16 0 1 1 12.7 33.3 L7.5 39.5 Z';
export const SIGIL_SPARK = 'M24 12.5 Q25.3 20.7 33.5 22 Q25.3 23.3 24 31.5 Q22.7 23.3 14.5 22 Q22.7 20.7 24 12.5 Z';

export function SigilMark({ size = 28, className = '' }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <defs>
        <linearGradient id={`sg-${id}`} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#14b8a6" />
          <stop offset="0.55" stopColor="#fbbf24" />
          <stop offset="1" stopColor="#f97316" />
        </linearGradient>
      </defs>
      <path d={SIGIL_BUBBLE} fill="none" stroke={`url(#sg-${id})`} strokeWidth="4.2" strokeLinejoin="round" />
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
