import React from 'react';
import { motion } from 'framer-motion';
import { useWorkoutStore } from '../store/useWorkoutStore';
import { WorkoutIcon, ProgressIcon, CalendarIcon, ProfileIcon } from './icons';

const navItems = [
  { view: 'workout', label: 'Workout', icon: WorkoutIcon },
  { view: 'schedule', label: 'Schedule', icon: CalendarIcon },
  { view: 'progress', label: 'Progress', icon: ProgressIcon },
  { view: 'profile', label: 'Profile', icon: ProfileIcon },
];

const BottomNav = () => {
  const { activeView, setActiveView } = useWorkoutStore();

  return (
    <footer className="fixed bottom-0 left-0 right-0 h-20 bg-base-100/90 backdrop-blur-lg border-t border-base-300 z-10">
      <nav className="grid grid-cols-4 h-full">
        {navItems.map(({ view, label, icon: Icon }) => {
          const isActive = activeView === view || (view === 'workout' && activeView === 'temporary_day');
          return (
            <button
              key={view}
              onClick={() => setActiveView(view)}
              className="flex flex-col items-center justify-center text-xs font-medium transition-colors duration-200 relative"
            >
              <Icon className={`w-6 h-6 mb-1 transition-colors ${isActive ? 'text-brand-primary' : 'text-content-200'}`} />
              <span className={isActive ? 'text-brand-primary' : 'text-content-200'}>{label}</span>
              {isActive && (
                <motion.div
                  layoutId="active-nav-indicator"
                  className="absolute top-0 h-1 w-1/2 bg-brand-primary rounded-b-full"
                />
              )}
            </button>
          );
        })}
      </nav>
    </footer>
  );
};

export default BottomNav;
