import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FlameIcon, ShareIcon, CheckIcon } from './icons';
import { useWorkoutStore } from '../store/useWorkoutStore';

const modalVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 25 } },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
};

const formatDuration = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h > 0 ? `${h}h ` : ''}${m}m ${s}s`;
};

const WorkoutCompleteModal = ({ isOpen, onClose, streak, duration, volume }) => {
    const { setActiveView } = useWorkoutStore(s => ({ setActiveView: s.setActiveView }));

    const handleShare = async () => {
        const durationText = formatDuration(duration);
        const shareData = {
            title: 'BEASTMODE Workout Complete!',
            text: `Just crushed my workout! \nDuration: ${durationText}\nVolume: ${volume.toLocaleString()} kg\nStreak: ${streak + 1} days! 🔥 #beastmode #fitness`,
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                alert('Share feature is not supported on this browser.');
            }
        } catch (error) {
            // User cancelled share or share failed — do not throw
        }
    };

    // Close and immediately navigate to Progress tab (zero-delay sync)
    const handleClose = () => {
        onClose();
        setActiveView('progress');
    };

  return (
    <AnimatePresence>
        {isOpen && (
            <motion.div
              className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="bg-white text-black border border-gray-200 rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center"
              >
                <div className="w-20 h-20 bg-[#ccff00] rounded-full mx-auto flex items-center justify-center -mt-20 border-4 border-white shadow-lg">
                    <CheckIcon className="w-10 h-10 text-black" />
                </div>
                
                <h2 className="text-3xl font-bold mt-6 font-orbitron text-black">Workout Complete!</h2>
                <p className="text-gray-500 mt-2 text-sm">Awesome session. You&apos;re one step closer to your goals.</p>
 
                <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="bg-gray-100 rounded-2xl p-4 flex flex-col items-center justify-center border border-gray-200">
                        <p className="text-2xl font-bold font-mono text-black">{formatDuration(duration)}</p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Duration</p>
                    </div>
                    <div className="bg-gray-100 rounded-2xl p-4 flex flex-col items-center justify-center border border-gray-200">
                        <p className="text-2xl font-bold font-mono text-black">{volume.toLocaleString()}</p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Volume (kg)</p>
                    </div>
                </div>

                <div className="bg-gray-100 rounded-2xl p-4 mt-4 flex items-center justify-center gap-4 border border-gray-200">
                    <FlameIcon className="w-8 h-8 text-[#FF8C00]" />
                    <div className="text-left">
                        <p className="text-2xl font-bold font-mono text-black leading-none">{streak + 1} <span className="text-sm font-sans font-normal text-gray-500">days</span></p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">Streak</p>
                    </div>
                </div>

                <div className="flex flex-col gap-3 mt-8">
                     <button onClick={handleShare} className="w-full flex items-center justify-center gap-2 bg-black hover:bg-gray-800 text-[#ccff00] font-bold py-4 px-4 rounded-xl transition-all hover:scale-[1.02] shadow-lg">
                        <ShareIcon className="w-5 h-5" />
                        <span className="uppercase tracking-wider text-sm">Share Progress</span>
                    </button>
                    <button onClick={handleClose} className="w-full bg-gray-100 hover:bg-gray-200 text-black font-bold py-4 px-4 rounded-xl transition-all hover:scale-[1.02] border border-gray-200">
                        <span className="uppercase tracking-wider text-sm">View My Progress</span>
                    </button>
                </div>

              </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
  );
};

export default WorkoutCompleteModal;
