import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWorkoutStore } from '../store/useWorkoutStore';
import Header from './Header';

import ExerciseManager from './ExerciseManager';
import SplitSelectionModal from './SplitSelectionModal';
import { ChevronRightIcon, LightningIcon, WorkoutIcon, TrashIcon, SaveIcon, XIcon, PlusCircleIcon } from './icons';

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const dayIcons = {
  chest_shoulders_triceps: WorkoutIcon,
  back_biceps: WorkoutIcon,
  quads_hamstrings_calves: WorkoutIcon,
  chest_back: WorkoutIcon,
  glutes_legs_core: WorkoutIcon,
  recovery: LightningIcon,
  rest_day: LightningIcon,
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 },
};

const DayCard = ({ dayIndex, split, onClick }) => {
    const Icon = split ? dayIcons[split.id] || WorkoutIcon : WorkoutIcon;
    const displayName = split ? split.name : 'Rest Day';

    return (
        <motion.button
            variants={itemVariants}
            onClick={onClick}
            className="w-full flex items-center justify-between text-left p-4 bg-base-200 rounded-2xl backdrop-blur-lg border border-base-300 hover:border-brand-primary transition-colors"
        >
            <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-base-300">
                   <Icon className="w-6 h-6 text-brand-primary" />
                </div>
                <div>
                    <p className="font-bold text-content-100">{daysOfWeek[dayIndex]}</p>
                    <p className="text-content-200 text-sm">{displayName}</p>
                </div>
            </div>
            <ChevronRightIcon className="w-5 h-5 text-content-200" />
        </motion.button>
    );
};

const pageVariants = {
  initial: { opacity: 0, x: '100%' },
  in: { opacity: 1, x: 0 },
  out: { opacity: 0, x: '-50%' },
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.5,
};

