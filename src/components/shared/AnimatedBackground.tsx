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
        <path d="M0,128L48,149.3C96,171,192,213,288,224C384,235,480,213,576,197.3C672,181,768,171,864,186.7C960,203,1056,245,1152,256C1248,267,1344,245,1392,234.7L1440,224L1440,600L1392,600C1344,600,1248,600,1152,600C1056,600,960,600,864,600C768,600,672,600,576,600C480,600,384,600,288,600C192,600,96,600,48,600L0,600Z"></path>
      </svg>
      <svg
        className={styles.wave2}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 600"
      >
        <path d="M0,224L48,240C96,256,192,288,288,298.7C384,309,480,299,576,282.7C672,267,768,245,864,250.7C960,256,1056,288,1152,298.7C1248,309,1344,299,1392,293.3L1440,288L1440,600L1392,600C1344,600,1248,600,1152,600C1056,600,960,600,864,600C768,600,672,600,576,600C480,600,384,600,288,600C192,600,96,600,48,600L0,600Z"></path>
      </svg>
      <svg
        className={styles.wave3}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 600"
      >
        <path d="M0,352L48,362.7C96,373,192,395,288,389.3C384,384,480,352,576,346.7C672,341,768,363,864,373.3C960,384,1056,384,1152,373.3C1248,363,1344,341,1392,330.7L1440,320L1440,600L1392,600C1344,600,1248,600,1152,600C1056,600,960,600,864,600C768,600,672,600,576,600C480,600,384,600,288,600C192,600,96,600,48,600L0,600Z"></path>
      </svg>
      <svg
        className={styles.wave4}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 600"
      >
        <path d="M0,480L48,469.3C96,459,192,437,288,442.7C384,448,480,480,576,480C672,480,768,448,864,410.7C960,373,1056,331,1152,325.3C1248,320,1344,352,1392,368L1440,384L1440,600L1392,600C1344,600,1248,600,1152,600C1056,600,960,600,864,600C768,600,672,600,576,600C480,600,384,600,288,600C192,600,96,600,48,600L0,600Z"></path>
      </svg>
    </div>
  );
};

export default AnimatedBackground;
