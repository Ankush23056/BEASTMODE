import React from 'react';
import { motion } from 'framer-motion';
import { weeklySchedule } from '../data/workoutData';
import { XIcon } from './icons';
import { useWorkoutStore } from '../store/useWorkoutStore';

const ConsistencyCalendar = () => {
    const { metrics, splits } = useWorkoutStore(s => ({
        metrics: s.userMetrics,
        splits: s.workoutSplits,
    }));

    const workoutLogs = React.useMemo(() => {
        return (metrics?.workoutHistory || []).reduce((acc, log) => {
            const logDate = new Date(log.date + 'T00:00:00');
            const dayOfWeek = logDate.getDay();
            const splitId = log.splitId || weeklySchedule[dayOfWeek];
            const split = splits.find(s => s.id === splitId);

            let allDone = false;
            const perfKeys = Object.keys(log.performance || {});

            if (split && split.exercises.length > 0) {
                allDone = perfKeys.length >= split.exercises.length;
            } else {
                allDone = perfKeys.length > 0;
            }
            
            acc[log.date] = { completed: allDone };
            return acc;
        }, {});
    }, [metrics?.workoutHistory, splits]);

    const targetDate = new Date();
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth();
    const today = targetDate.getDate();

    const monthName = targetDate.toLocaleString('default', { month: 'long' }).toUpperCase();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    
    const startOffset = (firstDayOfMonth === 0) ? 6 : firstDayOfMonth - 1;

    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const renderDayCell = (day) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const isToday = day === today && month === new Date().getMonth() && year === new Date().getFullYear();
        const isFuture = new Date(year, month, day) > new Date();

        let status = 'missed';
        let isTodayCompleted = false;
        
        if (isToday) {
            const log = workoutLogs[dateStr];
            if (log && log.completed) {
                status = 'completed';
                isTodayCompleted = true;
            } else {
                status = 'today';
            }
        } else if (isFuture) {
            status = 'future';
        } else {
            const log = workoutLogs[dateStr];
            status = log && log.completed ? 'completed' : 'missed';
        }
        
        const cellClasses = [
            'relative w-10 h-10 flex flex-col items-center justify-center rounded-full text-sm font-bold',
            status === 'future' && 'opacity-30',
            status === 'today' && 'border-2 border-brand-primary',
            status === 'completed' && 'bg-brand-primary text-base-100',
        ].filter(Boolean).join(' ');

        const cellStyle = status === 'today' ? {
            boxShadow: '0 0 10px var(--color-brand-primary)'
        } : {};

        if (status === 'completed') {
            return (
                <motion.div 
                    key={day} 
                    className={cellClasses}
                    initial={isTodayCompleted ? { scale: 0.5, opacity: 0 } : false}
                    animate={isTodayCompleted ? { scale: 1, opacity: 1 } : false}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                    <span>{day}</span>
                </motion.div>
            );
        }

        return (
            <div key={day} className={cellClasses} style={cellStyle}>
                <span>{day}</span>
                {status === 'missed' && <XIcon className="w-6 h-6 text-brand-orange/50 absolute" />}
            </div>
        );
    };

    return (
        <div className="w-full max-w-sm mx-auto">
            <h2 className="text-2xl font-bold text-brand-primary text-center tracking-wider mb-4">{monthName}</h2>
            <div className="grid grid-cols-7 gap-y-2">
                {dayLabels.map(label => (
                    <div key={label} className="text-xs text-content-200 text-center font-semibold">
                        {label}
                    </div>
                ))}

                {Array.from({ length: startOffset }).map((_, i) => <div key={`empty-${i}`} />)}
                
                {Array.from({ length: daysInMonth }, (_, i) => renderDayCell(i + 1))}
            </div>
        </div>
    );
};

export default ConsistencyCalendar;
