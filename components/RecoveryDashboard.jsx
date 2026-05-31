import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useWorkoutStore } from '../store/useWorkoutStore';

const recoveryTips = [
    'Target 8 hours of sleep for CNS repair.',
    'Hydration is key for muscle elasticity.',
    'Active recovery like walking can aid blood flow.',
    'Foam rolling can help reduce muscle soreness.',
    'A protein-rich meal aids muscle protein synthesis.',
    'Listen to your body; rest is productive.',
];

const RecoveryDashboard = () => {
    const [tip] = React.useState(() => recoveryTips[Math.floor(Math.random() * recoveryTips.length)]);
    const { userMetrics, setActiveView } = useWorkoutStore(s => ({
        userMetrics: s.userMetrics,
        setActiveView: s.setActiveView,
    }));

    const last7DaysData = React.useMemo(() => {
        const today = new Date();
        const data = [];
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateString = date.toISOString().split('T')[0];
            const dayOfWeek = days[date.getDay()];

            const log = userMetrics.workoutHistory.find(h => h.date === dateString);

            let dailyVolume = 0;
            if (log) {
                dailyVolume = Object.values(log.performance).reduce((total, exercise) => {
                    const exerciseVolume = exercise.sets.reduce((sum, set) => {
                        if (set && set.weight && set.reps) {
                            return sum + (Number(set.weight) * Number(set.reps));
                        }
                        return sum;
                    }, 0);
                    return total + exerciseVolume;
                }, 0);
            }
            data.push({ day: dayOfWeek, volume: dailyVolume });
        }
        return data;
    }, [userMetrics.workoutHistory]);

    const handleTrainAnyway = () => {
        setActiveView('routineEditor');
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-4 md:px-6 lg:px-8 space-y-6"
        >
            <div className="text-center">
                <h2 className="text-2xl font-bold text-teal-300 uppercase tracking-widest">Recovery Dashboard</h2>
            </div>

            <div className="bg-base-200 rounded-2xl p-4 border border-base-300">
                <h3 className="text-md font-semibold text-content-200 mb-2 uppercase tracking-wider">Weekly Volume</h3>
                <div style={{ height: '200px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={last7DaysData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)"/>
                            <XAxis dataKey="day" tick={{ fill: 'var(--color-content-200)' }} />
                            <YAxis tick={{ fill: 'var(--color-content-200)' }} />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: 'rgba(30,30,30,0.8)', 
                                    borderColor: 'var(--color-base-300)',
                                    color: 'var(--color-content-100)'
                                }}
                            />
                            <Bar dataKey="volume" fill="var(--color-brand-primary)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-base-200 rounded-2xl p-4 border border-base-300 text-center">
                <h3 className="text-md font-semibold text-content-200 mb-2 uppercase tracking-wider">Recovery Tip</h3>
                <p className="text-content-100 italic">&quot;{tip}&quot;</p>
            </div>

            <div className="text-center">
                <button 
                    onClick={handleTrainAnyway}
                    className="btn btn-ghost text-content-200"
                >
                    Train Anyway?
                </button>
            </div>
        </motion.div>
    );
};

export default RecoveryDashboard;
