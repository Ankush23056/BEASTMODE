import React, { useEffect, useState, useRef } from 'react';
import { motion, LayoutGroup } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useWorkoutStore } from '../store/useWorkoutStore';
import ExerciseItem from './ExerciseItem';
import { getProgressiveOverloadSuggestion } from '../utils/progressiveOverload';
import { usePrevious } from '../hooks/usePrevious';
import RecoveryDashboard from './RecoveryDashboard';
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

const getTodayDayName = () => {
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    return days[new Date().getDay()];
}

const processSplitName = (name) => {
    const parts = name.split(' / ');
    return parts.map((part, index) => (
        <React.Fragment key={index}>
            {part.toUpperCase()}
            {index < parts.length - 1 && <span className="text-brand-primary font-normal"> & </span>}
        </React.Fragment>
    ));
};

const Chronometer = ({ startTime, totalElapsed, state }) => {
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

const WorkoutView = ({ split, log, onInitiateSubstitution }) => {
  const { setWorkoutCompleteModalOpen, completedExercises, userMetrics, sessionState, totalElapsedSeconds, sessionStartTime, setActiveView } = useWorkoutStore(s => ({
    setWorkoutCompleteModalOpen: s.setWorkoutCompleteModalOpen,
    completedExercises: s.completedExercises,
    userMetrics: s.userMetrics,
    sessionState: s.sessionState,
    totalElapsedSeconds: s.totalElapsedSeconds,
    sessionStartTime: s.sessionStartTime,
    setActiveView: s.setActiveView,
  }));
  const [isCelebrationDone, setIsCelebrationDone] = useState(false);
  const exerciseRefs = useRef({});
  const [focusTarget, setFocusTarget] = useState(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const { isTimerActive, postTimerAction, clearPostTimerAction, importSplitToSession } = useWorkoutStore(s => ({
      isTimerActive: s.isTimerActive,
      postTimerAction: s.postTimerAction,
      clearPostTimerAction: s.clearPostTimerAction,
      importSplitToSession: s.importSplitToSession,
  }));
  const prevIsTimerActive = usePrevious(isTimerActive);
  
  const allExercisesCompleted = split ? split.exercises.length > 0 && completedExercises.length === split.exercises.length : false;
  const incompleteExercises = split ? split.exercises.filter(ex => !completedExercises.includes(ex.id)) : [];

  useEffect(() => {
    if (allExercisesCompleted && !isCelebrationDone) {
      triggerConfetti();
      setWorkoutCompleteModalOpen(true);
      setIsCelebrationDone(true);
    }
    if (!allExercisesCompleted && isCelebrationDone) {
      setIsCelebrationDone(false);
    }
  }, [allExercisesCompleted, isCelebrationDone, setWorkoutCompleteModalOpen]);

  useEffect(() => {
    if (prevIsTimerActive && !isTimerActive && postTimerAction) {
        if (postTimerAction.type === 'FOCUS') {
            setFocusTarget({
                exerciseId: postTimerAction.payload.exerciseId,
                setIndex: postTimerAction.payload.nextSetIndex,
            });
            // Auto-clear focus target to allow re-focusing on the same element later
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

  const isRestDay = !split;
  const progress = split ? (split.exercises.length > 0 ? (completedExercises.length / split.exercises.length) * 100 : 0) : 0;
  
  // Group exercises into blocks (single or superset)
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

  const completedBlocks = blocks.filter(b => b.every(ex => completedExercises.includes(ex.id)));
  const incompleteBlocks = blocks.filter(b => !b.every(ex => completedExercises.includes(ex.id)));

  const incompleteExercisesRender = incompleteBlocks.map((block, blockIndex) => {
      const isActiveBlock = blockIndex === 0;
      return (
          <div key={`block-${block[0].id}`} className={`space-y-0 ${block.length > 1 ? 'border-2 border-[#99ff00] rounded-2xl overflow-hidden shadow-[0_0_15px_rgba(153,255,0,0.15)] mb-6 relative' : 'mb-3'}`}>
              {block.length > 1 && <div className="bg-[#99ff00]/10 text-[#99ff00] text-[10px] font-bold tracking-widest uppercase px-3 py-1 flex items-center justify-between border-b border-[#99ff00]/20"><span>SUPERSET BLOCK</span></div>}
              {block.map((exercise, exIndex) => {
                  const finalExercise = log?.overrides?.[exercise.id] ?? exercise;
                  const isCompleted = completedExercises.includes(exercise.id);
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
          <div key={`block-${block[0].id}`} className={`space-y-0 ${block.length > 1 ? 'border border-white/10 rounded-2xl overflow-hidden mb-6' : 'mb-3'}`}>
              {block.map((exercise, exIndex) => {
                  const finalExercise = log?.overrides?.[exercise.id] ?? exercise;
                  return (
                      <div key={finalExercise.id} ref={el => (exerciseRefs.current[exercise.id] = el)} className={block.length > 1 && exIndex < block.length - 1 ? 'border-b border-white/5' : ''}>
                        <ExerciseItem 
                          exercise={finalExercise}
                          originalExerciseId={exercise.id}
                          isCompleted={true}
                          performanceLog={log?.performance[exercise.id]}
                          onInitiateSubstitution={() => {}}
                        />
                      </div>
                  );
              })}
          </div>
      );
  });

  const dayName = getTodayDayName();
  
  let statusText = isRestDay ? 'RECOVERY MODE' : 'IDLE';
  let statusDotColor = 'bg-content-200';
  let showPing = false;
  let showPulse = false;

  if (sessionState === 'performing') {
      statusText = 'PERFORMING';
      statusDotColor = 'bg-brand-primary';
      showPing = true;
      showPulse = true;
  } else if (sessionState === 'paused') {
      statusText = 'AUTO-PAUSED';
      statusDotColor = 'bg-orange-500';
      showPing = false;
      showPulse = true;
  } else if (sessionState === 'complete') {
      statusText = 'COMPLETE';
      statusDotColor = 'bg-green-500';
      showPing = false;
      showPulse = true;
  }

  const getDynamicFontSize = (text) => {
      const len = text.length;
      if (len <= 6) return '18vw'; // MONDAY, FRIDAY, SUNDAY
      if (len <= 7) return '15vw'; // TUESDAY
      if (len <= 8) return '13vw'; // THURSDAY, SATURDAY
      return '11.5vw'; // WEDNESDAY
  };

  const dynamicSize = getDynamicFontSize(dayName);

  return (
    <div className={isRestDay ? 'rest-day-theme' : ''}>
      <header className="relative p-4 md:px-6 lg:px-8 h-48 flex flex-col justify-center overflow-hidden">
        {/* Status Indicator */}
        <div className="absolute top-4 left-4 flex items-center gap-2 text-content-200 text-xs font-mono uppercase tracking-widest z-10">
            <div className="relative flex h-3 w-3">
                {showPing && <div className={`animate-ping absolute inline-flex h-full w-full rounded-full ${statusDotColor} opacity-75`}></div>}
                <div className={`relative inline-flex rounded-full h-3 w-3 ${statusDotColor} ${showPulse ? 'animate-pulse' : ''}`}></div>
            </div>
            <span>STATUS: {statusText}</span>
            <Chronometer startTime={sessionStartTime} totalElapsed={totalElapsedSeconds} state={sessionState} />
            
            {(sessionState === 'performing' || sessionState === 'paused') && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        if (sessionState === 'performing') {
                            useWorkoutStore.getState().pauseSession();
                        } else {
                            useWorkoutStore.getState().startSession();
                        }
                    }}
                    className={`ml-2 px-2 py-0.5 rounded text-[10px] font-mono tracking-widest border transition-all duration-300 ${
                        sessionState === 'performing' 
                            ? 'border-[#99ff00] text-[#99ff00] hover:bg-[#99ff00]/10' 
                            : 'border-[#FF8C00] text-[#FF8C00] animate-pulse hover:bg-[#FF8C00]/10'
                    }`}
                >
                    {sessionState === 'performing' ? 'PAUSE' : 'RESUME'}
                </button>
            )}
        </div>

        {/* Title Stack */}
        <div className="relative flex items-center justify-center -mt-4 pointer-events-none w-[calc(100%+1rem)] -ml-2">
            {isRestDay ? (
                 <h2 
                    className="w-full text-center font-orbitron font-bold text-xl md:text-3xl tracking-wider text-content-100"
                >
                    RECOVERY
                </h2>
            ) : (
                <>
                     <h1
                        aria-hidden="true"
                        className="font-orbitron font-black text-[length:var(--day-font-size)] sm:text-8xl md:text-9xl text-transparent select-none text-center w-full whitespace-nowrap"
                        style={{
                            WebkitTextStroke: '1.5px var(--color-base-300)',
                            fill: 'transparent',
                            letterSpacing: '0.02em',
                            '--day-font-size': dynamicSize,
                        }}
                    >
                        {dayName}
                    </h1>
                    <h2 
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center font-orbitron font-bold text-xl md:text-3xl tracking-wider text-content-100"
                        style={{ WebkitTextStroke: '0.5px rgba(255, 255, 255, 0.2)' }}
                    >
                        {processSplitName(split.name)}
                    </h2>
                </>
            )}
        </div>

        {/* HUD Progress Bar */}
        {!isRestDay && (
            <div className="absolute bottom-6 left-4 right-4">
                <div className="w-full bg-content-100/10 h-1 rounded-full">
                    <motion.div 
                        className="h-1 rounded-full bg-brand-primary"
                        initial={{ width: '0%' }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5, ease: 'easeInOut' }}
                        style={{
                            boxShadow: '0 0 8px var(--color-brand-primary)'
                        }}
                    />
                </div>
            </div>
        )}

        <div className="border-t border-base-300 absolute bottom-0 left-0 right-0"></div>
      </header>

      <main className="px-4 md:px-6 lg:px-8 pb-4">
        {isRestDay ? (
            <RecoveryDashboard />
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
            </LayoutGroup>
        )}
      </main>

      <SplitSelectionModal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)} 
        onSelectSplit={(splitId) => {
            if (splitId) {
                importSplitToSession(splitId);
            }
            setIsImportModalOpen(false);
        }} 
      />
    </div>
  );
};

export default WorkoutView;
