import React, { useEffect, useState, useRef } from 'react';
import { motion, LayoutGroup } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useWorkoutStore } from '../store/useWorkoutStore';
import ExerciseItem from './ExerciseItem';
import { getProgressiveOverloadSuggestion } from '../utils/progressiveOverload';
import { usePrevious } from '../hooks/usePrevious';
import SplitSelectionModal from './SplitSelectionModal';

const triggerConfetti = () => {
  const duration = 3 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };
  const colors = ['var(--color-brand-primary)', '#FFFFFF', '#94a3b8'];

  const randomInRange = (min, max) => Math.random() * (max - min) + min;

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();
    if (timeLeft <= 0) return clearInterval(interval);
    
    const particleCount = 50 * (timeLeft / duration);
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }, colors });
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }, colors });
  }, 250);
};

const TempChronometer = ({ startTime, totalElapsed, state }) => {
    const [displayTime, setDisplayTime] = useState('00:00:00');

    useEffect(() => {
        let intervalId;

        const formatTime = (seconds) => {
            const h = Math.floor(seconds / 3600);
            const m = Math.floor((seconds % 3600) / 60);
            const s = Math.floor(seconds % 60);
            return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        };

        const updateTime = () => {
            if (state === 'performing' && startTime) {
                const currentElapsed = totalElapsed + (Date.now() - startTime) / 1000;
                setDisplayTime(formatTime(currentElapsed));
            } else {
                setDisplayTime(formatTime(totalElapsed));
            }
        };

        updateTime();

        if (state === 'performing') {
            intervalId = window.setInterval(updateTime, 1000);
        }

        return () => clearInterval(intervalId);
    }, [startTime, totalElapsed, state]);
    
    if (state === 'idle' && totalElapsed === 0) return null;

    return (
        <>
            <span className="text-content-200/50">|</span>
            <span>ELAPSED: {displayTime}</span>
        </>
    );
};

