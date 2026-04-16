'use client';

import confetti from 'canvas-confetti';
import { useEffect } from 'react';

export function Confetti() {
  useEffect(() => {
    const duration = 4000;
    const animationEnd = Date.now() + duration;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 20 * (timeLeft / duration);
      confetti({
        particleCount, 
        spread: 100, 
        origin: { y: 0.6 },
        colors: ['#a864fd', '#29cdff', '#78ff44', '#ff718d', '#fdff6a']
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return null;
}
