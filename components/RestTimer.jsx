import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { PlusIcon, SkipForwardIcon } from './icons';

const playBeep = (isFinalBeep = false) => {
    if (typeof window === 'undefined') return;
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    if (!audioContext) return;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(isFinalBeep ? 900 : 600, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.1);
};

const RestTimer = ({ duration, onComplete, onClose, title }) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isComplete, setIsComplete] = useState(false);
  
  const targetTimeRef = useRef(0);
  const timerIdRef = useRef(null);

  const playedBeep3Ref = useRef(false);
  const playedBeep2Ref = useRef(false);
  const playedBeep1Ref = useRef(false);

  const checkTime = useCallback(() => {
    const now = Date.now();
    const remainingMs = Math.max(0, targetTimeRef.current - now);
    const remainingSeconds = Math.ceil(remainingMs / 1000);
    
    setTimeLeft(remainingSeconds);

    if (remainingSeconds === 3 && !playedBeep3Ref.current) {
        playBeep(); playedBeep3Ref.current = true;
    }
    if (remainingSeconds === 2 && !playedBeep2Ref.current) {
        playBeep(); playedBeep2Ref.current = true;
    }
    if (remainingSeconds === 1 && !playedBeep1Ref.current) {
        playBeep(); playedBeep1Ref.current = true;
    }

    if (remainingMs <= 0 && !isComplete) {
      if (timerIdRef.current) clearInterval(timerIdRef.current);
      timerIdRef.current = null;
      setIsComplete(true);
      playBeep(true);
      if (navigator.vibrate) {
          navigator.vibrate([100, 50, 100, 50, 100]);
      }
      setTimeout(() => {
          onComplete();
      }, 600);
    }
  }, [isComplete, onComplete]);

  useEffect(() => {
    targetTimeRef.current = Date.now() + duration * 1000;
    
    timerIdRef.current = window.setInterval(checkTime, 200);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkTime();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (timerIdRef.current) clearInterval(timerIdRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [duration, checkTime]);

  const handleAddTime = () => {
    targetTimeRef.current += 30 * 1000;
    
    const remainingSecs = (targetTimeRef.current - Date.now()) / 1000;
    if (remainingSecs > 3) playedBeep3Ref.current = false;
    if (remainingSecs > 2) playedBeep2Ref.current = false;
    if (remainingSecs > 1) playedBeep1Ref.current = false;
    
    checkTime();
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  
  const radius = 120;
  const strokeWidth = 16;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.max(0, timeLeft) / duration) * circumference;

  return (
    <motion.div
      className="fixed inset-0 bg-base-100/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
        <motion.div
            className="absolute inset-0 bg-brand-primary"
            initial={{ opacity: 0 }}
            animate={{ opacity: isComplete ? [0, 1, 0] : 0 }}
            transition={{ duration: 0.6, times: [0, 0.2, 1] }}
        />
      <motion.div 
        className="w-full max-w-xs text-center relative"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1, ease: 'easeOut' }}
      >
        {title && (
            <p className="text-sm text-content-200 mb-4 uppercase tracking-wider">
                {title}
            </p>
        )}
        <div className="relative w-[280px] h-[280px] mx-auto mb-8">
          <svg className="w-full h-full" viewBox="0 0 272 272">
            <defs>
                <linearGradient id="timerGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: 'var(--color-brand-primary)' }} />
                    <stop offset="100%" style={{ stopColor: 'var(--color-brand-secondary)' }} />
                </linearGradient>
            </defs>
            <circle className="text-content-100/10" strokeWidth={strokeWidth} stroke="currentColor" fill="transparent" r={radius} cx="136" cy="136" />
            <motion.circle 
              strokeWidth={strokeWidth}
              strokeDasharray={circumference} 
              strokeDashoffset={strokeDashoffset} 
              strokeLinecap="round" 
              stroke="url(#timerGradient)"
              fill="transparent" 
              r={radius} 
              cx="136" 
              cy="136"
              style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
              transition={{ duration: 0.2, ease: 'linear' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span 
                className="font-orbitron text-7xl text-brand-primary"
            >
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
          </div>
        </div>

        <div className="flex space-x-4">
          <button onClick={handleAddTime} className="w-full flex items-center justify-center space-x-2 bg-transparent border-2 border-base-300 hover:bg-base-300/50 text-content-100 font-bold py-4 px-4 rounded-2xl transition-all duration-200">
            <PlusIcon className="w-6 h-6" />
            <span>30s</span>
          </button>
          <button onClick={onClose} className="w-full flex items-center justify-center space-x-2 bg-transparent border-2 border-base-300 hover:bg-base-300/50 text-content-100 font-bold py-4 px-4 rounded-2xl transition-all duration-200">
            <SkipForwardIcon className="w-6 h-6" />
            <span>Skip</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default RestTimer;
