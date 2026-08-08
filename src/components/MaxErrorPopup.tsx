import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useMaxError } from '../contexts/MaxErrorContext';

/**
 * MaxErrorPopup — global error character popup using Max Mayfield sprite.
 *
 * Desktop: slides in from right, docks bottom-right.
 * Mobile:  slides in from bottom, docks bottom-center.
 *
 * Speech bubble appears 100ms after slide-in completes.
 * Auto-dismisses after 4000ms or on click.
 * If showMaxError fires while visible: text crossfades, timer resets.
 *
 * prefers-reduced-motion: fade instead of slide.
 */
export function MaxErrorPopup() {
  const { visible, message, ariaMessage, dismiss } = useMaxError();
  const [mounted, setMounted] = useState(false);
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const prevMessage = useRef('');
  const [bubbleFade, setBubbleFade] = useState(false); // triggers crossfade on re-trigger
  const prefersReduced = useMemo(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  );

  // Mount/unmount with animation timing
  useEffect(() => {
    if (visible) {
      setMounted(true);
      // Show bubble 100ms after slide starts
      const t = setTimeout(() => setBubbleVisible(true), prefersReduced ? 50 : 350);
      return () => clearTimeout(t);
    } else {
      setBubbleVisible(false);
      // Unmount after exit animation
      const t = setTimeout(() => setMounted(false), prefersReduced ? 300 : 300);
      return () => clearTimeout(t);
    }
  }, [visible, prefersReduced]);

  // Crossfade bubble text if message changes while already visible
  useEffect(() => {
    if (message && message !== prevMessage.current && mounted && bubbleVisible) {
      setBubbleFade(true);
      const t = setTimeout(() => setBubbleFade(false), 150);
      prevMessage.current = message;
      return () => clearTimeout(t);
    }
    prevMessage.current = message;
  }, [message, mounted, bubbleVisible]);

  if (!mounted) return null;

  const isVisible = visible;
  const location = useLocation();

  const character = useMemo(() => {
    const match = location.pathname.match(/\/register\/([^/]+)/);
    if (match) {
      const eventId = match[1];
      const mapping: Record<string, string> = {
        'tech-duo-1': 'max',
        'tech-solo-1': 'eleven',
        'non-tech-1': 'steve',
        'non-tech-3': 'lucas',
      };
      return mapping[eventId] || 'max';
    }
    return 'max';
  }, [location.pathname]);

  return (
    <>
      {/* aria-live region — screen readers get plain-English error */}
      <div
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          overflow: 'hidden',
          clip: 'rect(0,0,0,0)',
          whiteSpace: 'nowrap',
        }}
      >
        {ariaMessage}
      </div>

      {/* Popup container */}
      <div
        className="max-error-popup"
        data-visible={isVisible}
        data-reduced={prefersReduced}
        onClick={dismiss}
        style={{
          position: 'fixed',
          bottom: 0,
          zIndex: 9998,
          display: 'flex',
          alignItems: 'flex-end',
          gap: 8,
          cursor: 'pointer',
          // Desktop: right side
          right: 0,
          left: 'auto',
          flexDirection: 'row',
          // Animation
          transform: prefersReduced
            ? 'none'
            : isVisible
              ? 'translateX(0)'
              : 'translateX(110%)',
          opacity: prefersReduced ? (isVisible ? 1 : 0) : 1,
          transition: prefersReduced
            ? `opacity ${isVisible ? 300 : 250}ms ease-${isVisible ? 'out' : 'in'}`
            : `transform ${isVisible ? 300 : 250}ms ease-${isVisible ? 'out' : 'in'}`,
        }}
      >
        {/* Speech bubble (to the left of sprite on desktop) */}
        <div
          className="pixel-bubble"
          style={{
            opacity: bubbleVisible ? (bubbleFade ? 0 : 1) : 0,
            transition: `opacity ${bubbleFade ? 150 : 150}ms ease-out`,
          }}
        >
          {message}
        </div>

        {/* Mapped high-fidelity PNG sprite */}
        <div style={{ marginBottom: 0, flexShrink: 0, paddingBottom: 0 }}>
          <img
            src={{
              max: '/green.png',
              eleven: '/purple.png',
              steve: '/orange.png',
              lucas: '/blue.png',
            }[character] || '/green.png'}
            alt={character}
            style={{
              imageRendering: 'pixelated',
              width: '110px',
              height: '135px',
              objectFit: 'contain',
              display: 'block',
            }}
          />
        </div>
      </div>

      {/* Mobile layout override and Custom Pixel Art Speech Bubble Sprite */}
      <style>{`
        .pixel-bubble {
          position: relative;
          background: #ffffff;
          border: 4px solid #000000;
          box-shadow: 4px 4px 0 #000000;
          padding: 12px 16px;
          max-width: 245px;
          margin-bottom: 16px;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 13px;
          color: #000000;
          line-height: 1.4;
          user-select: none;
        }

        /* Tail for desktop (pointing right towards character) */
        .pixel-bubble::after {
          content: "";
          position: absolute;
          right: -12px;
          top: 50%;
          transform: translateY(-50%) rotate(45deg);
          width: 16px;
          height: 16px;
          background: #ffffff;
          border-top: 4px solid #000000;
          border-right: 4px solid #000000;
          z-index: 10;
        }

        /* Mask line for desktop to connect tail to box */
        .pixel-bubble::before {
          content: "";
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 4px;
          height: 12px;
          background: #ffffff;
          z-index: 11;
        }

        @media (max-width: 640px) {
          .max-error-popup {
            right: auto !important;
            left: 50% !important;
            transform: ${prefersReduced ? 'translateX(-50%)' : isVisible ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(110%)'} !important;
            flex-direction: column !important;
            align-items: center !important;
          }
          .max-error-popup > div:first-child {
            margin-bottom: 0 !important;
          }
          /* Reposition tail to bottom center for mobile layout */
          .pixel-bubble::after {
            right: auto !important;
            left: 50% !important;
            top: auto !important;
            bottom: -12px !important;
            transform: translateX(-50%) rotate(135deg) !important;
          }
          .pixel-bubble::before {
            right: auto !important;
            left: 50% !important;
            top: auto !important;
            bottom: 0 !important;
            transform: translateX(-50%) !important;
            width: 12px !important;
            height: 4px !important;
          }
        }
      `}</style>
    </>
  );
}
