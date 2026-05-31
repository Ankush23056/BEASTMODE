import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon } from './icons';

const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 }
};

const IntensityInfoModal = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <motion.div
            variants={modalVariants}
            initial="hidden" animate="visible" exit="exit"
            className="bg-base-200/90 backdrop-blur-2xl border border-base-300 rounded-2xl shadow-xl w-full max-w-md p-6 relative"
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-content-200 hover:text-content-100">
              <XIcon className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold mb-4 text-brand-primary">Intensity Guide</h2>

            <div className="space-y-4 text-content-100">
                <div>
                    <h3 className="font-bold text-lg">HEAVY (Strength)</h3>
                    <p className="text-content-200 text-sm">
                        Target 6-8 reps. Designed for building raw power. High intensity requires 3 minutes of rest for the nervous system to recover.
                    </p>
                </div>
                <div>
                    <h3 className="font-bold text-lg">VOLUME (Hypertrophy)</h3>
                    <p className="text-content-200 text-sm">
                        Target 10-15 reps. Designed for muscle growth and &apos;the pump.&apos; Shorter rest (60-90s) keeps blood in the muscle and increases fatigue.
                    </p>
                </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default IntensityInfoModal;
