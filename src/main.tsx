import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { App } from './App';

// Fallback for browsers where popover="hint" degrades to "manual":
// switch click-triggered toggletips to "auto" on open so light-dismiss still works.
const popoverProbe = document.createElement('div');
if ('popover' in popoverProbe) {
  popoverProbe.popover = 'hint';
  if (popoverProbe.popover !== 'hint') {
    document.addEventListener(
      'beforetoggle',
      (event) => {
        const target = event.target as HTMLElement | null;
        const toggleEvent = event as ToggleEvent;
        if (!target || toggleEvent.newState !== 'open') return;
        const isToggletip =
          target.getAttribute('popover') === 'hint' &&
          target.id &&
          document.querySelector(`[popovertarget="${CSS.escape(target.id)}"]`);
        if (isToggletip) {
          target.popover = 'auto';
        }
      },
      true,
    );
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