const TempDayEditor = ({ 
    tempSplit, 
    workoutSplits, 
    onBack, 
    saveTempSplit, 
    importSplitToTempConfig, 
    initializeEmptyTempSplit, 
    launchTempSession 
}) => {
    
    const [localSplit, setLocalSplit] = useState(
        tempSplit ? JSON.parse(JSON.stringify(tempSplit)) : null
    );
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    React.useEffect(() => {
        setLocalSplit(tempSplit ? JSON.parse(JSON.stringify(tempSplit)) : null);
    }, [tempSplit]);

    const handleImport = (splitId) => {
        if (splitId) {
            importSplitToTempConfig(splitId);
        }
        setIsImportModalOpen(false);
    };

    const handleCreateScratch = () => {
        initializeEmptyTempSplit();
    };

    const handleAddExercise = () => {
        if (!localSplit) return;
        const newEx = {
            id: `temp-ex-${Date.now()}`,
            name: 'New Custom Exercise',
            muscle: 'Full Body',
            sets: '3',
            reps: '10',
            intensity: null,
            notes: ''
        };
        setLocalSplit({
            ...localSplit,
            exercises: [...localSplit.exercises, newEx]
        });
    };

    const handleUpdateExercise = (exId, field, val) => {
        if (!localSplit) return;
        setLocalSplit({
            ...localSplit,
            exercises: localSplit.exercises.map(ex => 
                ex.id === exId ? { ...ex, [field]: val } : ex
            )
        });
    };

    const handleRemoveExercise = (exId) => {
        if (!localSplit) return;
        setLocalSplit({
            ...localSplit,
            exercises: localSplit.exercises.filter(ex => ex.id !== exId)
        });
    };

    const handleNameChange = (newName) => {
        if (!localSplit) return;
        setLocalSplit({
            ...localSplit,
            name: newName
        });
    };

    const handleMoveUp = (index) => {
        if (!localSplit || index === 0) return;
        const newExs = [...localSplit.exercises];
        const temp = newExs[index];
        newExs[index] = newExs[index - 1];
        newExs[index - 1] = temp;
        setLocalSplit({
            ...localSplit,
            exercises: newExs
        });
    };

    const handleMoveDown = (index) => {
        if (!localSplit || index === localSplit.exercises.length - 1) return;
        const newExs = [...localSplit.exercises];
        const temp = newExs[index];
        newExs[index] = newExs[index + 1];
        newExs[index + 1] = temp;
        setLocalSplit({
            ...localSplit,
            exercises: newExs
        });
    };

    const handleSave = () => {
        saveTempSplit(localSplit);
        onBack();
    };

    const handleClear = () => {
        if (window.confirm("Are you sure you want to clear/reset the temporary day split configuration?")) {
            saveTempSplit(null);
        }
    };

    return (
        <div className="bg-base-100 min-h-screen text-content-100 flex flex-col pb-12">
            <header className="p-4 flex items-center justify-between sticky top-0 bg-base-100/90 backdrop-blur z-20 border-b border-base-300">
                <div className="flex items-center gap-2">
                    <LightningIcon className="w-6 h-6 text-brand-primary animate-pulse" />
                    <div>
                        <span className="text-[10px] text-brand-primary tracking-widest font-mono uppercase font-bold">SANDBOX CONFIG</span>
                        <h2 className="text-lg font-bold uppercase tracking-wide">TEMPORARY DAY</h2>
                    </div>
                </div>
                <button onClick={onBack} className="p-2 text-content-200 hover:text-content-100">
                    <XIcon className="w-6 h-6" />
                </button>
            </header>

            <main className="flex-grow p-4 md:px-6 lg:px-8 space-y-6 max-w-2xl mx-auto w-full">
                {!localSplit ? (
                    <div className="py-12 text-center max-w-sm mx-auto space-y-8">
                        <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center mx-auto">
                            <LightningIcon className="w-8 h-8 text-brand-primary" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-content-100 mb-2 uppercase tracking-wide">Blank Sandbox Canvas</h3>
                            <p className="text-sm text-content-200">
                                Set up a transient, ad-hoc routine. Custom exercises run completely isolated from standard automated schedules.
                            </p>
                        </div>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleCreateScratch}
                                className="w-full bg-base-200 hover:bg-base-300 border border-base-300 text-content-100 font-bold py-4 rounded-xl transition-all font-mono tracking-wider text-xs uppercase"
                            >
                                Build from Scratch
                            </button>
                            <button
                                onClick={() => setIsImportModalOpen(true)}
                                className="w-full bg-brand-primary hover:bg-brand-secondary text-base-100 font-bold py-4 rounded-xl transition-all shadow-lg font-mono tracking-wider text-xs uppercase"
                            >
                                Import Baseline Split
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Title Editor */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] text-content-200 font-bold tracking-widest uppercase">Routine Name</label>
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={localSplit.name.replace(' [Ad-Hoc]', '')}
                                    onChange={(e) => handleNameChange(e.target.value)}
                                    placeholder="Temporary Workout Title..."
                                    className="flex-grow bg-base-200 text-content-100 rounded-xl px-4 py-3 border border-base-300 focus:outline-none focus:ring-1 focus:ring-brand-primary font-medium" 
                                />
                                <button
                                    onClick={() => setIsImportModalOpen(true)}
                                    className="px-4 bg-base-200 hover:bg-base-300 border border-base-300 rounded-xl text-xs font-semibold uppercase tracking-wider text-content-100 font-mono"
                                >
                                    [IMPORT SPLIT]
                                </button>
                            </div>
                        </div>

                        {/* Exercise Manager List */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-content-200 text-xs tracking-widest uppercase">
                                    EXERCISES ({localSplit.exercises.length})
                                </h3>
                                <button
                                    onClick={handleClear}
                                    className="text-xs text-brand-alert/80 hover:text-brand-alert font-bold uppercase tracking-wider font-mono text-content-200 hover:text-red-500 transition-colors"
                                >
                                    Reset Canvas
                                </button>
                            </div>

                            <div className="space-y-3">
                                {localSplit.exercises.map((ex, index) => (
                                    <div key={ex.id} className="relative bg-base-200 p-4 rounded-2xl border border-base-300 space-y-3">
                                        <div className="flex items-center justify-between gap-2">
                                            {/* Re-ordering indicators */}
                                            <div className="flex items-center gap-1">
                                                <button 
                                                    disabled={index === 0}
                                                    onClick={() => handleMoveUp(index)}
                                                    className="p-1 hover:bg-base-300 rounded text-content-200 disabled:opacity-30 text-xs"
                                                >
                                                    ▲
                                                </button>
                                                <button 
                                                    disabled={index === localSplit.exercises.length - 1}
                                                    onClick={() => handleMoveDown(index)}
                                                    className="p-1 hover:bg-base-300 rounded text-content-200 disabled:opacity-30 text-xs"
                                                >
                                                    ▼
                                                </button>
                                            </div>

                                            {/* Exercise Name Input */}
                                            <input 
                                                type="text" 
                                                value={ex.name}
                                                onChange={(e) => handleUpdateExercise(ex.id, 'name', e.target.value)}
                                                placeholder="Exercise Name..."
                                                className="flex-grow bg-transparent text-content-100 font-bold focus:outline-none text-sm placeholder-content-300 px-1" 
                                            />
                                        </div>

                                        {/* Row of Inputs: Sets, Reps, Muscle */}
                                        <div className="grid grid-cols-3 gap-2">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] text-content-200 uppercase font-mono font-bold tracking-wider mb-1">Sets</span>
                                                <input 
                                                    type="text" 
                                                    value={ex.sets}
                                                    onChange={(e) => handleUpdateExercise(ex.id, 'sets', e.target.value)}
                                                    className="bg-base-300 text-content-100 text-xs rounded p-2 focus:outline-none" 
                                                />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[9px] text-content-200 uppercase font-mono font-bold tracking-wider mb-1">Reps</span>
                                                <input 
                                                    type="text" 
                                                    value={ex.reps}
                                                    onChange={(e) => handleUpdateExercise(ex.id, 'reps', e.target.value)}
                                                    className="bg-base-300 text-content-100 text-xs rounded p-2 focus:outline-none" 
                                                />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[9px] text-content-200 uppercase font-mono font-bold tracking-wider mb-1">Muscle</span>
                                                <input 
                                                    type="text" 
                                                    value={ex.muscle}
                                                    onChange={(e) => handleUpdateExercise(ex.id, 'muscle', e.target.value)}
                                                    className="bg-base-300 text-content-100 text-xs rounded p-2 focus:outline-none" 
                                                />
                                            </div>
                                        </div>

                                        {/* Optional Form Notes Input */}
                                        <div className="flex flex-col">
                                            <span className="text-[9px] text-content-200 uppercase font-mono font-bold tracking-wider mb-1">Form Notes / Cue</span>
                                            <input 
                                                type="text" 
                                                value={ex.notes || ''}
                                                placeholder="e.g. Keep spine flat, squeeze at top..."
                                                onChange={(e) => handleUpdateExercise(ex.id, 'notes', e.target.value)}
                                                className="bg-base-300 text-content-100 text-xs rounded p-2 focus:outline-none text-content-200 placeholder-content-300" 
                                            />
                                        </div>
                                    </div>
                                ))}

                                {/* Add New Exercise trigger */}
                                <button
                                    onClick={handleAddExercise}
                                    className="w-full bg-base-200 hover:bg-base-300 text-content-100 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors border border-dashed border-base-300 text-sm"
                                >
                                    <PlusCircleIcon className="w-5 h-5 text-brand-primary" />
                                    <span className="uppercase tracking-wider text-xs font-mono">Add Custom Exercise</span>
                                </button>
                            </div>
                        </div>
                        
                        {/* Save Footer button */}
                        <div className="pt-4 flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={handleSave}
                                className="flex-1 bg-base-300 hover:bg-base-200 border border-base-400 text-content-100 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all font-mono tracking-widest text-xs uppercase"
                            >
                                <SaveIcon className="w-5 h-5" />
                                Save & Back
                            </button>
                            <button
                                onClick={() => {
                                    saveTempSplit(localSplit);
                                    launchTempSession();
                                }}
                                className="flex-1 bg-gradient-to-r from-brand-primary to-teal-400 hover:opacity-95 text-base-100 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg font-mono tracking-widest text-xs uppercase"
                            >
                                <LightningIcon className="w-5 h-5 animate-pulse text-base-100" />
                                Launch Session
                            </button>
                        </div>
                    </div>
                )}
            </main>

            <SplitSelectionModal 
                isOpen={isImportModalOpen} 
                onClose={() => setIsImportModalOpen(false)} 
                onSelectSplit={handleImport} 
            />
        </div>
    );
};

