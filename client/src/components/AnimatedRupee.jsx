import React from 'react';
import AnimatedCounter from './AnimatedCounter';

/**
 * AnimatedRupee Component
 * Wrapper around AnimatedCounter that defaults to Indian Rupee (₹) prefix.
 * Re-triggers count-up on scroll down / scroll up automatically.
 */
const AnimatedRupee = ({ prefix = '₹', ...rest }) => {
  return <AnimatedCounter prefix={prefix} {...rest} />;
};

export default AnimatedRupee;
export { AnimatedRupee, AnimatedCounter };
