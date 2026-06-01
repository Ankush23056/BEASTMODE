import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { LightningIcon } from './icons';
import { getTodayDateString } from '../utils/dateUtils';

const PowerStrand = ({ history, currentLog, sessionState, splits, schedule }) => {
    // 1. Get current week's Monday-Sunday dates
    const weekDays = useMemo(() => {
        const curr = new Date();
        // Calculate Monday by subtracting (dayOfWeek - 1)
        const d = new Date(curr);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
        const mondayDate = new Date(d.setDate(diff));
        
        const days = [];
        for (let i = 0; i < 7; i++) {
            const temp = new Date(mondayDate);
            temp.setDate(mondayDate.getDate() + i);
            
            // Use local date formatting to match getTodayDateString and log.date
            const year = temp.getFullYear();
            const month = String(temp.getMonth() + 1).padStart(2, '0');
            const dateDay = String(temp.getDate()).padStart(2, '0');
            days.push(`${year}-${month}-${dateDay}`);
        }
        return days;
    }, []);

    // Merge history with current log if needed
    const fullHistory = useMemo(() => {
        const safeHistory = Array.isArray(history) ? history : [];
        if (currentLog && currentLog.date) {
            const exists = safeHistory.some(h => h.date === currentLog.date);
            if (!exists) {
                const hasData = Object.keys(currentLog.performance || {}).length > 0;
                if (hasData) return [...safeHistory, currentLog];
            }
        }
        return safeHistory;
    }, [history, currentLog]);

    // Helper to check if a log is complete based on the schedule
    const isLogComplete = (log) => {
        if (!log) return false;
        
        const dayOfWeek = new Date(log.date).getUTCDay();
        const splitId = log.splitId || schedule[dayOfWeek];
        
        if (!splitId) return Object.keys(log.performance).length > 0;

        const split = splits.find(s => s.id === splitId);
        if (!split) return Object.keys(log.performance).length > 0;

        const performedIds = Object.keys(log.performance);
        
        return split.exercises.every(ex => {
            if (performedIds.includes(ex.id)) return true;
            const override = log.overrides?.[ex.id];
            if (override && performedIds.includes(override.id)) return true;
            return false;
        });
    };

    // 2. Determine status for each day
    const dayStatus = useMemo(() => {
        // Find max volume in history to determine PR
        const maxVolume = (Array.isArray(fullHistory) ? fullHistory : []).reduce(
            (max, log) => Math.max(max, log?.totalVolume || 0),
            0
        );
        const today = getTodayDateString();

        return weekDays.map(dateStr => {
            const log = fullHistory.find(h => h.date === dateStr);
            
            let isCompleted = false;
            
            if (dateStr === today) {
                isCompleted = sessionState === 'complete';
            } else {
                isCompleted = !!log && isLogComplete(log);
            }

            const isPR = isCompleted && (log?.totalVolume || 0) >= maxVolume && maxVolume > 0;

            return { date: dateStr, isCompleted, isPR };
        });
    }, [weekDays, fullHistory, sessionState, splits, schedule]);

    const dayLabels = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

    return (
        <div className="w-full py-8 px-2">
            <div className="relative flex items-center justify-between">
                {dayStatus.map((status, index) => {
                    const isLast = index === dayStatus.length - 1;
                    const nextStatus = !isLast ? dayStatus[index + 1] : null;
                    
                    return (
                        <React.Fragment key={status.date}>
                            {/* Node */}
                            <div className="relative z-10 flex flex-col items-center gap-3">
                                <div className="relative">
                                    {/* PR Pulse Effect */}
                                    {status.isPR && (
                                        <motion.div
                                            initial={{ scale: 1, opacity: 0.5 }}
                                            animate={{ scale: 1.5, opacity: 0 }}
                                            transition={{ duration: 1.5, repeat: Infinity }}
                                            className="absolute inset-0 rounded-full border-2 border-[#FF8C00]"
                                        />
                                    )}

                                    {/* The Node Itself */}
                                    <motion.div
                                        initial={false}
                                        animate={{
                                            backgroundColor: status.isCompleted ? '#99ff00' : 'transparent',
                                            boxShadow: status.isCompleted ? '0 0 15px #99ff00' : 'none',
                                            borderColor: status.isCompleted ? '#99ff00' : '#333',
                                        }}
                                        className={`w-4 h-4 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${!status.isCompleted ? 'border-opacity-50' : ''}`}
                                    >
                                        {status.isPR && (
                                            <LightningIcon className="w-3 h-3 text-[#FF8C00] fill-[#FF8C00] drop-shadow-[0_0_5px_rgba(255,140,0,0.8)]" />
                                        )}
                                    </motion.div>
                                </div>
                                
                                {/* Label */}
                                <span className="text-[10px] font-bold font-mono text-content-200 uppercase tracking-wider">
                                    {dayLabels[index]}
                                </span>
                            </div>

                            {/* Connecting Line (to the next node) */}
                            {!isLast && (
                                <div className="flex-grow h-[2px] mx-1 sm:mx-2 relative bg-[#333] bg-opacity-50 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: '0%' }}
                                        animate={{ width: nextStatus?.isCompleted ? '100%' : '0%' }}
                                        transition={{ duration: 0.5, delay: 0.2 }}
                                        className="absolute top-0 left-0 h-full bg-[#99ff00] shadow-[0_0_10px_#99ff00]"
                                    />
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};

export default PowerStrand;
