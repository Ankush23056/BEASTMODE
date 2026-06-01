import React from 'react';
import { FlameIcon, ChartBarIcon, LightningIcon } from './icons';
import PowerStrand from './PowerStrand';
import Header from './Header';
import ConsistencyCalendar from './ConsistencyCalendar';
import WorkoutHistory from './WorkoutHistory';
import { useWorkoutStore } from '../store/useWorkoutStore';

// ─── Error Boundary ────────────────────────────────────────────────────────
// Prevents any runtime crash in the Progress tab from going blank.
// Catches errors from child components (chart libs, data parsing, etc.)
class ProgressErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        // Non-fatal — just log for debugging; app keeps running
        console.warn('[BEASTMODE] Progress view render error caught:', error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
                    <div className="text-4xl mb-4">💪</div>
                    <p className="text-content-100 font-bold font-mono text-lg uppercase tracking-widest mb-2">
                        History metrics ready
                    </p>
                    <p className="text-content-200 text-sm font-mono">
                        for next lift session
                    </p>
                    <p className="text-content-200/50 text-xs font-mono mt-6">
                        Data loads fully after your first online visit.
                    </p>
                    <button
                        onClick={() => this.setState({ hasError: false, error: null })}
                        className="mt-6 px-4 py-2 border border-brand-primary/40 text-brand-primary text-xs font-mono uppercase tracking-widest rounded-lg hover:bg-brand-primary/10 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

// ─── Stats Card ────────────────────────────────────────────────────────────
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

// ─── Progress View Inner (guarded by Error Boundary above) ─────────────────
const ProgressViewInner = ({ metrics: initialMetrics }) => {
    const { dailyLog, sessionState, workoutSplits, weeklySchedule, userMetrics } = useWorkoutStore();
    const [syncedMetrics, setSyncedMetrics] = React.useState(initialMetrics);

    React.useEffect(() => {
        if (userMetrics) {
            setSyncedMetrics(userMetrics);
        }
    }, [userMetrics]);

    // All history accessors use safe fallbacks — never throw on missing/corrupt data
    const history = Array.isArray(syncedMetrics?.workoutHistory) ? syncedMetrics.workoutHistory : [];
    const todayDateStr = new Date().toLocaleDateString('en-CA');
    const todayAlreadyInHistory = history.some(h => h?.date === todayDateStr);
    const performanceKeys = Object.keys(dailyLog?.performance || {});
    const hasActiveSessionToday = performanceKeys.length > 0 && !todayAlreadyInHistory;
    const totalWorkouts = history.length + (hasActiveSessionToday ? 1 : 0);

    // Safe "this week" count — guards against bad date strings
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const thisWeekCount = history.filter(h => {
        try {
            return new Date(h?.date).getTime() > oneWeekAgo;
        } catch {
            return false;
        }
    }).length;

    // Build the history list passed to WorkoutHistory — safe merge of live log
    const mergedHistory = React.useMemo(() => {
        try {
            if (dailyLog && performanceKeys.length > 0) {
                return [...history.filter(log => log?.date !== dailyLog?.date), dailyLog];
            }
            return history;
        } catch {
            return history;
        }
    }, [history, dailyLog, performanceKeys.length]);

    return (
        <div>
            <Header title="Your Progress" />
            <main className="p-4 md:px-6 lg:px-8 space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <StatsCard
                        title="Streak"
                        value={syncedMetrics?.streak ?? 0}
                        unit="days"
                        icon={<FlameIcon className="w-6 h-6 text-brand-primary" />}
                    />
                    <StatsCard
                        title="This Week"
                        value={`${thisWeekCount}/6`}
                        icon={<ChartBarIcon className="w-6 h-6 text-brand-primary" />}
                    />
                    <StatsCard
                        title="Total"
                        value={totalWorkouts}
                        icon={<LightningIcon className="w-6 h-6 text-brand-primary" />}
                    />
                </div>

                <div className="bg-base-200 rounded-2xl p-6 backdrop-blur-lg border border-base-300 flex flex-col items-center">
                    <h3 className="font-bold mb-2 text-content-100 text-lg uppercase tracking-widest">Weekly Activity</h3>
                    <PowerStrand
                        history={history}
                        currentLog={dailyLog}
                        sessionState={sessionState}
                        splits={workoutSplits || []}
                        schedule={weeklySchedule || {}}
                    />
                </div>

                <div className="py-4">
                    <ConsistencyCalendar />
                </div>

                <WorkoutHistory
                    history={mergedHistory}
                    splits={workoutSplits || []}
                />
            </main>
        </div>
    );
};

// ─── Public export: wrapped in Error Boundary ──────────────────────────────
const ProgressView = (props) => (
    <ProgressErrorBoundary>
        <ProgressViewInner {...props} />
    </ProgressErrorBoundary>
);

export default ProgressView;
