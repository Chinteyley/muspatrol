export function Logo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="16" fill="#d6ff4a" />
      <path
        d="M14 40c8-14 28-14 36 0"
        fill="none"
        stroke="#13210c"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="24" cy="28" r="3.2" fill="#13210c" />
      <circle cx="40" cy="28" r="3.2" fill="#13210c" />
      <path
        d="M18 22c4-8 8-6 10-2M46 22c-4-8-8-6-10-2"
        fill="none"
        stroke="#13210c"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
