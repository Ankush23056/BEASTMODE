import React from 'react';
import { motion } from 'framer-motion';
import { useWorkoutStore } from '../store/useWorkoutStore';
import Header from './Header';
import { SettingsIcon, ChevronRightIcon } from './icons';
import ThemeSelector from './ThemeSelector';

const ProfileView = () => {
    const { setActiveView } = useWorkoutStore(s => ({
        setActiveView: s.setActiveView,
    }));
    
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <Header title="Profile" />
            <main className="p-4 md:px-6 lg:px-8 space-y-6">
                <div>
                     <h2 className="text-lg font-semibold text-content-200 mb-2 uppercase tracking-wider">Settings</h2>
                    <div className="bg-base-200 rounded-2xl backdrop-blur-lg border border-base-300">
                        <button 
                            onClick={() => setActiveView('routineEditor')}
                            className="w-full flex items-center justify-between text-left p-4 hover:bg-base-300/20 transition-colors first:rounded-t-2xl last:rounded-b-2xl"
                        >
                            <div className="flex items-center gap-4">
                                <SettingsIcon className="w-6 h-6 text-content-200" />
                                <span className="font-bold text-content-100">My Weekly Split</span>
                            </div>
                            <ChevronRightIcon className="w-5 h-5 text-content-200" />
                        </button>

                    </div>
                </div>
                
                <ThemeSelector />

            </main>
        </motion.div>
    );
};

export default ProfileView;
