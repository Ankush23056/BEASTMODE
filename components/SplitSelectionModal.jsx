import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWorkoutStore } from '../store/useWorkoutStore';
import { XIcon } from './icons';

const SplitSelectionModal = ({ isOpen, onClose, onSelectSplit }) => {
  const { workoutSplits } = useWorkoutStore();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 15, stiffness: 200 }}
            className="bg-base-200 rounded-2xl p-6 w-full max-w-md border border-base-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-content-100">Select a Workout</h2>
              <button onClick={onClose} className="p-1 rounded-full hover:bg-base-300">
                <XIcon className="w-6 h-6 text-content-200" />
              </button>
            </div>
            <div className="space-y-2">
              {workoutSplits.filter(split => split.id !== 'rest_day').map(split => (
                <button 
                  key={split.id} 
                  onClick={() => onSelectSplit(split.id)}
                  className="w-full text-left p-3 bg-base-100 rounded-lg hover:bg-base-300 transition-colors"
                >
                  {split.name}
                </button>
              ))}
              <button 
                onClick={() => onSelectSplit(null)}
                className="w-full text-left p-3 bg-base-100 rounded-lg hover:bg-base-300 transition-colors text-content-200"
              >
                Rest Day
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplitSelectionModal;
