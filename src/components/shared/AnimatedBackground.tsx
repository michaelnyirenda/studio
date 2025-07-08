// src/components/shared/AnimatedBackground.tsx
'use client';

import { useEffect } from 'react';
import styles from './animated-background.module.css';

const AnimatedBackground = () => {
  useEffect(() => {
    const handleScroll = () => {
      // Set a CSS variable on the body for the current scroll position
      document.body.style.setProperty('--scroll-y', `${window.scrollY}`);
    };

    // Add scroll listener and set initial value
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // Cleanup listener on component unmount
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={styles.waveContainer}>
      <svg
        className={styles.wave1}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 600"
      >
        <path d="M0,256L48,245.3C96,235,192,213,288,192C384,171,480,149,576,160C672,171,768,213,864,229.3C960,245,1056,235,1152,208C1248,181,1344,139,1392,122.7L1440,107L1440,600L1392,600C1344,600,1248,600,1152,600C1056,600,960,600,864,600C768,600,672,600,576,600C480,600,384,600,288,600C192,600,96,600,48,600L0,600Z"></path>
      </svg>
      <svg
        className={styles.wave2}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 600"
      >
        <path d="M0,320L48,330.7C96,341,192,363,288,341.3C384,320,480,256,576,240C672,224,768,256,864,272C960,288,1056,288,1152,277.3C1248,267,1344,245,1392,234.7L1440,224L1440,600L1392,600C1344,600,1248,600,1152,600C1056,600,960,600,864,600C768,600,672,600,576,600C480,600,384,600,288,600C192,600,96,600,48,600L0,600Z"></path>
      </svg>
      <svg
        className={styles.wave3}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 600"
      >
        <path d="M0,416L48,394.7C96,373,192,331,288,325.3C384,320,480,352,576,346.7C672,341,768,299,864,266.7C960,235,1056,213,1152,197.3C1248,181,1344,171,1392,165.3L1440,160L1440,600L1392,600C1344,600,1248,600,1152,600C1056,600,960,600,864,600C768,600,672,600,576,600C480,600,384,600,288,600C192,600,96,600,48,600L0,600Z"></path>
      </svg>
      <svg
        className={styles.wave4}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 600"
      >
        <path d="M0,480L48,469.3C96,459,192,437,288,426.7C384,416,480,416,576,400C672,384,768,352,864,320C960,288,1056,256,1152,256C1248,256,1344,288,1392,304L1440,320L1440,600L1392,600C1344,600,1248,600,1152,600C1056,600,960,600,864,600C768,600,672,600,576,600C480,600,384,600,288,600C192,600,96,600,48,600L0,600Z"></path>
      </svg>
    </div>
  );
};

export default AnimatedBackground;
