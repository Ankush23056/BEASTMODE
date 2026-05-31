import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useInitWorkoutData } from './hooks/useWorkoutData';
import { useWorkoutStore } from './store/useWorkoutStore';
import WorkoutView from './components/WorkoutView';
import TemporaryDayView from './components/TemporaryDayView';
import ProgressView from './components/StatsView';
import ScheduleView from './components/CalendarView';
import ProfileView from './components/ProfileView';
import RoutineEditorView from './components/RoutineEditorView';
import RestTimer from './components/RestTimer';
import MetricsModal from './components/MetricsModal';
import BottomNav from './components/BottomNav';
import MainHeader from './components/MainHeader';
import WorkoutCompleteModal from './components/WorkoutCompleteModal';
import ExerciseSubstitutionModal from './components/ExerciseSubstitutionModal';
import MissionStartOverlay from './components/MissionStartOverlay';
import { XIcon } from './components/icons';

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -10 },
};

const App = () => {
  useInitWorkoutData();

  const {
    isInitialized, todaySplit, userMetrics, activeView, isTimerActive, isModalOpen,
    dailyLog, isWorkoutCompleteModalOpen, timerDuration, timerTitle, timerKey,
    sessionState, lastSetLoggedTime, totalElapsedSeconds,
    setWorkoutCompleteModalOpen, setTimerActive, setModalOpen,
    addWeightEntry, addMeasurementEntry, substituteExercise, startSession, pauseSession,
  } = useWorkoutStore();

  const [subModalState, setSubModalState] = useState({ open: false, exercise: null });
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  // Inactivity timer effect
  useEffect(() => {
    let inactivityTimer;

    const checkInactivity = () => {
      if (sessionState === 'performing' && lastSetLoggedTime) {
        const minutesSinceLastSet = (Date.now() - lastSetLoggedTime) / (1000 * 60);
        if (minutesSinceLastSet >= 6) {
          pauseSession();
        }
      }
    };

    // Check immediately on mount/update
    checkInactivity();

    if (sessionState === 'performing' && lastSetLoggedTime) {
      inactivityTimer = setInterval(checkInactivity, 60000); // Check every minute
    }
    return () => clearInterval(inactivityTimer);
  }, [sessionState, lastSetLoggedTime, pauseSession]);

  // Effect to show the PWA install prompt once
  useEffect(() => {
    const hasSeenPrompt = localStorage.getItem('fitnessApp_installPromptSeen');
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);

    if (!hasSeenPrompt && !isStandalone && isMobile) {
        const timer = setTimeout(() => {
            setShowInstallPrompt(true);
            localStorage.setItem('fitnessApp_installPromptSeen', 'true');
        }, 3000);

        return () => clearTimeout(timer);
    }
  }, []);

  // Effect to auto-dismiss the install prompt
  useEffect(() => {
    if (showInstallPrompt) {
        const timer = setTimeout(() => {
            setShowInstallPrompt(false);
        }, 8000); // Auto-dismiss after 8 seconds

        return () => clearTimeout(timer);
    }
  }, [showInstallPrompt]);

  // Midnight Watcher: Automatically refresh data when the day changes
  useEffect(() => {
    const checkDayChange = () => {
      const now = new Date();
      const currentDateString = now.toLocaleDateString('en-CA'); // YYYY-MM-DD
      const storedDate = dailyLog?.date;

      if (storedDate && currentDateString !== storedDate) {
        // Day has changed, refresh the app state
        useWorkoutStore.getState().reInitialize();
      }
    };

    const midnightTimer = setInterval(checkDayChange, 60000); // Check every minute
    return () => clearInterval(midnightTimer);
  }, [dailyLog]);


  const handleTimerComplete = () => setTimerActive(false);
  const handleInitiateSubstitution = (exercise) => setSubModalState({ open: true, exercise });
  const handleCloseSubstitution = () => setSubModalState({ open: false, exercise: null });
  
  const handleSubstitute = (newExercise) => {
    if (subModalState.exercise) {
      if (activeView === 'temporary_day') {
        useWorkoutStore.getState().substituteExerciseTemp(subModalState.exercise.id, newExercise);
      } else {
        substituteExercise(subModalState.exercise.id, newExercise);
      }
    }
    handleCloseSubstitution();
  };

  const renderView = () => {
    switch(activeView) {
      case 'workout':
        return (
          <motion.div key="workout" initial="initial" animate="in" exit="out" variants={pageVariants}>
            <WorkoutView 
              split={todaySplit} 
              log={dailyLog}
              onInitiateSubstitution={handleInitiateSubstitution}
            />
          </motion.div>
        );
      case 'temporary_day':
        return (
          <motion.div key="temporary_day" initial="initial" animate="in" exit="out" variants={pageVariants}>
            <TemporaryDayView 
              onInitiateSubstitution={handleInitiateSubstitution}
            />
          </motion.div>
        );
      case 'progress':
        return (
          <motion.div key="progress" initial="initial" animate="in" exit="out" variants={pageVariants}>
            <ProgressView 
              metrics={userMetrics} 
              onAddMetric={() => setModalOpen(true)}
            />
          </motion.div>
        );
      case 'schedule':
        return (
          <motion.div key="schedule" initial="initial" animate="in" exit="out" variants={pageVariants}>
            <ScheduleView />
          </motion.div>
        );
      case 'profile':
        return (
          <motion.div key="profile" initial="initial" animate="in" exit="out" variants={pageVariants}>
            <ProfileView />
          </motion.div>
        );
      case 'routineEditor':
        return (
          <motion.div key="routineEditor" initial="initial" animate="in" exit="out" variants={pageVariants}>
            <RoutineEditorView />
          </motion.div>
        );
      default: 
        // Fallback to workout view if activeView is invalid
        return (
            <motion.div key="workout" initial="initial" animate="in" exit="out" variants={pageVariants}>
              <WorkoutView 
                split={todaySplit} 
                log={dailyLog}
                onInitiateSubstitution={handleInitiateSubstitution}
              />
            </motion.div>
        );
    }
  };
  
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-base-100 flex flex-col h-screen overflow-hidden">
        <MainHeader />
        <main className="flex-grow" />
      </div>
    );
  }

  const showOverlay = activeView === 'workout' && todaySplit && (sessionState === 'idle' || sessionState === 'paused');

  return (
    <div className="min-h-screen bg-base-100 font-sans text-content-100 flex flex-col h-screen overflow-hidden">
      <MainHeader />
      <main className="flex-grow overflow-y-auto pb-24 pt-16">
        <AnimatePresence>
          {renderView()}
        </AnimatePresence>
      </main>
      
      <BottomNav />
      
      <AnimatePresence>
        {showOverlay && todaySplit && (
          <MissionStartOverlay 
            split={todaySplit} 
            onStart={startSession} 
          />
        )}
      </AnimatePresence>
 
      <AnimatePresence>
        {showInstallPrompt && (
            <motion.div
                className="fixed bottom-24 left-1/2 -translate-x-1/2 w-11/12 max-w-md bg-base-300/95 backdrop-blur-sm text-content-100 p-3 rounded-xl shadow-lg flex items-center justify-between z-50 border border-base-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
                <p className="text-sm font-semibold pr-2">PRO-TIP: Add to Home Screen for the full App experience.</p>
                <button onClick={() => setShowInstallPrompt(false)} className="p-1 flex-shrink-0 text-content-200 hover:text-content-100">
                    <XIcon className="w-5 h-5" />
                </button>
            </motion.div>
        )}
      </AnimatePresence>

      {isTimerActive && <RestTimer key={timerKey} duration={timerDuration} title={timerTitle} onComplete={handleTimerComplete} onClose={() => setTimerActive(false)} />}
      <MetricsModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} onAddWeight={addWeightEntry} onAddMeasurement={addMeasurementEntry} />
      <WorkoutCompleteModal 
        isOpen={isWorkoutCompleteModalOpen} 
        onClose={() => setWorkoutCompleteModalOpen(false)} 
        streak={userMetrics.streak} 
        duration={totalElapsedSeconds}
        volume={dailyLog ? Object.values(dailyLog.performance || {}).reduce((acc, log) => acc + (log?.sets || []).reduce((setAcc, set) => {
            if (!set) return setAcc;
            let setVol = (Number(set.weight) || 0) * (Number(set.reps) || 0);
            if (set.dropSets) {
                setVol += (set.dropSets || []).reduce((dsAcc, ds) => dsAcc + (Number(ds?.weight) || 0) * (Number(ds?.reps) || 0), 0);
            }
            return setAcc + setVol;
        }, 0), 0) : 0}
      />
      {subModalState.exercise && <ExerciseSubstitutionModal isOpen={subModalState.open} onClose={handleCloseSubstitution} exercise={subModalState.exercise} onSubstitute={handleSubstitute} />}
    </div>
  );
};

export default App;