const RoutineEditorView = () => {
    const [editingSplitId, setEditingSplitId] = useState(null);
    const [editingDay, setEditingDay] = useState(null);
    const [isEditingTempDay, setIsEditingTempDay] = useState(false);

    const { 
        workoutSplits, 
        weeklySchedule, 
        updateDayAssignment,
        tempSplit,
        saveTempSplit,
        importSplitToTempConfig,
        initializeEmptyTempSplit,
        launchTempSession
    } = useWorkoutStore();

    const editingSplit = workoutSplits.find(s => s.id === editingSplitId);

    const handleSelectSplitForDay = (splitId) => {
        if (editingDay !== null) {
            updateDayAssignment(editingDay, splitId);
            setEditingDay(null);
        }
    };

    return (
        <>
            <AnimatePresence mode="wait">
                {isEditingTempDay ? (
                    <motion.div
                        key="temp_editor"
                        variants={pageVariants}
                        initial="initial"
                        animate="in"
                        exit="out"
                        transition={pageTransition}
                    >
                        <TempDayEditor 
                            tempSplit={tempSplit}
                            workoutSplits={workoutSplits}
                            onBack={() => setIsEditingTempDay(false)}
                            saveTempSplit={saveTempSplit}
                            importSplitToTempConfig={importSplitToTempConfig}
                            initializeEmptyTempSplit={initializeEmptyTempSplit}
                            launchTempSession={launchTempSession}
                        />
                    </motion.div>
                ) : !editingSplitId ? (
                    <motion.div
                        key="overview"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <Header title="My Weekly Split" />
                        <motion.main 
                            className="p-4 md:px-6 lg:px-8 space-y-3 container mx-auto"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            {daysOfWeek.map((_, index) => {
                                const splitId = weeklySchedule[index];
                                const split = workoutSplits.find(s => s.id === splitId) || null;
                                return (
                                    <DayCard
                                        key={index}
                                        dayIndex={index}
                                        split={split}
                                        onClick={() => {
                                            if (split) {
                                                setEditingSplitId(split.id);
                                            } else {
                                                setEditingDay(index);
                                            }
                                        }}
                                    />
                                );
                            })}

                            {/* DEDICATED TEMPORARY DAY CONFIG SLOT */}
                            <motion.button
                                variants={itemVariants}
                                onClick={() => setIsEditingTempDay(true)}
                                className="w-full flex items-center justify-between text-left p-4 bg-gradient-to-r from-teal-500/10 to-brand-primary/10 rounded-2xl backdrop-blur-lg border border-brand-primary/20 hover:border-brand-primary/60 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-2 rounded-lg bg-base-300">
                                        <LightningIcon className="w-6 h-6 text-brand-primary animate-pulse" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-content-100 flex items-center gap-1.5">
                                            TEMPORARY DAY
                                            <span className="text-[9px] font-mono tracking-widest bg-brand-primary/20 text-brand-primary px-1.5 py-0.5 rounded uppercase font-bold">SANDBOX</span>
                                        </p>
                                        <p className="text-content-200 text-sm">
                                            {tempSplit ? tempSplit.name.replace(' [Ad-Hoc]', '') : 'Not configured (tap to initialize)'}
                                        </p>
                                    </div>
                                </div>
                                <ChevronRightIcon className="w-5 h-5 text-content-200" />
                            </motion.button>
                        </motion.main>
                    </motion.div>
                ) : (
                    <motion.div
                        key="editor"
                        variants={pageVariants}
                        initial="initial"
                        animate="in"
                        exit="out"
                        transition={pageTransition}
                    >
                        {editingSplit && (
                            <ExerciseManager 
                                split={editingSplit} 
                                onBack={() => setEditingSplitId(null)}
                            />
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
            <SplitSelectionModal 
                isOpen={editingDay !== null}
                onClose={() => setEditingDay(null)}
                onSelectSplit={handleSelectSplitForDay}
            />
        </>
    );
};

export default RoutineEditorView;
