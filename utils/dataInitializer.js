import { weeklySchedule as defaultSchedule, workoutSplits as defaultSplits } from '../data/workoutData';
import { getTodayDateString, getYesterdayDateString } from './dateUtils';
import { getSavedTheme } from './themeManager';

const DAILY_LOG_KEY = 'fitnessApp_dailyLog';
const USER_METRICS_KEY = 'fitnessApp_userMetrics';
const WORKOUT_SPLITS_KEY = 'fitnessApp_workoutSplits';
const WEEKLY_SCHEDULE_KEY = 'fitnessApp_weeklySchedule';
const SESSION_STATE_KEY = 'fitnessApp_sessionState';
const SESSION_START_TIME_KEY = 'fitnessApp_sessionStartTime';
const TOTAL_ELAPSED_KEY = 'fitnessApp_totalElapsedSeconds';
const BONUS_APPLIED_KEY = 'fitnessApp_bonusApplied';
const LAST_SET_LOGGED_TIME_KEY = 'fitnessApp_lastSetLoggedTime';
const DATA_VERSION_KEY = 'fitnessApp_dataVersion';
const WORKOUT_DATA_VERSION = '1.6'; // Increment version to trigger data reset

const defaultMetrics = {
  streak: 0,
  lastCompletedDate: null,
  weight: [],
  measurements: [],
  workoutHistory: [],
};

