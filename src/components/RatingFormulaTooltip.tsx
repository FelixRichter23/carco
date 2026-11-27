import { useEffect, useId, useRef, useState } from 'react';
import { Info } from 'lucide-react';

interface RatingFormulaTooltipProps {
  compact?: boolean;
}

export function RatingFormulaTooltip({ compact = false }: RatingFormulaTooltipProps) {
  const reactId = useId();
  const popoverId = `rating-formula-${reactId.replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const popoverRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const el = popoverRef.current;
    if (!el) return;
    const handleToggle = (event: Event) => {
      const toggleEvent = event as ToggleEvent;
      setIsOpen(toggleEvent.newState === 'open');
    };
    el.addEventListener('toggle', handleToggle);
    return () => el.removeEventListener('toggle', handleToggle);
  }, []);

  const triggerProps = {
    interestfor: popoverId,
    popovertarget: popoverId,
    popovertargetaction: 'show',
  } as Record<string, string>;

  const popoverProps = {
    popover: 'hint',
  } as Record<string, string>;

  return (
    <span className="inline-flex items-center">
      <button
        type="button"
        {...triggerProps}
        aria-label="How star ratings are calculated"
        aria-expanded={isOpen}
        className={`inline-flex items-center gap-1 rounded-md border border-[#E2E8F0] bg-white text-slate-600 hover:text-[#1E40AF] hover:border-[#1E40AF]/40 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E40AF] cursor-pointer ${
          compact ? 'p-1' : 'px-2 py-1 text-xs font-medium'
        }`}
      >
        <Info className="w-3.5 h-3.5" aria-hidden="true" />
        {!compact && <span>Scoring</span>}
      </button>

      <div
        ref={popoverRef}
        id={popoverId}
        role="tooltip"
        {...popoverProps}
        className="formula-toggletip text-left"
      >
        <p className="text-xs font-semibold uppercase tracking-wider text-[#1E40AF] mb-2">
          Fact-Based Star Formula (1.0 – 5.0 ★)
        </p>
        <ul className="space-y-1.5 text-xs text-slate-600 leading-relaxed">
          <li>
            <strong className="text-[#0F172A]">Reliability (30%):</strong> Linear scale from the
            0–100 TÜV/ADAC index.
          </li>
          <li>
            <strong className="text-[#0F172A]">Value for Money (25%):</strong> 60% quality score
            (reliability, comfort, practicality, retention) + 40% purchase price affordability (€8k
            to €55k).
          </li>
          <li>
            <strong className="text-[#0F172A]">Running Costs (25%):</strong> Total annual cost at
            15,000 km/yr (cost/km + insurance + vehicle tax), benchmarked from €3,000/yr (5★) to
            €11,500/yr (1★).
          </li>
          <li>
            <strong className="text-[#0F172A]">Value Retention (20%):</strong> Linear scale from
            the 0–100 resale retention index.
          </li>
        </ul>
      </div>
    </span>
  );
}
