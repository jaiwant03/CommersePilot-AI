import React, { useState, useEffect, useRef } from 'react';

/**
 * AnimatedRupee Component
 * Smoothly animates a numeric rupee amount from 0 to its target value
 * when the element scrolls into view. Formats using Indian numbering (en-IN).
 */
const AnimatedRupee = ({
  value,
  prefix = '₹',
  suffix = '',
  duration = 1400,
  className = '',
  decimals = 0
}) => {
  const [displayCount, setDisplayCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementRef = useRef(null);

  // Extract clean number from string or number prop
  const numericTarget = typeof value === 'number' 
    ? value 
    : parseFloat(String(value).replace(/[^0-9.-]+/g, '')) || 0;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          animateCount();
        }
      },
      { threshold: 0.15 }
    );

    const el = elementRef.current;
    if (el) {
      observer.observe(el);
    }

    return () => {
      if (el) observer.unobserve(el);
    };
  }, [hasAnimated, numericTarget]);

  const animateCount = () => {
    const startTime = performance.now();
    const startVal = 0;
    const endVal = numericTarget;

    // Smooth ease-out cubic curve
    const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3);

    const step = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);

      const currentVal = startVal + (endVal - startVal) * easedProgress;
      setDisplayCount(currentVal);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setDisplayCount(endVal);
      }
    };

    requestAnimationFrame(step);
  };

  const formattedNumber = decimals > 0
    ? displayCount.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    : Math.round(displayCount).toLocaleString('en-IN');

  return (
    <span ref={elementRef} className={`animated-rupee-value ${className}`}>
      {prefix}{formattedNumber}{suffix}
    </span>
  );
};

export default AnimatedRupee;
