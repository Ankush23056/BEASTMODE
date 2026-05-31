import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { exerciseAlternatives } from '../data/exerciseAlternatives';
import { XIcon, PlusCircleIcon } from './icons';

const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 }
};

const ExerciseSubstitutionModal = ({ isOpen, onClose, exercise, onSubstitute }) => {
  const alternatives = exerciseAlternatives[exercise.id] || exerciseAlternatives['default'];

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
            <h2 className="text-xl font-bold mb-1">Substitute Exercise</h2>
            <p className="text-content-200 mb-4">Swap <span className="font-semibold text-content-100">{exercise.name}</span> for...</p>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
                {alternatives.map((alt, index) => (
                    <button 
                        key={index}
                        onClick={() => onSubstitute(alt)}
                        className="w-full flex items-center justify-between text-left p-3 bg-base-300 hover:bg-opacity-80 rounded-lg transition-colors"
                    >
                        <div>
                            <p className="font-bold">{alt.name}</p>
                            <p className="text-xs text-content-200">{alt.sets} sets of {alt.reps} reps</p>
                        </div>
                        <PlusCircleIcon className="w-6 h-6 text-brand-primary" />
                    </button>
                ))}
            </div>

            <p className="text-xs text-content-200 mt-4 text-center">
                Our exercise alternatives are from a preset, expert-curated list to ensure you&apos;re targeting the same muscles effectively. We don&apos;t use AI for this feature.
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ExerciseSubstitutionModal;
