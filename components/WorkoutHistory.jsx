import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HistoryIcon, ChevronRightIcon } from './icons';
import { useWorkoutStore } from '../store/useWorkoutStore';

const LogItem = ({ log, splits }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const { exerciseNotes, saveExerciseNote, liveWeeklySchedule } = useWorkoutStore(s => ({
        exerciseNotes: s.userMetrics.exerciseNotes || {},
        saveExerciseNote: s.saveExerciseNote,
        liveWeeklySchedule: s.weeklySchedule,
    }));

    const logDate = new Date(log.date + 'T00:00:00'); // Ensure date is parsed in local timezone
    const dayOfWeek = logDate.getDay();
    const scheduledSplitId = liveWeeklySchedule[dayOfWeek];
    const splitId = log.splitId || scheduledSplitId;
    const split = splits?.find(s => s.id === splitId);

    const formatDuration = (seconds) => {
        if (!seconds) return null;
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        
        if (hours > 0) {
            return `${hours}h ${remainingMinutes}m`;
        }
        return `${minutes}m`;
    };

    const durationString = formatDuration(log.sessionDuration);

    return (
        <div className="bg-base-200 rounded-2xl border border-base-300 overflow-hidden mb-3">
            <button onClick={() => setIsExpanded(!isExpanded)} className="w-full flex items-center justify-between p-4 text-left hover:bg-base-300/50 transition-colors">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <p className="font-bold text-content-100 capitalize">
                            {logDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                        </p>
                        {durationString && (
                            <span className="text-xs font-mono font-medium text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded-md border border-brand-primary/20">
                                {durationString}
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-content-200">{split?.name || 'Workout Session'}</p>
                </div>
                <ChevronRightIcon className={`w-5 h-5 text-content-200 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
            </button>
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-4 pb-4"
                    >
                        <div className="border-t border-base-300 pt-4 space-y-3">
                            {(() => {
                                const blocks = [];
                                if (split) {
                                    const exerciseMap = new Map(split.exercises.map(ex => [ex.id, ex]));
                                    const visited = new Set();
                                    
                                    for (const ex of split.exercises) {
                                        if (visited.has(ex.id)) continue;
                                        const block = [ex];
                                        visited.add(ex.id);
                                        let curr = ex;
                                        while (curr.supersetWith) {
                                            const next = exerciseMap.get(curr.supersetWith);
                                            if (next && !visited.has(next.id)) {
                                                block.push(next);
                                                visited.add(next.id);
                                                curr = next;
                                            } else break;
                                        }
                                        blocks.push(block);
                                    }
                                }

                                return blocks.map((block, blockIdx) => {
                                    // Make sure at least one exercise in the block has performance data recorded
                                    const hasData = block.some(ex => log.performance[ex.id]);
                                    if (!hasData) return null;

                                    return (
                                        <div key={blockIdx} className={`space-y-4 ${block.length > 1 ? 'border border-[#99ff00]/30 rounded-xl p-3 bg-base-300/10' : ''}`}>
                                            {block.length > 1 && <div className="text-[10px] text-[#99ff00] font-mono font-bold tracking-widest uppercase mb-1">SUPERSET</div>}
                                            {block.map(ex => {
                                                const originalId = ex.id;
                                                const displayedExercise = log.overrides?.[originalId] || ex;
                                                const perf = log.performance[originalId];
                                                
                                                if (!perf) return null;

                                                const note = exerciseNotes[originalId]?.text || '';
                                                const hasRealNote = note.trim() !== '' && note.trim() !== 'Note for next session...';

                                                return (
                                                    <div key={originalId} className="text-sm">
                                                        <p className="font-semibold text-content-100 mb-1">{displayedExercise.name}</p>
                                                        <div className="pl-2 text-content-200 mb-1">
                                                            {(perf?.sets || []).map((s, i) => {
                                                                if (!s) return null;
                                                                const dt = s.dropSets?.[0];
                                                                return (
                                                                    <span key={i} className="mr-3 inline-block">
                                                                        {s.weight}kg x {s.reps}
                                                                        {dt && <span className="text-[#FF8C00]"> (+ {dt.weight}kg x {dt.reps} DS)</span>}
                                                                    </span>
                                                                );
                                                            })}
                                                        </div>
                                                        {hasRealNote && (
                                                            <p className="pl-2 text-xs text-content-200 font-mono mt-0.5">
                                                                → {note}
                                                            </p>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                });
                            })()}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
};

const WorkoutHistory = ({ history, splits }) => {
    const sortedHistory = [...(history || [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return (
        <div>
            <h2 className="text-lg font-semibold text-content-200 mb-3 uppercase tracking-wider flex items-center gap-2">
                <HistoryIcon className="w-5 h-5" />
                Workout History
            </h2>
            {sortedHistory.length > 0 ? (
                <div className="space-y-3">
                    {sortedHistory.map((log, index) => (
                        <motion.div
                            key={`${log.date}-${log.splitId || index}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                            <LogItem log={log} splits={splits} />
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="text-center text-content-200 p-8 bg-base-200 rounded-2xl border border-base-300">
                    <p>Your completed workouts will appear here.</p>
                </div>
            )}
        </div>
    );
};

export default WorkoutHistory;
