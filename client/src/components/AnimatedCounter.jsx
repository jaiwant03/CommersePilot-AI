import React, { useState, useEffect, useRef } from 'react';

/**
 * AnimatedCounter Component
 * Animates numbers from 0 to target value every time they enter the viewport.
 * Resets to 0 when scrolled out of view so that scrolling back down/up
 * triggers the count-up animation again without needing a page refresh.
 */
const AnimatedCounter = ({
  value,
  prefix = '',
  suffix = '',
  duration = 1200,
  className = '',
  decimals = 0,
  useIndianLocale = true
}) => {
  const [displayCount, setDisplayCount] = useState(0);
  const elementRef = useRef(null);
  const animFrameRef = useRef(null);

  // Extract clean number from string or number prop
  const numericTarget = typeof value === 'number'
    ? value
    : parseFloat(String(value).replace(/[^0-9.-]+/g, '')) || 0;

  // Determine decimals automatically if not explicitly provided and value has decimals
  const effectiveDecimals = decimals > 0 
    ? decimals 
    : (String(value).includes('.') && !isNaN(parseFloat(String(value))))
      ? (String(value).split('.')[1]?.replace(/[^0-9]/g, '').length || 0) 
      : 0;

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3);

    const startAnimation = () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }

      const startTime = performance.now();
      const startVal = 0;
      const endVal = numericTarget;

      const step = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOutCubic(progress);

        const currentVal = startVal + (endVal - startVal) * easedProgress;
        setDisplayCount(currentVal);

        if (progress < 1) {
          animFrameRef.current = requestAnimationFrame(step);
        } else {
          setDisplayCount(endVal);
          animFrameRef.current = null;
        }
      };

      animFrameRef.current = requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          startAnimation();
        } else {
          // When leaving the viewport, cancel any active animation and reset to 0
          // so returning to the element re-triggers the count-up animation!
          if (animFrameRef.current) {
            cancelAnimationFrame(animFrameRef.current);
            animFrameRef.current = null;
          }
          setDisplayCount(0);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [numericTarget, duration, effectiveDecimals]);

  const formattedNumber = effectiveDecimals > 0
    ? displayCount.toLocaleString(useIndianLocale ? 'en-IN' : 'en-US', {
        minimumFractionDigits: effectiveDecimals,
        maximumFractionDigits: effectiveDecimals
      })
    : Math.round(displayCount).toLocaleString(useIndianLocale ? 'en-IN' : 'en-US');

  return (
    <span
      ref={elementRef}
      className={`animated-counter-value ${className}`}
      style={{
        display: 'inline-block',
        fontVariantNumeric: 'tabular-nums',
        fontFeatureSettings: '"tnum"'
      }}
    >
      {prefix}{formattedNumber}{suffix}
    </span>
  );
};

export default AnimatedCounter;
export { AnimatedCounter as AnimatedRupee };
