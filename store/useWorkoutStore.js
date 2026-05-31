import { create } from 'zustand';
import { getTodayDateString } from '../utils/dateUtils';
import { getInitialWorkoutData } from '../utils/dataInitializer';
import { applyTheme, saveTheme } from '../utils/themeManager';

const DAILY_LOG_KEY = 'fitnessApp_dailyLog';
const USER_METRICS_KEY = 'fitnessApp_userMetrics';
const WORKOUT_SPLITS_KEY = 'fitnessApp_workoutSplits';
const SESSION_STATE_KEY = 'fitnessApp_sessionState';
const SESSION_START_TIME_KEY = 'fitnessApp_sessionStartTime';
const TOTAL_ELAPSED_KEY = 'fitnessApp_totalElapsedSeconds';
const BONUS_APPLIED_KEY = 'fitnessApp_bonusApplied';
const LAST_SET_LOGGED_TIME_KEY = 'fitnessApp_lastSetLoggedTime';

export const useWorkoutStore = create((set, get) => ({
  dailyLog: null,
  userMetrics: { streak: 0, lastCompletedDate: null, weight: [], measurements: [], workoutHistory: [], exerciseNotes: {} },
  todaySplit: null,
  workoutSplits: [],
  weeklySchedule: {},

  activeView: 'workout',
  activeTheme: 'beast',
  isTimerActive: false,
  timerDuration: 120,
  timerKey: Date.now(),
  timerTitle: null,
  postTimerAction: null,
  isModalOpen: false,
  isWorkoutCompleteModalOpen: false,
  completedExercises: [],
  sessionState: 'idle',
  sessionStartTime: null,
  lastSetLoggedTime: null,
  totalElapsedSeconds: 0,
  isInitialized: false,

  // Temporary Day (Sandbox) initial state
  tempSplit: typeof window !== 'undefined' && localStorage.getItem('fitnessApp_tempSplit') ? JSON.parse(localStorage.getItem('fitnessApp_tempSplit')) : null,
  tempDailyLog: typeof window !== 'undefined' && localStorage.getItem('fitnessApp_tempDailyLog') ? JSON.parse(localStorage.getItem('fitnessApp_tempDailyLog')) : null,
  tempCompletedExercises: typeof window !== 'undefined' && localStorage.getItem('fitnessApp_tempCompletedExercises') ? JSON.parse(localStorage.getItem('fitnessApp_tempCompletedExercises')) : [],
  tempSessionState: (typeof window !== 'undefined' && localStorage.getItem('fitnessApp_tempSessionState')) || 'idle',
  tempSessionStartTime: typeof window !== 'undefined' && localStorage.getItem('fitnessApp_tempSessionStartTime') ? parseInt(localStorage.getItem('fitnessApp_tempSessionStartTime'), 10) : null,
  tempLastSetLoggedTime: typeof window !== 'undefined' && localStorage.getItem('fitnessApp_tempLastSetLoggedTime') ? parseInt(localStorage.getItem('fitnessApp_tempLastSetLoggedTime'), 10) : null,
  tempTotalElapsedSeconds: typeof window !== 'undefined' && localStorage.getItem('fitnessApp_tempTotalElapsedSeconds') ? parseFloat(localStorage.getItem('fitnessApp_tempTotalElapsedSeconds')) : 0,

  initialize: (initialState) => {
    // Note Cleanup
    const newMetrics = { ...initialState.userMetrics };
    const notes = { ...(newMetrics.exerciseNotes || {}) };
    const now = Date.now();
    const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
    
    let notesChanged = false;
    Object.keys(notes).forEach(key => {
        const note = notes[key];
        const expiryTime = note.expiresAt || (note.timestamp + SEVEN_DAYS);
        if (now > expiryTime) {
            delete notes[key];
            notesChanged = true;
        }
    });

    if (notesChanged) {
        newMetrics.exerciseNotes = notes;
        localStorage.setItem(USER_METRICS_KEY, JSON.stringify(newMetrics));
    }

    set({
      dailyLog: initialState.dailyLog,
      userMetrics: newMetrics,
      todaySplit: initialState.todaySplit,
      workoutSplits: initialState.workoutSplits,
      weeklySchedule: initialState.weeklySchedule,
      completedExercises: Object.keys(initialState.dailyLog?.performance ?? {}).filter(id => {
          const split = initialState.todaySplit;
          const exercise = split?.exercises.find(e => e.id === id);
          const performance = initialState.dailyLog?.performance[id];
          if (!exercise || !performance) return false;
          const numSets = isNaN(parseInt(exercise.sets, 10)) ? 1 : parseInt(exercise.sets, 10);
          return performance.sets.filter(Boolean).length === numSets;
      }),
      activeTheme: initialState.activeTheme,
      sessionState: initialState.sessionState,
      sessionStartTime: initialState.sessionStartTime,
      lastSetLoggedTime: initialState.lastSetLoggedTime,
      totalElapsedSeconds: initialState.totalElapsedSeconds,
      isInitialized: true,
    });
  },

  reInitialize: () => {
    const initialState = getInitialWorkoutData();
    get().initialize(initialState);
  },

  setActiveView: (view) => set({ activeView: view }),

  setTheme: (themeId) => {
    applyTheme(themeId);
    saveTheme(themeId);
    set({ activeTheme: themeId });
  },
  
  setTimerActive: (isActive, config) => set(state => ({
    isTimerActive: isActive,
    timerDuration: config?.duration ?? state.timerDuration,
    timerTitle: config?.title ?? null,
    timerKey: isActive ? Date.now() : state.timerKey,
  })),

  clearPostTimerAction: () => set({ postTimerAction: null }),

  setModalOpen: (isOpen) => set({ isModalOpen: isOpen }),
  setWorkoutCompleteModalOpen: (isOpen) => set({ isWorkoutCompleteModalOpen: isOpen }),
  
  startSession: () => {
    const now = Date.now();
    localStorage.setItem(SESSION_STATE_KEY, 'performing');
    
    set(state => {
      if (state.sessionState === 'paused') {
          localStorage.setItem(SESSION_START_TIME_KEY, now.toString());
          localStorage.setItem(LAST_SET_LOGGED_TIME_KEY, now.toString());
          return {
            sessionState: 'performing',
            sessionStartTime: now,
            lastSetLoggedTime: now,
          };
      }
      
      // If idle, we start performing but don't start the timer yet
      // It will start on the first log
      return {
        sessionState: 'performing',
        sessionStartTime: null,
        lastSetLoggedTime: null,
        totalElapsedSeconds: 0,
      };
    });
  },

  pauseSession: () => {
    localStorage.setItem(SESSION_STATE_KEY, 'paused');
    localStorage.removeItem(SESSION_START_TIME_KEY);
    localStorage.removeItem(LAST_SET_LOGGED_TIME_KEY);
    
    set(state => {
      let newTotal = state.totalElapsedSeconds;
      if (state.sessionState === 'performing' && state.sessionStartTime) {
        const elapsed = (Date.now() - state.sessionStartTime) / 1000;
        newTotal += elapsed;
        localStorage.setItem(TOTAL_ELAPSED_KEY, newTotal.toString());
      }
      
      return {
          sessionState: 'paused',
          totalElapsedSeconds: newTotal,
          sessionStartTime: null,
      };
    });
  },

  completeSession: () => {
    localStorage.setItem(SESSION_STATE_KEY, 'complete');
    localStorage.removeItem(SESSION_START_TIME_KEY);
    localStorage.removeItem(BONUS_APPLIED_KEY);
    localStorage.removeItem(LAST_SET_LOGGED_TIME_KEY);
    
    set(state => {
      let finalElapsedTime = state.totalElapsedSeconds;
      if (state.sessionState === 'performing' && state.sessionStartTime) {
        finalElapsedTime += (Date.now() - state.sessionStartTime) / 1000;
      }
      localStorage.setItem(TOTAL_ELAPSED_KEY, finalElapsedTime.toString());

      // Update Daily Log with Duration
      const updatedDailyLog = state.dailyLog ? {
          ...state.dailyLog,
          sessionDuration: finalElapsedTime,
          sessionStatusText: 'COMPLETED'
      } : null;

      if (updatedDailyLog) {
          localStorage.setItem(DAILY_LOG_KEY, JSON.stringify(updatedDailyLog));
      }

      // Update User Metrics (History & Streak)
      const todayDate = getTodayDateString();
      const isNewDayCompletion = state.userMetrics.lastCompletedDate !== todayDate;
      
      const currentHistory = state.userMetrics.workoutHistory || [];
      const newHistory = [...currentHistory];
      
      if (updatedDailyLog) {
          const existingIndex = newHistory.findIndex(log => log.date === updatedDailyLog.date);
          if (existingIndex >= 0) {
              newHistory[existingIndex] = updatedDailyLog;
          } else {
              newHistory.push(updatedDailyLog);
          }
      }

      const newUserMetrics = {
          ...state.userMetrics,
          workoutHistory: newHistory,
          lastCompletedDate: todayDate,
          streak: isNewDayCompletion ? state.userMetrics.streak + 1 : state.userMetrics.streak
      };
      
      localStorage.setItem(USER_METRICS_KEY, JSON.stringify(newUserMetrics));
      
      return {
        sessionState: 'complete',
        isWorkoutCompleteModalOpen: true,
        totalElapsedSeconds: finalElapsedTime,
        sessionStartTime: null,
        dailyLog: updatedDailyLog,
        userMetrics: newUserMetrics
      };
    });
  },
  
  logSet: (exerciseId, setIndex, setData, isFinalSet) => {
    const { dailyLog, todaySplit } = get();
    if (!dailyLog) return;

    // Check if bonus has been applied
    const bonusApplied = localStorage.getItem(BONUS_APPLIED_KEY) === 'true';

    // First-Set Ignition
    if (!bonusApplied) {
        const now = Date.now();
        localStorage.setItem(SESSION_STATE_KEY, 'performing');
        localStorage.setItem(BONUS_APPLIED_KEY, 'true');
        
        // Add 90s bonus
        const currentTotal = get().totalElapsedSeconds;
        const newTotal = currentTotal + 90;
        localStorage.setItem(TOTAL_ELAPSED_KEY, newTotal.toString());

        // Ensure timer is started if it wasn't
        let newStartTime = get().sessionStartTime;
        if (!newStartTime) {
            newStartTime = now;
            localStorage.setItem(SESSION_START_TIME_KEY, now.toString());
        }

        set({
            sessionState: 'performing',
            sessionStartTime: newStartTime,
            totalElapsedSeconds: newTotal,
            lastSetLoggedTime: now,
        });
        localStorage.setItem(LAST_SET_LOGGED_TIME_KEY, now.toString());
    }

    // Initialize performance log for the exercise if it doesn't exist
    const performance = dailyLog.performance[exerciseId] || { sets: [] };
    performance.sets[setIndex] = setData;
    
    const newPerformance = { ...dailyLog.performance, [exerciseId]: performance };
    const newLog = { ...dailyLog, performance: newPerformance };
    
    localStorage.setItem(DAILY_LOG_KEY, JSON.stringify(newLog));

    const now = Date.now();
    set({ lastSetLoggedTime: now });
    localStorage.setItem(LAST_SET_LOGGED_TIME_KEY, now.toString());

    const originalExercise = todaySplit?.exercises.find(e => e.id === exerciseId);
    const exercise = dailyLog.overrides?.[exerciseId] || originalExercise;

    let newAction = null;
    let timerConfig;

    if (isFinalSet) {
        timerConfig = { duration: 120, title: 'PREP NEXT LIFT' };
        newAction = { type: 'SCROLL', payload: { currentExerciseId: exerciseId } };
    } else {
        let restDuration = 75; // Default for no tags
        if (exercise?.intensity === 'HEAVY') restDuration = 120;
        if (exercise?.intensity === 'VOLUME') restDuration = 90;
        
        timerConfig = { duration: restDuration, title: `RESTING - SET ${setIndex + 2}` };
        newAction = { type: 'FOCUS', payload: { exerciseId, nextSetIndex: setIndex + 1 } };
    }

    get().setTimerActive(true, timerConfig);

    const updatedCompleted = isFinalSet ? [...get().completedExercises, exerciseId] : get().completedExercises;

    set({
        dailyLog: newLog,
        completedExercises: updatedCompleted,
        postTimerAction: newAction,
    });

    // Check for workout completion
    if (isFinalSet && todaySplit) {
        const allExercisesComplete = todaySplit.exercises.every(ex => updatedCompleted.includes(ex.id));
        if (allExercisesComplete) {
            get().completeSession();
        }
    }
  },

  addWeightEntry: (value) => {
    const newMetrics = { ...get().userMetrics, weight: [...get().userMetrics.weight, { date: getTodayDateString(), value }] };
    localStorage.setItem(USER_METRICS_KEY, JSON.stringify(newMetrics));
    set({ userMetrics: newMetrics });
  },

  addMeasurementEntry: (muscle, value) => {
    const newMetrics = { ...get().userMetrics, measurements: [...get().userMetrics.measurements, { date: getTodayDateString(), muscle, value }] };
    localStorage.setItem(USER_METRICS_KEY, JSON.stringify(newMetrics));
    set({ userMetrics: newMetrics });
  },

  saveWorkoutSplit: (updatedSplit) => {
    set(state => {
        const newSplits = state.workoutSplits.map(s => s.id === updatedSplit.id ? updatedSplit : s);
        localStorage.setItem(WORKOUT_SPLITS_KEY, JSON.stringify(newSplits));
        
        const newTodaySplit = newSplits.find(s => s.id === state.todaySplit?.id) || null;

        return {
            workoutSplits: newSplits,
            todaySplit: newTodaySplit,
        };
    });
  },
  
  substituteExercise: (originalExerciseId, substituteExercise) => {
    const log = get().dailyLog;
    if (!log) return;

    const newSubstitute = { ...substituteExercise, id: `sub-${originalExerciseId}` };
    const newOverrides = { ...(log.overrides || {}), [originalExerciseId]: newSubstitute };
    
    const newPerformance = { ...log.performance };
    delete newPerformance[originalExerciseId]; // Clear performance if original was logged

    const newLog = { ...log, overrides: newOverrides, performance: newPerformance };
    localStorage.setItem(DAILY_LOG_KEY, JSON.stringify(newLog));

    set({ 
        dailyLog: newLog,
        completedExercises: Object.keys(newLog.performance),
    });
  },

  updateExerciseInSession: (exerciseId, updates) => {
      const log = get().dailyLog;
      const todaySplit = get().todaySplit;
      if (!log || !todaySplit) return;

      const baseExercise = log.overrides?.[exerciseId] || todaySplit.exercises.find(e => e.id === exerciseId);
      if (!baseExercise) return;

      const updatedExercise = { ...baseExercise, ...updates };
      const newOverrides = { ...(log.overrides || {}), [exerciseId]: updatedExercise };
      
      const newLog = { ...log, overrides: newOverrides };
      localStorage.setItem(DAILY_LOG_KEY, JSON.stringify(newLog));
      set({ dailyLog: newLog });
  },

  saveExerciseNote: (exerciseId, text) => {
      const currentNotes = { ...(get().userMetrics.exerciseNotes || {}) };
      
      if (!text.trim()) {
          delete currentNotes[exerciseId];
      } else {
          const d = new Date();
          d.setDate(d.getDate() + 7);
          d.setHours(23, 30, 0, 0);
          currentNotes[exerciseId] = { text, timestamp: Date.now(), expiresAt: d.getTime() };
      }

      const newMetrics = { ...get().userMetrics, exerciseNotes: currentNotes };
      localStorage.setItem(USER_METRICS_KEY, JSON.stringify(newMetrics));
      set({ userMetrics: newMetrics });
  },

  importSplitToSession: (splitId) => {
      const splitToImport = get().workoutSplits.find(s => s.id === splitId);
      if (!splitToImport) return;

      const tempSplit = {
          ...splitToImport,
          id: `temp-${splitToImport.id}-${Date.now()}`,
          name: `${splitToImport.name} [Ad-Hoc]`,
          exercises: splitToImport.exercises.map(ex => ({ ...ex }))
      };

      const log = get().dailyLog;
      if (log) {
          const newLog = { ...log, splitId: splitToImport.id };
          localStorage.setItem(DAILY_LOG_KEY, JSON.stringify(newLog));
          set({ todaySplit: tempSplit, dailyLog: newLog });
      } else {
          set({ todaySplit: tempSplit });
      }
  },

  updateDayAssignment: (dayIndex, splitId) => {
      const newSchedule = { ...get().weeklySchedule, [dayIndex]: splitId };
      localStorage.setItem('fitnessApp_weeklySchedule', JSON.stringify(newSchedule));
      
      const todayIndex = new Date().getDay();
      let todaySplitUpdate = {};
      if (dayIndex === todayIndex) {
          const split = get().workoutSplits.find(s => s.id === splitId) || null;
          todaySplitUpdate = { todaySplit: split };
      }
      
      set({
          weeklySchedule: newSchedule,
          ...todaySplitUpdate
      });
  },

  importSplitToTempSession: (splitId) => {
      const splitToImport = get().workoutSplits.find(s => s.id === splitId);
      if (!splitToImport) return;

      const tempSplit = {
          ...splitToImport,
          id: `temp-${splitToImport.id}-${Date.now()}`,
          name: `${splitToImport.name} [Ad-Hoc]`,
          exercises: splitToImport.exercises.map(ex => ({ ...ex }))
      };

      const todayDate = getTodayDateString();
      const tempLog = {
          date: todayDate,
          performance: {},
          overrides: {},
          sessionStartTime: Date.now(),
          sessionStatusText: 'PERFORMING',
          splitId: splitToImport.id,
      };

      localStorage.setItem('fitnessApp_tempSplit', JSON.stringify(tempSplit));
      localStorage.setItem('fitnessApp_tempDailyLog', JSON.stringify(tempLog));
      localStorage.setItem('fitnessApp_tempSessionState', 'performing');
      localStorage.setItem('fitnessApp_tempCompletedExercises', JSON.stringify([]));
      localStorage.setItem('fitnessApp_tempTotalElapsedSeconds', '0');
      localStorage.setItem('fitnessApp_tempSessionStartTime', Date.now().toString());
      localStorage.setItem('fitnessApp_tempLastSetLoggedTime', Date.now().toString());

      set({
          tempSplit,
          tempDailyLog: tempLog,
          tempSessionState: 'performing',
          tempCompletedExercises: [],
          tempTotalElapsedSeconds: 0,
          tempSessionStartTime: Date.now(),
          tempLastSetLoggedTime: Date.now(),
      });
  },

  importSplitToTempConfig: (splitId) => {
      const splitToImport = get().workoutSplits.find(s => s.id === splitId);
      if (!splitToImport) return;

      const tempSplit = {
          ...splitToImport,
          id: `temp-${splitToImport.id}-${Date.now()}`,
          name: `${splitToImport.name} [Ad-Hoc]`,
          exercises: splitToImport.exercises.map(ex => ({ ...ex }))
      };

      localStorage.setItem('fitnessApp_tempSplit', JSON.stringify(tempSplit));
      set({ tempSplit });
  },

  initializeEmptyTempSplit: () => {
      const tempSplit = {
          id: `temp-manual-${Date.now()}`,
          name: 'Manual Temporary Day',
          muscleGroups: 'Custom',
          exercises: []
      };

      localStorage.setItem('fitnessApp_tempSplit', JSON.stringify(tempSplit));
      set({ tempSplit });
  },

  saveTempSplit: (updatedSplit) => {
      if (updatedSplit === null) {
          localStorage.removeItem('fitnessApp_tempSplit');
          set({ tempSplit: null });
      } else {
          localStorage.setItem('fitnessApp_tempSplit', JSON.stringify(updatedSplit));
          set({ tempSplit: updatedSplit });
      }
  },

  launchTempSession: () => {
      const tempSplit = get().tempSplit;
      if (!tempSplit) return;

      const todayDate = getTodayDateString();
      const tempLog = {
          date: todayDate,
          performance: {},
          overrides: {},
          sessionStartTime: Date.now(),
          sessionStatusText: 'PERFORMING',
          splitId: tempSplit.id,
      };

      localStorage.setItem('fitnessApp_tempDailyLog', JSON.stringify(tempLog));
      localStorage.setItem('fitnessApp_tempSessionState', 'performing');
      localStorage.setItem('fitnessApp_tempCompletedExercises', JSON.stringify([]));
      localStorage.setItem('fitnessApp_tempTotalElapsedSeconds', '0');
      localStorage.setItem('fitnessApp_tempSessionStartTime', Date.now().toString());
      localStorage.setItem('fitnessApp_tempLastSetLoggedTime', Date.now().toString());

      set({
          tempDailyLog: tempLog,
          tempSessionState: 'performing',
          tempCompletedExercises: [],
          tempTotalElapsedSeconds: 0,
          tempSessionStartTime: Date.now(),
          tempLastSetLoggedTime: Date.now(),
          activeView: 'temporary_day'
      });
  },

  startTempSession: () => {
      const now = Date.now();
      localStorage.setItem('fitnessApp_tempSessionState', 'performing');
      set(state => {
          if (state.tempSessionState === 'paused') {
              localStorage.setItem('fitnessApp_tempSessionStartTime', now.toString());
              localStorage.setItem('fitnessApp_tempLastSetLoggedTime', now.toString());
              return {
                  tempSessionState: 'performing',
                  tempSessionStartTime: now,
                  tempLastSetLoggedTime: now,
              };
          }
          return {
              tempSessionState: 'performing',
              tempSessionStartTime: null,
              tempLastSetLoggedTime: null,
              tempTotalElapsedSeconds: 0,
          };
      });
  },

  pauseTempSession: () => {
      localStorage.setItem('fitnessApp_tempSessionState', 'paused');
      localStorage.removeItem('fitnessApp_tempSessionStartTime');
      localStorage.removeItem('fitnessApp_tempLastSetLoggedTime');

      set(state => {
          let newTotal = state.tempTotalElapsedSeconds;
          if (state.tempSessionState === 'performing' && state.tempSessionStartTime) {
              const elapsed = (Date.now() - state.tempSessionStartTime) / 1000;
              newTotal += elapsed;
              localStorage.setItem('fitnessApp_tempTotalElapsedSeconds', newTotal.toString());
          }
          return {
              tempSessionState: 'paused',
              tempTotalElapsedSeconds: newTotal,
              tempSessionStartTime: null,
          };
      });
  },

  completeTempSession: () => {
      localStorage.setItem('fitnessApp_tempSessionState', 'complete');
      localStorage.removeItem('fitnessApp_tempSessionStartTime');
      localStorage.removeItem('fitnessApp_tempLastSetLoggedTime');

      set(state => {
          let finalElapsedTime = state.tempTotalElapsedSeconds;
          if (state.tempSessionState === 'performing' && state.tempSessionStartTime) {
              finalElapsedTime += (Date.now() - state.tempSessionStartTime) / 1000;
          }
          localStorage.setItem('fitnessApp_tempTotalElapsedSeconds', finalElapsedTime.toString());

          if (!state.tempDailyLog) return {};

          // Calculate volume
          const overallVolume = Object.values(state.tempDailyLog.performance).reduce((acc, exercise) => {
              return acc + (exercise.sets || []).filter(Boolean).reduce((esum, s) => esum + (s.reps * s.weight), 0);
          }, 0);

          const updatedDailyLog = {
              ...state.tempDailyLog,
              sessionDuration: finalElapsedTime,
              sessionStatusText: 'COMPLETED',
              totalVolume: overallVolume
          };

          const todayDate = getTodayDateString();
          const isNewDayCompletion = state.userMetrics.lastCompletedDate !== todayDate;

          const currentHistory = state.userMetrics.workoutHistory || [];
          const newHistory = [...currentHistory];

          // Save completed adhoc log under workoutHistory
          const existingIndex = newHistory.findIndex(log => log.date === updatedDailyLog.date && log.splitId === updatedDailyLog.splitId);
          if (existingIndex >= 0) {
              newHistory[existingIndex] = updatedDailyLog;
          } else {
              newHistory.push(updatedDailyLog);
          }

          const newUserMetrics = {
              ...state.userMetrics,
              workoutHistory: newHistory,
              lastCompletedDate: todayDate,
              streak: isNewDayCompletion ? state.userMetrics.streak + 1 : state.userMetrics.streak
          };

          localStorage.setItem(USER_METRICS_KEY, JSON.stringify(newUserMetrics));

          localStorage.removeItem('fitnessApp_tempSplit');
          localStorage.removeItem('fitnessApp_tempDailyLog');
          localStorage.removeItem('fitnessApp_tempCompletedExercises');
          localStorage.removeItem('fitnessApp_tempTotalElapsedSeconds');
          localStorage.removeItem('fitnessApp_tempSessionState');
          localStorage.removeItem('fitnessApp_tempSessionStartTime');
          localStorage.removeItem('fitnessApp_tempLastSetLoggedTime');

          return {
              tempSessionState: 'complete',
              tempTotalElapsedSeconds: finalElapsedTime,
              tempSessionStartTime: null,
              tempDailyLog: null,
              tempSplit: null,
              tempCompletedExercises: [],
              userMetrics: newUserMetrics,
              isWorkoutCompleteModalOpen: true,
              dailyLog: updatedDailyLog, // Set this temporarily for WorkoutCompleteModal
          };
      });
  },

  logTempSet: (exerciseId, setIndex, setData, isFinalSet) => {
      const { tempDailyLog, tempSplit } = get();
      if (!tempDailyLog) return;

      const now = Date.now();
      let newStartTime = get().tempSessionStartTime;
      if (!newStartTime) {
          newStartTime = now;
          localStorage.setItem('fitnessApp_tempSessionStartTime', now.toString());
      }

      const performance = tempDailyLog.performance[exerciseId] || { sets: [] };
      performance.sets[setIndex] = setData;

      const newPerformance = { ...tempDailyLog.performance, [exerciseId]: performance };
      const newLog = { ...tempDailyLog, performance: newPerformance };

      localStorage.setItem('fitnessApp_tempDailyLog', JSON.stringify(newLog));

      const updatedCompleted = isFinalSet ? [...get().tempCompletedExercises, exerciseId] : get().tempCompletedExercises;

      set({
          tempDailyLog: newLog,
          tempCompletedExercises: updatedCompleted,
          tempSessionStartTime: newStartTime,
          tempLastSetLoggedTime: now,
      });
      localStorage.setItem('fitnessApp_tempCompletedExercises', JSON.stringify(updatedCompleted));
      localStorage.setItem('fitnessApp_tempLastSetLoggedTime', now.toString());

      // Let's activate countdown timer
      const originalExercise = tempSplit?.exercises.find(e => e.id === exerciseId);
      const exercise = tempDailyLog.overrides?.[exerciseId] || originalExercise;

      let timerConfig;
      if (isFinalSet) {
          timerConfig = { duration: 120, title: 'PREP NEXT LIFT' };
      } else {
          let restDuration = 75;
          if (exercise?.intensity === 'HEAVY') restDuration = 120;
          if (exercise?.intensity === 'VOLUME') restDuration = 90;
          timerConfig = { duration: restDuration, title: `RESTING - SET ${setIndex + 2}` };
      }
      get().setTimerActive(true, timerConfig);

      if (isFinalSet && tempSplit) {
          const allExercisesComplete = tempSplit.exercises.every(ex => updatedCompleted.includes(ex.id));
          if (allExercisesComplete) {
              get().completeTempSession();
          }
      }
  },

  updateExerciseInSessionTemp: (exerciseId, updates) => {
      const log = get().tempDailyLog;
      const tempSplit = get().tempSplit;
      if (!log || !tempSplit) return;

      const baseExercise = log.overrides?.[exerciseId] || tempSplit.exercises.find(e => e.id === exerciseId);
      if (!baseExercise) return;

      const updatedExercise = { ...baseExercise, ...updates };
      const newOverrides = { ...(log.overrides || {}), [exerciseId]: updatedExercise };
      
      const newLog = { ...log, overrides: newOverrides };
      localStorage.setItem('fitnessApp_tempDailyLog', JSON.stringify(newLog));
      set({ tempDailyLog: newLog });
  },

  substituteExerciseTemp: (originalExerciseId, substituteExercise) => {
      const log = get().tempDailyLog;
      if (!log) return;

      const newSubstitute = { ...substituteExercise, id: `sub-${originalExerciseId}` };
      const newOverrides = { ...(log.overrides || {}), [originalExerciseId]: newSubstitute };
      
      const newPerformance = { ...log.performance };
      delete newPerformance[originalExerciseId];

      const newLog = { ...log, overrides: newOverrides, performance: newPerformance };
      localStorage.setItem('fitnessApp_tempDailyLog', JSON.stringify(newLog));

      set({ 
          tempDailyLog: newLog,
          tempCompletedExercises: Object.keys(newLog.performance),
      });
  },

}));
