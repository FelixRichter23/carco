import { useEffect, useState } from 'react';

interface CarImageProps {
  src?: string;
  alt: string;
  fit?: 'cover' | 'contain';
  className?: string;
  fallbackLabel?: string;
  darkSurface?: boolean;
  compact?: boolean;
}

export function CarImage({
  src,
  alt,
  fit = 'cover',
  className = '',
  fallbackLabel = 'No vehicle photo available',
  darkSurface = false,
  compact = false,
}: CarImageProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  const trimmed = src?.trim();

  if (!trimmed || hasError) {
    return (
      <div
        className={`flex flex-col items-center justify-center overflow-hidden select-none ${
          darkSurface ? 'bg-slate-900 text-slate-400' : 'bg-slate-100 text-slate-400'
        } ${className}`}
        role="img"
        aria-label={alt}
      >
        <svg
          viewBox="0 0 120 64"
          className={compact ? 'w-7 h-4 opacity-70' : 'w-20 h-12 opacity-65'}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M18 42H102C105.314 42 108 39.3137 108 36V32.5C108 29.8 106.1 27.4 103.5 26.8L87 23L73 13.5C70.6 11.9 67.8 11 64.9 11H42.5C38.6 11 34.9 12.7 32.3 15.6L21 28L15.2 29.5C13.3 30 12 31.7 12 33.7V36C12 39.3137 14.6863 42 18 42Z"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path
            d="M36 27L43 17H64C66 17 68 17.6 69.6 18.8L80 26.5H36Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <circle
            cx="33"
            cy="43"
            r="8"
            fill={darkSurface ? '#0F172A' : '#F1F5F9'}
            stroke="currentColor"
            strokeWidth="2.5"
          />
          <circle cx="33" cy="43" r="3" fill="currentColor" />
          <circle
            cx="87"
            cy="43"
            r="8"
            fill={darkSurface ? '#0F172A' : '#F1F5F9'}
            stroke="currentColor"
            strokeWidth="2.5"
          />
          <circle cx="87" cy="43" r="3" fill="currentColor" />
        </svg>
        {!compact && (
          <span className="mt-2 text-xs font-medium tracking-tight opacity-80">
            {hasError ? 'Image failed to load' : fallbackLabel}
          </span>
        )}
      </div>
    );
  }

  return (
    <img
      src={trimmed}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setHasError(true)}
      className={`${fit === 'contain' ? 'object-contain' : 'object-cover'} ${className}`}
    />
  );
}
