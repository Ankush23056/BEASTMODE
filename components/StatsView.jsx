import React from 'react';
import { FlameIcon, ChartBarIcon, LightningIcon } from './icons';
import PowerStrand from './PowerStrand';
import Header from './Header';
import ConsistencyCalendar from './ConsistencyCalendar';
import WorkoutHistory from './WorkoutHistory';
import { useWorkoutStore } from '../store/useWorkoutStore';

const StatsCard = ({ title, value, unit, icon }) => (
    <div className="bg-base-200 p-4 rounded-2xl flex flex-col justify-between h-full backdrop-blur-lg border border-base-300">
        <div className="flex justify-between items-center">
            <p className="text-sm font-semibold text-content-200 uppercase tracking-wider">{title}</p>
            {icon}
        </div>
        <div>
            <span className="text-2xl sm:text-3xl font-bold text-content-100 font-mono">{value}</span>
            {unit && <span className="text-base font-medium text-content-200 ml-1">{unit}</span>}
        </div>
    </div>
);

const ProgressView = ({ metrics: initialMetrics }) => {
  const { dailyLog, sessionState, workoutSplits, weeklySchedule, userMetrics } = useWorkoutStore();
  const [syncedMetrics, setSyncedMetrics] = React.useState(initialMetrics);

  React.useEffect(() => {
    // Force state synchronization on tab mount and userMetrics update
    if (userMetrics) {
        setSyncedMetrics(userMetrics);
    }
  }, [userMetrics]);

  const history = syncedMetrics?.workoutHistory || [];
  const todayDateStr = new Date().toLocaleDateString('en-CA');
  const todayAlreadyInHistory = history.some(h => h.date === todayDateStr);
  const performanceKeys = Object.keys(dailyLog?.performance || {});
  const hasActiveSessionToday = performanceKeys.length > 0 && !todayAlreadyInHistory;
  const totalWorkouts = history.length + (hasActiveSessionToday ? 1 : 0);

  return (
    <div>
        <Header title="Your Progress" />
        <main className="p-4 md:px-6 lg:px-8 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <StatsCard title="Streak" value={syncedMetrics?.streak || 0} unit="days" icon={<FlameIcon className="w-6 h-6 text-brand-primary" />} />
                <StatsCard title="This Week" value={`${history.filter(h => new Date(h.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}/6`} icon={<ChartBarIcon className="w-6 h-6 text-brand-primary" />} />
                <StatsCard title="Total" value={totalWorkouts} icon={<LightningIcon className="w-6 h-6 text-brand-primary" />} />
            </div>
            
            <div className="bg-base-200 rounded-2xl p-6 backdrop-blur-lg border border-base-300 flex flex-col items-center">
                <h3 className="font-bold mb-2 text-content-100 text-lg uppercase tracking-widest">Weekly Activity</h3>
                <PowerStrand 
                    history={history} 
                    currentLog={dailyLog} 
                    sessionState={sessionState}
                    splits={workoutSplits}
                    schedule={weeklySchedule}
                />
            </div>

            <div className="py-4">
                <ConsistencyCalendar />
            </div>

            <WorkoutHistory 
                history={
                    dailyLog && performanceKeys.length > 0 
                    ? [...history.filter(log => log.date !== dailyLog.date), dailyLog] 
                    : history
                } 
                splits={workoutSplits} 
            />
        </main>
    </div>
  );
};

export default ProgressView;
