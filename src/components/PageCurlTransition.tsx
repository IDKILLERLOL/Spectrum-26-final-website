import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { playSynthSound } from '../lib/audio';

type CurlDirection = 'forward' | 'back';

interface PageCurlContextValue {
  startCurl: (direction: CurlDirection, route: string) => void;
}

const PageCurlContext = createContext<PageCurlContextValue | null>(null);

export function usePageCurl(): PageCurlContextValue {
  const ctx = useContext(PageCurlContext);
  if (!ctx) {
    return {
      startCurl: (_direction, route) => {
        window.location.href = route;
      },
    };
  }
  return ctx;
}

const DURATION = 550; // ms

/**
 * PageCurlTransition — wraps the app and provides startCurl().
 *
 * Forward (Landing → Register): page lifts right-to-left (rotateY: 0 → -150deg, transform-origin: left)
 * Back    (Register → Landing): page lifts left-to-right (rotateY: 0 → 150deg, transform-origin: right)
 *
 * Router.push fires at 50% of DURATION (275ms) so the incoming page
 * mounts while the outgoing page is mid-curl.
 *
 * prefers-reduced-motion: skip transform, delegate to normal React Router navigation.
 * Mobile: drops gradient shadow overlay, uses flat rgba fade instead.
 */
export function PageCurlProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [curlState, setCurlState] = useState<{
    active: boolean;
    direction: CurlDirection;
    progress: 'start' | 'end';
  }>({ active: false, direction: 'forward', progress: 'start' });

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.innerWidth < 640;
  const inProgressRef = useRef(false);

  const startCurl = useCallback(
    (direction: CurlDirection, route: string) => {
      if (inProgressRef.current) return;

      // Reduced motion: just navigate normally
      if (prefersReduced) {
        navigate(route);
        return;
      }

      inProgressRef.current = true;
      playSynthSound('paper' as any); // 'paper' sound — added to audio.ts

      setCurlState({ active: true, direction, progress: 'start' });

      // Start curl animation
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setCurlState({ active: true, direction, progress: 'end' });
        });
      });

      // Navigate at 50% of duration
      setTimeout(() => {
        navigate(route);
      }, DURATION * 0.5);

      // Unmount overlay after animation completes
      setTimeout(() => {
        setCurlState({ active: false, direction, progress: 'start' });
        inProgressRef.current = false;
      }, DURATION + 50);
    },
    [navigate, prefersReduced]
  );

  const isForward = curlState.direction === 'forward';
  const origin = isForward ? 'left center' : 'right center';
  const endRotate = isForward ? '-150deg' : '150deg';

  return (
    <PageCurlContext.Provider value={{ startCurl }}>
      {children}
      {curlState.active && (
        <div
          aria-hidden="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9990,
            perspective: '1800px',
            pointerEvents: 'none',
            overflow: 'hidden',
          }}
        >
          {/* The "lifting page" — uses existing bg to look like page peeling */}
          <div
            style={{
              width: '100%',
              height: '100%',
              background: 'var(--color-bg-base)',
              transformStyle: 'preserve-3d',
              transformOrigin: origin,
              transform:
                curlState.progress === 'end' ? `rotateY(${endRotate})` : 'rotateY(0deg)',
              transition: `transform ${DURATION}ms cubic-bezier(0.6, 0, 0.4, 1)`,
            }}
          >
            {/* Gradient shadow band along the curl edge — desktop only */}
            {!isMobile && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  width: '12%',
                  background: isForward
                    ? 'linear-gradient(to right, rgba(0,0,0,0.6), transparent)'
                    : 'linear-gradient(to left, rgba(0,0,0,0.6), transparent)',
                  // Shadow moves with the curl
                  [isForward ? 'left' : 'right']: 0,
                  transition: `opacity ${DURATION}ms ease`,
                  opacity: curlState.progress === 'end' ? 0 : 1,
                  pointerEvents: 'none',
                }}
              />
            )}

            {/* Mobile: flat dark overlay */}
            {isMobile && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(0,0,0,0.3)',
                  opacity: curlState.progress === 'end' ? 0 : 1,
                  transition: `opacity ${DURATION}ms ease`,
                  pointerEvents: 'none',
                }}
              />
            )}
          </div>
        </div>
      )}
    </PageCurlContext.Provider>
  );
}
