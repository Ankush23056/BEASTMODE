import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import Header from './Header';
import { useWorkoutStore } from '../store/useWorkoutStore';
import { ChevronRightIcon } from './icons';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
    },
  },
};

const itemVariants = {
  hidden: { y: 10, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

const exerciseListVariants = {
    collapsed: { height: 0, opacity: 0, marginTop: 0 },
    expanded: { height: 'auto', opacity: 1, marginTop: '1rem' },
};

const ScheduleView = () => {
    const { weeklySchedule, workoutSplits, setActiveView } = useWorkoutStore(s => ({ 
        weeklySchedule: s.weeklySchedule, 
        workoutSplits: s.workoutSplits,
        setActiveView: s.setActiveView
    }));
        
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const todayIndex = new Date().getDay();
    const [expandedDay, setExpandedDay] = useState(null);

    return (
        <div>
            <Header title="Schedule" />
            <motion.main 
                className="p-4 md:px-6 lg:px-8 space-y-3 container mx-auto"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {daysOfWeek.map((day, index) => {
                    const splitId = weeklySchedule[index];
                    const split = workoutSplits.find(s => s.id === splitId);
                    const isToday = index === todayIndex;
                    const isExpanded = expandedDay === index;

                    return (
                        <motion.div
                            key={index}
                            variants={itemVariants}
                            layout
                            className={`p-4 rounded-2xl backdrop-blur-lg border transition-colors ${
                                isToday ? 'bg-brand-primary/20 border-brand-primary' : 'bg-base-200 border-base-300'
                            }`}
                        >
                             <button 
                                onClick={() => setExpandedDay(isExpanded ? null : index)}
                                className="w-full flex items-center justify-between text-left"
                             >
                                <div>
                                    <p className="font-bold text-content-100 text-md">
                                        <span className="uppercase">{day}</span>
                                        <span className="text-content-200 font-medium"> - </span>
                                        <span>{split ? split.name : 'Rest'}</span>
                                    </p>
                                    <p className="text-content-200 text-sm mt-1 uppercase tracking-wider">
                                        {split && split.exercises.length > 0
                                            ? `${split.exercises.length} EXERCISES`
                                            : 'RECOVERY & MOBILITY'
                                        }
                                    </p>
                                </div>
                                {split && split.exercises.length > 0 && (
                                    <ChevronRightIcon className={`w-5 h-5 text-content-200 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                                )}
                             </button>
                             <AnimatePresence>
                                {isExpanded && split && split.exercises.length > 0 && (
                                    <motion.div
                                        key="content"
                                        initial="collapsed"
                                        animate="expanded"
                                        exit="collapsed"
                                        variants={exerciseListVariants}
                                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                                        className="overflow-hidden"
                                    >
                                        <div className="border-t border-base-300/50 pt-4">
                                            <ul className="space-y-1">
                                                {split.exercises.map(ex => (
                                                    <li key={ex.id} className="text-content-200 text-sm pl-2">
                                                        - {ex.name}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </motion.div>
                                )}
                             </AnimatePresence>
                        </motion.div>
                    );
                })}
            </motion.main>
        </div>
    );
};

export default ScheduleView;
