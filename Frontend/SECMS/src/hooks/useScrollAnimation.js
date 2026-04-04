import { useEffect, useRef } from 'react';
import './scrollAnimation.css';

/**
 * Custom hook for scroll animations using Intersection Observer
 * @param {string} animationType - Type of animation: 'fadeInUp', 'fadeInDown', 'fadeInLeft', 'fadeInRight', 'scaleIn', 'slideUp'
 * @param {number} delay - Delay before animation starts (in ms, converted to stagger effect)
 */
export const useScrollAnimation = (animationType = 'fadeInUp', delay = 0) => {
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Add animation class when element comes into view
          entry.target.classList.add('scroll-animated');
          entry.target.classList.add(`scroll-${animationType}`);
          
          // Unobserve after animation
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px' // Trigger animation when element is 100px from bottom of viewport
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [animationType]);

  // Apply delay as CSS variable
  if (ref.current) {
    ref.current.style.setProperty('--scroll-delay', `${delay}ms`);
  }

  return ref;
};

export default useScrollAnimation;