export const getInitialWorkoutData = () => {
    const today = getTodayDateString();
    
    let savedLog = null;
    let savedMetrics = { ...defaultMetrics };
    let workoutSplits = [...defaultSplits];
    let weeklySchedule = { ...defaultSchedule };
    let sessionState = 'idle';
    let savedSessionState = null;
    let sessionStartTime = null;
    let lastSetLoggedTime = null;
    let totalElapsedSeconds = 0;

    try {
        const savedVersion = localStorage.getItem(DATA_VERSION_KEY);

        if (savedVersion !== WORKOUT_DATA_VERSION) {
            // Version mismatch, so reset the data
            localStorage.setItem(WORKOUT_SPLITS_KEY, JSON.stringify(defaultSplits));
            localStorage.setItem(DATA_VERSION_KEY, WORKOUT_DATA_VERSION);
            localStorage.removeItem(DAILY_LOG_KEY); 
            localStorage.removeItem(SESSION_STATE_KEY);
            localStorage.removeItem(SESSION_START_TIME_KEY);
            localStorage.removeItem(TOTAL_ELAPSED_KEY);
            localStorage.removeItem(BONUS_APPLIED_KEY);
            localStorage.removeItem(LAST_SET_LOGGED_TIME_KEY);
            savedLog = null; // Nullify in-memory log to prevent using stale data in this session
            sessionState = 'planning'; // Set to planning on data reset
        }

        const savedSplitsStr = localStorage.getItem(WORKOUT_SPLITS_KEY);
        if (savedSplitsStr) {
            const parsedSplits = JSON.parse(savedSplitsStr);
            if (Array.isArray(parsedSplits)) { // Ensure it's an array
                workoutSplits = defaultSplits.map(defaultSplit => {
                    const savedFound = parsedSplits.find(s => s.id === defaultSplit.id);
                    return savedFound ? { ...defaultSplit, ...savedFound } : defaultSplit;
                });
            } else { // Fallback to default if not an array
                localStorage.setItem(WORKOUT_SPLITS_KEY, JSON.stringify(defaultSplits));
                workoutSplits = [...defaultSplits];
            }
        } else {
            localStorage.setItem(WORKOUT_SPLITS_KEY, JSON.stringify(defaultSplits));
            workoutSplits = [...defaultSplits];
        }

        const savedScheduleStr = localStorage.getItem(WEEKLY_SCHEDULE_KEY);
        if (savedScheduleStr) {
            const parsedSchedule = JSON.parse(savedScheduleStr);
            if (typeof parsedSchedule === 'object' && parsedSchedule !== null) { // Ensure it's an object
                weeklySchedule = parsedSchedule;
            } else { // Fallback to default if not an object
                localStorage.setItem(WEEKLY_SCHEDULE_KEY, JSON.stringify(defaultSchedule));
                weeklySchedule = { ...defaultSchedule };
            }
        } else {
            localStorage.setItem(WEEKLY_SCHEDULE_KEY, JSON.stringify(defaultSchedule));
            weeklySchedule = { ...defaultSchedule };
        }

        savedSessionState = localStorage.getItem(SESSION_STATE_KEY);
        if (savedSessionState) {
            sessionState = savedSessionState;
        }
        
        const savedStartTime = localStorage.getItem(SESSION_START_TIME_KEY);
        if (savedStartTime) {
            sessionStartTime = parseInt(savedStartTime, 10);
        }

        const savedLastSetTime = localStorage.getItem(LAST_SET_LOGGED_TIME_KEY);
        if (savedLastSetTime) {
            lastSetLoggedTime = parseInt(savedLastSetTime, 10);
        }
        
        const savedTotalElapsed = localStorage.getItem(TOTAL_ELAPSED_KEY);
        if (savedTotalElapsed) {
            totalElapsedSeconds = parseFloat(savedTotalElapsed);
        }
    } catch (e) { console.error("Failed to process workout splits", e); }

    try {
      const savedLogStr = localStorage.getItem(DAILY_LOG_KEY);
      if (savedLogStr) savedLog = JSON.parse(savedLogStr);
    } catch (e) { console.error("Failed to process daily log", e); }
    
    try {
        const savedMetricsStr = localStorage.getItem(USER_METRICS_KEY);
        if (savedMetricsStr) {
            const parsed = JSON.parse(savedMetricsStr);
            savedMetrics = { 
                ...defaultMetrics, 
                ...parsed,
                workoutHistory: Array.isArray(parsed.workoutHistory) ? parsed.workoutHistory : [] 
            };
        }
    } catch (e) { console.error("Failed to process user metrics", e); }

    let currentLog;

    // --- Daily Reset Logic ---
    if (savedLog && savedLog.date !== today) {
      // Clear session state for new day
      localStorage.removeItem(SESSION_STATE_KEY);
      localStorage.removeItem(SESSION_START_TIME_KEY);
      localStorage.removeItem(TOTAL_ELAPSED_KEY);
      localStorage.removeItem(BONUS_APPLIED_KEY);
      localStorage.removeItem(LAST_SET_LOGGED_TIME_KEY);
      sessionState = 'idle';
      sessionStartTime = null;
      lastSetLoggedTime = null;
      totalElapsedSeconds = 0;

      // Archive yesterday's log
      if(Object.keys(savedLog.performance).length > 0) {
        const history = savedMetrics.workoutHistory || [];
        // Check if this date already exists to avoid duplicates
        const exists = history.some(h => h.date === savedLog.date);
        if (!exists) {
            savedMetrics.workoutHistory = [...history, savedLog];
        }
      }
      
      const yesterday = getYesterdayDateString();
      const yesterdaySplitId = savedLog.splitId || weeklySchedule[new Date(yesterday).getDay()];
      const yesterdayWorkout = workoutSplits.find(s => s.id === yesterdaySplitId);

      if (savedLog.date === yesterday && yesterdayWorkout) {
        const completedExercises = Object.keys(savedLog.performance);
        const allExercisesCompleted = yesterdayWorkout.exercises.every(ex => completedExercises.includes(ex.id));
        
        if (allExercisesCompleted) {
            savedMetrics.streak = (savedMetrics.streak || 0) + 1;
            savedMetrics.lastCompletedDate = yesterday;
        } else {
            savedMetrics.streak = 0;
        }
      } else if (savedLog.date !== yesterday) {
        savedMetrics.streak = 0;
      }
      
      localStorage.setItem(USER_METRICS_KEY, JSON.stringify(savedMetrics));
      
      currentLog = { date: today, performance: {}, overrides: {} };
    } else if (savedLog) {
      currentLog = savedLog;
    } else {
      currentLog = { date: today, performance: {}, overrides: {} };
    }

    localStorage.setItem(DAILY_LOG_KEY, JSON.stringify(currentLog));

    const dayOfWeek = new Date().getDay();
    const splitId = currentLog.splitId || weeklySchedule[dayOfWeek];
    const todaySplit = workoutSplits.find(s => s.id === splitId) || null;

    // --- Data Repair: Ensure completed today's workout is in history ---
    if (todaySplit && currentLog && currentLog.date === today) {
        // Check if all exercises in the split have been logged
        const allDone = todaySplit.exercises.every(ex => {
             const perf = currentLog.performance[ex.id];
             if (!perf) return false;
             // Simple check: has sets. Ideally check against ex.sets count but this is a repair.
             return perf.sets.length > 0;
        });

        if (allDone) {
             let logChanged = false;
             // 1. Fix Duration if missing
             if (!currentLog.sessionDuration && totalElapsedSeconds > 0) {
                 currentLog.sessionDuration = totalElapsedSeconds;
                 currentLog.sessionStatusText = 'COMPLETED';
                 logChanged = true;
             }
             
             // 2. Sync with History
             const history = savedMetrics.workoutHistory || [];
             const inHistoryIndex = history.findIndex(h => h.date === today);
             
             let historyChanged = false;
             if (inHistoryIndex === -1) {
                 savedMetrics.workoutHistory = [...history, currentLog];
                 historyChanged = true;
             } else {
                 // Update existing entry if it's missing data that we have now
                 const existing = history[inHistoryIndex];
                 if ((!existing.sessionDuration && currentLog.sessionDuration) || 
                     (Object.keys(existing.performance).length < Object.keys(currentLog.performance).length)) {
                     const newHistory = [...history];
                     newHistory[inHistoryIndex] = currentLog;
                     savedMetrics.workoutHistory = newHistory;
                     historyChanged = true;
                 }
             }

             if (logChanged) {
                 localStorage.setItem(DAILY_LOG_KEY, JSON.stringify(currentLog));
             }
             if (historyChanged) {
                 localStorage.setItem(USER_METRICS_KEY, JSON.stringify(savedMetrics));
             }
         }
    }
    
    return {
        dailyLog: currentLog,
        userMetrics: savedMetrics,
        todaySplit: todaySplit,
        workoutSplits: workoutSplits,
        weeklySchedule: weeklySchedule,
        activeTheme: getSavedTheme(),
        sessionState: todaySplit && !savedSessionState ? 'planning' : sessionState,
        sessionStartTime: sessionStartTime,
        lastSetLoggedTime: lastSetLoggedTime,
        totalElapsedSeconds: totalElapsedSeconds,
    };
};
