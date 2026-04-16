'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export function Balloons() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const balloons = ['🎈', '🎈', '🎈', '🎉', '🎈'];
  
  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden flex justify-around" suppressHydrationWarning>
      {balloons.map((b, i) => (
        <motion.div
          key={i}
          initial={{ y: '110vh', opacity: 1, x: 0 }}
          animate={{ 
            y: '-20vh', 
            x: [0, (i%2===0? 50 : -50), 0], 
            opacity: [1, 1, 0] 
          }}
          transition={{
            duration: 8 + Math.random() * 5,
            ease: "easeOut",
            repeat: Infinity,
            delay: Math.random() * 5
          }}
          className="text-6xl"
        >
          {b}
        </motion.div>
      ))}
    </div>
  );
}
