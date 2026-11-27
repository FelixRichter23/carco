import { formatStarScore } from '../utils/format';

interface StarRatingProps {
  value: number;
  size?: 'sm' | 'md' | 'lg';
  showNumeric?: boolean;
  darkSurface?: boolean;
  label?: string;
}

export function StarRating({
  value,
  size = 'md',
  showNumeric = true,
  darkSurface = false,
  label,
}: StarRatingProps) {
  const clamped = Math.min(5, Math.max(0, value));
  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';
  const textSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm';

  return (
    <div
      className="inline-flex items-center gap-1.5"
      aria-label={`${label ? `${label}: ` : ''}${formatStarScore(clamped)} out of 5 stars`}
    >
      <div className="inline-flex items-center gap-0.5" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((starIndex) => {
          const fillPercent = Math.min(1, Math.max(0, clamped - (starIndex - 1))) * 100;
          return (
            <span key={starIndex} className={`relative inline-block ${iconSize}`}>
              <svg
                viewBox="0 0 20 20"
                className={`w-full h-full ${darkSurface ? 'text-slate-600' : 'text-slate-200'}`}
                fill="currentColor"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.368 2.447a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.368-2.447a1 1 0 00-1.175 0l-3.368 2.447c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.063 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" />
              </svg>
              {fillPercent > 0 && (
                <span
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${fillPercent}%` }}
                >
                  <svg
                    viewBox="0 0 20 20"
                    className={`${iconSize} text-[#D97706]`}
                    fill="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.368 2.447a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.368-2.447a1 1 0 00-1.175 0l-3.368 2.447c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.063 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" />
                  </svg>
                </span>
              )}
            </span>
          );
        })}
      </div>
      {showNumeric && (
        <span
          className={`font-semibold tabular-nums ${textSize} ${
            darkSurface ? 'text-white' : 'text-[#0F172A]'
          }`}
        >
          {formatStarScore(clamped)}
        </span>
      )}
    </div>
  );
}
