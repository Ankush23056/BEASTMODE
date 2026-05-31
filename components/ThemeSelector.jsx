import React from 'react';
import { motion } from 'framer-motion';
import { useWorkoutStore } from '../store/useWorkoutStore';
import { themes } from '../utils/themeManager';

const ThemeChip = ({ theme, isActive, onClick }) => {
    return (
        <motion.button
            onClick={onClick}
            className={`
                flex-shrink-0 px-5 py-2 rounded-full border-2 font-bold text-sm transition-colors duration-200
                ${isActive
                    ? 'bg-brand-primary text-base-100 border-transparent'
                    : 'bg-transparent border-base-300 text-content-200 hover:border-content-100'
                }
            `}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
        >
            {theme.name}
        </motion.button>
    );
};


const ThemeSelector = () => {
    const { activeTheme, setTheme } = useWorkoutStore(s => ({
        activeTheme: s.activeTheme,
        setTheme: s.setTheme,
    }));

    return (
        <div>
            <h2 className="text-lg font-semibold text-content-200 mb-3 uppercase tracking-wider">Custom Theme</h2>
            <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                {themes.map(theme => (
                    <ThemeChip
                        key={theme.id}
                        theme={theme}
                        isActive={activeTheme === theme.id}
                        onClick={() => setTheme(theme.id)}
                    />
                ))}
            </div>
        </div>
    );
};

export default ThemeSelector;
