import React from 'react';
import { motion } from 'framer-motion';
import { getDailyVibe } from '../utils/vibeManager';
import { useWorkoutStore } from '../store/useWorkoutStore';

const getTodayDayName = () => {
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    return days[new Date().getDay()];
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.5, delay: 0.3 } }
};

const MissionStartOverlay = ({ split, onStart }) => {
  const sessionState = useWorkoutStore(s => s.sessionState);
  const dailyVibe = getDailyVibe();
  const dayName = getTodayDayName();
  const splitName = split.name.replace(/ \/ /g, ' & ').toUpperCase();

  return (
    <motion.div
      key="mission-start-overlay"
      className="absolute inset-0 top-16 bg-base-100/95 backdrop-blur-md flex flex-col items-center justify-center z-10 p-4 text-center overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >


      {/* Scanline effect on exit */}
      <motion.div
        className="absolute left-0 w-full h-1 bg-brand-primary/50"
        style={{ boxShadow: '0 0 10px var(--color-brand-primary)' }}
        initial={{ top: '-10%' }}
        exit={{ top: '110%', transition: { duration: 0.4, ease: 'easeIn' } }}
      />
      
      <motion.div 
        initial={{ y: 20, opacity: 0 }} 
        animate={{ y: 0, opacity: 1, transition: { delay: 0.2 } }}
        exit={{ opacity: 0 }}
      >
        <h1 
          className="font-orbitron font-black text-5xl md:text-7xl text-content-100 tracking-wider uppercase"
          style={{ textShadow: '0 0 8px var(--color-brand-primary)' }}
        >
          {sessionState === 'paused' ? 'SESSION PAUSED' : dailyVibe.headline}
        </h1>
        <p className="font-mono text-lg text-content-200 mt-2 uppercase tracking-[0.2em]">
          {dayName}: {splitName}
        </p>
      </motion.div>

      <motion.button
        onClick={onStart}
        className="mt-12 bg-brand-primary text-base-100 font-bold font-orbitron text-xl uppercase tracking-widest px-12 py-5 rounded-xl shadow-lg"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ 
          opacity: 1,
          scale: [1, 1.03, 1],
          boxShadow: [
            "0 0 5px var(--color-brand-primary)",
            "0 0 25px var(--color-brand-primary)",
            "0 0 5px var(--color-brand-primary)"
          ],
          transition: { 
            opacity: { delay: 0.4, duration: 0.5 },
            scale: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
            boxShadow: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }
          }
        }}
        exit={{ opacity: 0 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {sessionState === 'paused' ? 'RE-ENTER BEASTMODE' : dailyVibe.buttonText}
      </motion.button>
      
      {/* Build Info */}
      <p className="absolute bottom-6 font-mono text-xs text-content-100 opacity-40">
        v0.3.0 | Stage: BETA TEST
      </p>
    </motion.div>
  );
};

export default MissionStartOverlay;
