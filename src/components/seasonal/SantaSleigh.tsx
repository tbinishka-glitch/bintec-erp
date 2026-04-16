'use client';

import { motion } from 'framer-motion';

export function SantaSleigh() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      <motion.div
        initial={{ x: '-20vw', y: '10vh', opacity: 0 }}
        animate={{ 
          x: '120vw', 
          y: ['10vh', '15vh', '8vh', '12vh'], // gentle bobbing
          opacity: [0, 1, 1, 0] 
        }}
        transition={{
          duration: 15,
          ease: "linear",
          repeat: Infinity,
          repeatDelay: 20 // Re-appears every 20 seconds after crossing
        }}
        className="absolute top-10 left-0 drop-shadow-2xl"
        style={{ filter: 'drop-shadow(0px 15px 15px rgba(0,0,0,0.3))' }}
      >
        <img 
          src="/santa.png" 
          alt="Santa Sleigh" 
          className="w-[200px] md:w-[350px] lg:w-[450px] object-contain drop-shadow-2xl"
        />
      </motion.div>
    </div>
  );
}
