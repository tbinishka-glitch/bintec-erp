'use client';

import React, { useEffect, useState } from 'react';

export function Snowfall() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const snowflakes = Array.from({ length: 50 }).map((_, i) => {
    const left = `${Math.random() * 100}%`;
    const animationDuration = `${Math.random() * 3 + 2}s`;
    const animationDelay = `${Math.random() * 5}s`;
    const opacity = Math.random();
    const size = `${Math.random() * 10 + 5}px`;

    return (
      <div
        key={i}
        className="snowflake"
        style={{
          left,
          animationDuration,
          animationDelay,
          opacity,
          width: size,
          height: size,
        }}
      >
        ❄
      </div>
    );
  });

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden" aria-hidden="true" suppressHydrationWarning>
      <style>{`
        .snowflake {
          position: absolute;
          top: -10%;
          color: #fff;
          user-select: none;
          z-index: 1000;
          font-family: Arial, sans-serif;
          text-shadow: 0 0 5px rgba(255,255,255,0.8);
          animation-name: snowfall;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        @keyframes snowfall {
          0% {
            transform: translateY(0) rotate(0deg);
          }
          100% {
            transform: translateY(110vh) rotate(360deg);
          }
        }
      `}</style>
      {snowflakes}
    </div>
  );
}
