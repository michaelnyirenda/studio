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
        viewBox="0 0 1440 1000"
      >
        <path d="M0,288L48,309.3C96,331,192,373,288,384C384,395,480,373,576,346.7C672,320,768,288,864,298.7C960,309,1056,363,1152,389.3C1248,416,1344,416,1392,416L1440,416L1440,1000L1392,1000C1344,1000,1248,1000,1152,1000C1056,1000,960,1000,864,1000C768,1000,672,1000,576,1000C480,1000,384,1000,288,1000C192,1000,96,1000,48,1000L0,1000Z"></path>
      </svg>
      <svg
        className={styles.wave2}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 1000"
      >
        <path d="M0,448L48,442.7C96,437,192,416,288,421.3C384,427,480,459,576,480C672,501,768,512,864,485.3C960,459,1056,395,1152,384C1248,373,1344,416,1392,437.3L1440,459L1440,1000L1392,1000C1344,1000,1248,1000,1152,1000C1056,1000,960,1000,864,1000C768,1000,672,1000,576,1000C480,1000,384,1000,288,1000C192,1000,96,1000,48,1000L0,1000Z"></path>
      </svg>
      <svg
        className={styles.wave3}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 1000"
      >
        <path d="M0,640L48,608C96,576,192,512,288,517.3C384,523,480,597,576,645.3C672,693,768,715,864,698.7C960,683,1056,629,1152,608C1248,587,1344,597,1392,602.7L1440,608L1440,1000L1392,1000C1344,1000,1248,1000,1152,1000C1056,1000,960,1000,864,1000C768,1000,672,1000,576,1000C480,1000,384,1000,288,1000C192,1000,96,1000,48,1000L0,1000Z"></path>
      </svg>
      <svg
        className={styles.wave4}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 1000"
      >
        <path d="M0,800L48,810.7C96,821,192,843,288,826.7C384,811,480,757,576,746.7C672,736,768,768,864,789.3C960,811,1056,821,1152,800C1248,779,1344,725,1392,698.7L1440,672L1440,1000L1392,1000C1344,1000,1248,1000,1152,1000C1056,1000,960,1000,864,1000C768,1000,672,1000,576,1000C480,1000,384,1000,288,1000C192,1000,96,1000,48,1000L0,1000Z"></path>
      </svg>
    </div>
  );
};

export default AnimatedBackground;
