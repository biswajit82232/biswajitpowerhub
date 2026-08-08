/** Small vibrant KPI icons — 20×20, tuned for gradient badge backgrounds */

const base = 'h-[17px] w-[17px] shrink-0';

export function IconSavings({ className }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className || base} aria-hidden>
      <path
        d="M10 4.5c-2.5 0-4 1.2-4 3 0 1.8 1.5 2.5 4 3.2 2.2.6 3 1.1 3 2.3 0 1.2-1.1 2-3 2s-3-.6-3.5-1.5"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path d="M10 3.5v1.2M10 14.8v1.7" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="14.5" cy="6" r="1.2" fill="#A7F3D0" />
    </svg>
  );
}

export function IconRange({ className }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className || base} aria-hidden>
      <path
        d="M3.5 14.5c2-3.5 4.5-5.5 7-5.5s5 2 7 5.5"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="10" cy="9" r="2.5" fill="white" />
      <circle cx="10" cy="9" r="1" fill="#93C5FD" />
      <path d="M10 11.8v2.7M7.5 16.2h5" stroke="white" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

export function IconCharging({ className }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className || base} aria-hidden>
      <rect x="4.5" y="6" width="9" height="8" rx="1.5" fill="white" fillOpacity="0.9" />
      <path d="M11 8.5L9 12h1.8l-1 2.5" stroke="#0284C7" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 9v4" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function IconDays({ className }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className || base} aria-hidden>
      <rect x="3.5" y="5.5" width="13" height="10" rx="1.5" fill="white" fillOpacity="0.9" />
      <rect x="3.5" y="5.5" width="13" height="2.8" rx="1.5" fill="#C4B5FD" />
      <path d="M7 3.8v2.2M13 3.8v2.2" stroke="white" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="10" cy="12.2" r="1.6" fill="#7C3AED" />
    </svg>
  );
}

export function IconPetrol({ className }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className || base} aria-hidden>
      <path d="M5.5 4.5h5.5v11H5.5z" fill="white" fillOpacity="0.9" />
      <path d="M11.5 7.5h2l1.5 1.8v5.7h-3.5V7.5z" fill="#FED7AA" />
      <rect x="7.2" y="8" width="2" height="4" rx="0.4" fill="#EA580C" />
      <circle cx="8.2" cy="14.2" r="0.7" fill="white" />
    </svg>
  );
}

export function IconPerCharge({ className }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className || base} aria-hidden>
      <rect x="4.5" y="6.5" width="11" height="7" rx="1.5" fill="white" fillOpacity="0.9" />
      <path d="M10 8.5v4M8.5 10.5h3" stroke="#D97706" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M16 9.5v3" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