const TemporaryDayView = ({ onInitiateSubstitution }) => {
  const { 
    tempSplit, 
    tempDailyLog, 
    tempCompletedExercises, 
    tempSessionState, 
    tempSessionStartTime, 
    tempTotalElapsedSeconds,
    userMetrics,
    importSplitToTempSession,
    startTempSession,
    pauseTempSession,
    completeTempSession,
    setActiveView
  } = useWorkoutStore();

  const [isCelebrationDone, setIsCelebrationDone] = useState(false);
  const exerciseRefs = useRef({});
  const [focusTarget, setFocusTarget] = useState(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const { isTimerActive, postTimerAction, clearPostTimerAction } = useWorkoutStore(s => ({
      isTimerActive: s.isTimerActive,
      postTimerAction: s.postTimerAction,
      clearPostTimerAction: s.clearPostTimerAction,
  }));
  const prevIsTimerActive = usePrevious(isTimerActive);
  
  const allExercisesCompleted = tempSplit ? tempSplit.exercises.length > 0 && tempCompletedExercises.length === tempSplit.exercises.length : false;
  const incompleteExercises = tempSplit ? tempSplit.exercises.filter(ex => !tempCompletedExercises.includes(ex.id)) : [];

  useEffect(() => {
    if (allExercisesCompleted && !isCelebrationDone) {
      triggerConfetti();
      setIsCelebrationDone(true);
    }
    if (!allExercisesCompleted && isCelebrationDone) {
      setIsCelebrationDone(false);
    }
  }, [allExercisesCompleted, isCelebrationDone]);

  useEffect(() => {
    if (prevIsTimerActive && !isTimerActive && postTimerAction) {
        if (postTimerAction.type === 'FOCUS') {
            setFocusTarget({
                exerciseId: postTimerAction.payload.exerciseId,
                setIndex: postTimerAction.payload.nextSetIndex,
            });
            setTimeout(() => setFocusTarget(null), 100);
        } else if (postTimerAction.type === 'SCROLL') {
            const currentId = postTimerAction.payload.currentExerciseId;
            const currentIndex = incompleteExercises.findIndex(ex => ex.id === currentId);
            if (currentIndex > -1 && currentIndex + 1 < incompleteExercises.length) {
                const nextExerciseId = incompleteExercises[currentIndex + 1].id;
                exerciseRefs.current[nextExerciseId]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
        clearPostTimerAction();
    }
  }, [isTimerActive, prevIsTimerActive, postTimerAction, clearPostTimerAction, incompleteExercises]);

  const progress = tempSplit ? (tempSplit.exercises.length > 0 ? (tempCompletedExercises.length / tempSplit.exercises.length) * 100 : 0) : 0;
  
  // Group exercises into blocks (superset vs single)
  const blocks = [];
  if (tempSplit) {
      const exerciseMap = new Map(tempSplit.exercises.map(ex => [ex.id, ex]));
      const visited = new Set();
      
      for (const ex of tempSplit.exercises) {
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

  const completedBlocks = blocks.filter(b => b.every(ex => tempCompletedExercises.includes(ex.id)));
  const incompleteBlocks = blocks.filter(b => !b.every(ex => tempCompletedExercises.includes(ex.id)));

  const incompleteExercisesRender = incompleteBlocks.map((block, blockIndex) => {
      const isActiveBlock = blockIndex === 0;
      return (
          <div key={`temp-block-${block[0].id}`} className={`space-y-0 ${block.length > 1 ? 'border-2 border-[#99ff00] rounded-2xl overflow-hidden shadow-[0_0_15px_rgba(153,255,0,0.15)] mb-6 relative' : 'mb-3'}`}>
              {block.length > 1 && <div className="bg-[#99ff00]/10 text-[#99ff00] text-[10px] font-bold tracking-widest uppercase px-3 py-1 flex items-center justify-between border-b border-[#99ff00]/20"><span>SUPERSET BLOCK</span></div>}
              {block.map((exercise, exIndex) => {
                  const finalExercise = tempDailyLog?.overrides?.[exercise.id] ?? exercise;
                  const isCompleted = tempCompletedExercises.includes(exercise.id);
                  return (
                      <div key={finalExercise.id} ref={el => (exerciseRefs.current[exercise.id] = el)} className={block.length > 1 && exIndex < block.length - 1 ? 'border-b border-[#99ff00]/20' : ''}>
                          <ExerciseItem 
                            exercise={finalExercise}
                            originalExerciseId={exercise.id}
                            isCompleted={isCompleted}
                            onInitiateSubstitution={() => onInitiateSubstitution(exercise)}
                            suggestion={getProgressiveOverloadSuggestion(exercise.id, userMetrics.workoutHistory)}
                            focusSetIndex={focusTarget?.exerciseId === exercise.id ? focusTarget.setIndex : null}
                            isActive={isActiveBlock}
                          />
                      </div>
                  );
              })}
          </div>
      );
  });

  const completedExercisesRender = completedBlocks.map(block => {
      return (
          <div key={`temp-block-done-${block[0].id}`} className={`space-y-0 ${block.length > 1 ? 'border border-white/10 rounded-2xl overflow-hidden mb-6' : 'mb-3'}`}>
              {block.map((exercise, exIndex) => {
                  const finalExercise = tempDailyLog?.overrides?.[exercise.id] ?? exercise;
                  return (
                      <div key={finalExercise.id} ref={el => (exerciseRefs.current[exercise.id] = el)} className={block.length > 1 && exIndex < block.length - 1 ? 'border-b border-white/5' : ''}>
                        <ExerciseItem 
                          exercise={finalExercise}
                          originalExerciseId={exercise.id}
                          isCompleted={true}
                          performanceLog={tempDailyLog?.performance[exercise.id]}
                          onInitiateSubstitution={() => {}}
                        />
                      </div>
                  );
              })}
          </div>
      );
  });

  let statusText = 'SANDBOX';
  let statusDotColor = 'bg-teal-400';
  let showPing = false;
  let showPulse = false;

  if (tempSessionState === 'performing') {
      statusText = 'SANDBOX_PERFORMING';
      statusDotColor = 'bg-brand-primary';
      showPing = true;
      showPulse = true;
  } else if (tempSessionState === 'paused') {
      statusText = 'SANDBOX_PAUSED';
      statusDotColor = 'bg-orange-500';
      showPing = false;
      showPulse = true;
  } else if (tempSessionState === 'complete') {
      statusText = 'SANDBOX_COMPLETE';
      statusDotColor = 'bg-green-500';
      showPing = false;
      showPulse = true;
  }

  return (
    <div className="min-h-screen bg-base-100/40 pb-20">
      <header className="relative p-4 md:px-6 lg:px-8 h-48 flex flex-col justify-center overflow-hidden border-b border-base-300 bg-base-100/60 backdrop-blur-md">
        {/* Top bar with back and import button */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
          <button 
             onClick={() => setActiveView('workout')}
             className="px-2.5 py-1 text-[10px] font-mono font-bold tracking-widest text-[#94a3b8] hover:text-white transition-colors"
          >
             &lt; MAIN WORKOUT
          </button>

          <button 
             onClick={() => setIsImportModalOpen(true)}
             className="px-3 py-1 rounded-lg text-xs font-orbitron font-bold tracking-widest border border-brand-primary text-brand-primary hover:bg-brand-primary/10 transition-colors bg-base-100/50 backdrop-blur"
          >
             IMPORT SPLIT
          </button>
        </div>

        {/* Status Indicator Bar */}
        <div className="absolute bottom-12 left-4 flex items-center gap-2 text-content-200 text-xs font-mono uppercase tracking-widest z-10">
            <div className="relative flex h-3 w-3">
                {showPing && <div className={`animate-ping absolute inline-flex h-full w-full rounded-full ${statusDotColor} opacity-75`}></div>}
                <div className={`relative inline-flex rounded-full h-3 w-3 ${statusDotColor} ${showPulse ? 'animate-pulse' : ''}`}></div>
            </div>
            <span>STATUS: {statusText}</span>
            <TempChronometer startTime={tempSessionStartTime} totalElapsed={tempTotalElapsedSeconds} state={tempSessionState} />
            
            {tempSplit && (tempSessionState === 'performing' || tempSessionState === 'paused') && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        if (tempSessionState === 'performing') {
                            pauseTempSession();
                        } else {
                            startTempSession();
                        }
                    }}
                    className={`ml-2 px-2 py-0.5 rounded text-[10px] font-mono tracking-widest border transition-all duration-300 ${
                        tempSessionState === 'performing' 
                            ? 'border-[#99ff00] text-[#99ff00] hover:bg-[#99ff00]/10' 
                            : 'border-[#FF8C00] text-[#FF8C00] animate-pulse hover:bg-[#FF8C00]/10'
                    }`}
                >
                    {tempSessionState === 'performing' ? 'PAUSE' : 'RESUME'}
                </button>
            )}
        </div>

        {/* Header Titles */}
        <div className="mt-8 text-center pointer-events-none">
            <h1 className="font-orbitron font-extrabold text-2xl tracking-widest text-brand-primary uppercase">
                {tempSplit ? tempSplit.name.replace(' [Ad-Hoc]', '') : 'SANDBOX SPACE'}
            </h1>
            <p className="text-xs text-content-200 uppercase tracking-widest mt-1">
                {tempSplit ? 'TEMPORARY DAY TRACKER' : 'TRACK AD-HOC LIFTS WITHOUT RE-PLANNING'}
            </p>
        </div>

        {/* PROGRESS BAR */}
        {tempSplit && (
            <div className="absolute bottom-0 left-0 right-0">
                <div className="w-full bg-content-100/5 h-1">
                    <motion.div 
                        className="h-1 bg-brand-primary"
                        initial={{ width: '0%' }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5, ease: 'easeInOut' }}
                        style={{ boxShadow: '0 0 8px var(--color-brand-primary)' }}
                    />
                </div>
            </div>
        )}
      </header>

      <main className="px-4 md:px-6 lg:px-8 pb-4">
        {!tempSplit ? (
            <div className="py-24 text-center max-w-sm mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center mx-auto mb-6">
                    <span className="text-brand-primary font-orbitron font-extrabold text-xl">DS</span>
                </div>
                <h3 className="text-lg font-bold text-content-100 font-orbitron mb-2 uppercase tracking-wide">Blank Sandbox Canvas</h3>
                <p className="text-sm text-content-200">
                    Import an existing weekly routine template to populate this sandbox tracking canvas.
                </p>
                <button
                    onClick={() => setIsImportModalOpen(true)}
                    className="mt-6 px-6 py-3 bg-brand-primary text-base-100 font-orbitron font-extrabold text-xs tracking-widest rounded-xl hover:scale-[1.02] transition-transform shadow-lg"
                >
                    IMPORT ROUTINE SPLIT
                </button>
            </div>
        ) : (
            <LayoutGroup>
                <motion.div layout className="pt-4">
                  {incompleteExercisesRender}
                </motion.div>
    
                {completedBlocks.length > 0 && (
                    <div className="mt-8">
                        <h3 className="text-md font-semibold text-content-200 mb-2 uppercase tracking-wider">Completed</h3>
                        <motion.div layout>
                            {completedExercisesRender}
                        </motion.div>
                    </div>
                )}

                {/* MANUAL COMPLETE ACTION button when active */}
                {(tempSessionState === 'performing' || tempSessionState === 'paused') && (
                    <div className="mt-8 text-center">
                        <button
                            onClick={() => {
                                if (window.confirm("Complete workout session and save tracked log directly to history?")) {
                                    completeTempSession();
                                }
                            }}
                            className="px-6 py-3 border-2 border-[#99ff00] text-[#99ff00] font-orbitron font-extrabold text-xs tracking-widest rounded-xl hover:bg-[#99ff00]/10 hover:scale-[1.02] transition-all"
                        >
                            COMPLETE WORKOUT SESSION
                        </button>
                    </div>
                )}
            </LayoutGroup>
        )}
      </main>

      <SplitSelectionModal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)} 
        onSelectSplit={(splitId) => {
            if (splitId) {
                importSplitToTempSession(splitId);
            }
            setIsImportModalOpen(false);
        }} 
      />
    </div>
  );
};

export default TemporaryDayView;
