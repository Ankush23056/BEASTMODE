import React, { useState } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { useWorkoutStore } from '../store/useWorkoutStore';
import { GripVerticalIcon, TrashIcon, LightningIcon, XIcon, SaveIcon, PlusCircleIcon, InfoIcon, LinkIcon } from './icons';

import IntensityInfoModal from './IntensityInfoModal';

const LabeledInput = ({ label, value, onChange, className, placeholder }) => (
    <div className="flex flex-col">
        <label className="text-[10px] text-content-200 font-bold tracking-widest uppercase mb-1.5">{label}</label>
        <div className="bg-base-300 rounded-lg p-1">
            <input 
                type="text" 
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`w-full bg-transparent text-content-100 p-2 text-sm font-medium border-none focus:outline-none focus:ring-0 ${className}`} 
            />
        </div>
    </div>
);

const IntensityToggle = ({ value, onChange, onOpenInfo }) => {
  const tags = ['HEAVY', 'VOLUME'];
  return (
    <div className="flex items-center gap-4">
       <div className="flex items-center gap-1.5">
           <label className="text-[10px] text-content-200 font-bold tracking-widest uppercase">INTENSITY</label>
           <button onClick={onOpenInfo} className="text-brand-primary opacity-80 hover:opacity-100">
                <InfoIcon className="w-3.5 h-3.5" />
           </button>
       </div>
       <div className="flex gap-2">
        {tags.map(tag => {
          const isActive = value === tag;
          return (
            <button
              key={tag}
              onClick={() => onChange(isActive ? null : tag)}
              className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded transition-all duration-200 ${
                isActive 
                    ? 'bg-brand-primary text-base-100 shadow-lg shadow-brand-primary/20' 
                    : 'bg-base-300 text-content-200 hover:bg-base-300/80 border border-transparent'
              }`}
            >
              {tag}
            </button>
          );
        })}
       </div>
    </div>
  );
};


const SortableExerciseItem = ({ 
  exercise, isLinkedToNext, isLinkedFromPrev, hasNext, 
  onUpdate, onRemove, onOpenInfo, onToggleSuperset 
}) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: exercise.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 'auto',
    };

    let containerClasses = "relative bg-base-200 p-5 ";
    if (isDragging) {
        containerClasses += "shadow-2xl ring-1 ring-brand-primary rounded-2xl mb-4";
    } else {
        if (isLinkedToNext && isLinkedFromPrev) {
             containerClasses += "border-x-2 border-[#99ff00] rounded-none mb-0 border-y border-y-[#99ff00]/20";
        } else if (isLinkedToNext) {
             containerClasses += "border-x-2 border-t-2 border-[#99ff00] rounded-t-2xl rounded-b-none mb-0 border-b border-b-[#99ff00]/20";
        } else if (isLinkedFromPrev) {
             containerClasses += "border-x-2 border-b-2 border-[#99ff00] rounded-b-2xl rounded-t-none mb-4 border-t-0";
        } else {
             containerClasses += "border border-white/5 rounded-2xl mb-4";
        }
    }

    return (
        <div ref={setNodeRef} style={style} className={containerClasses}>
            {/* Header Row: Drag, Name, Delete... and Link Superset */}
            <div className="flex flex-row items-center justify-between w-full min-w-0 mb-5">
                <div className="flex items-center gap-2 min-w-0 shrink">
                    <div {...attributes} {...listeners} className="cursor-grab touch-none text-content-300 hover:text-content-100 transition-colors shrink-0">
                        <GripVerticalIcon className="w-5 h-5" />
                    </div>
                    <input
                        type="text"
                        value={exercise.name}
                        onChange={(e) => onUpdate('name', e.target.value)}
                        placeholder="Exercise Name"
                        className="bg-transparent text-sm sm:text-base md:text-lg text-content-100 font-bold focus:outline-none placeholder-content-300 truncate min-w-0 w-full"
                    />
                </div>
                <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto">
                    {hasNext && (
                        <button 
                            onClick={onToggleSuperset} 
                            className={`flex-shrink-0 text-[9px] sm:text-[10px] leading-none uppercase font-mono font-bold tracking-wider px-2 py-1 flex items-center gap-1 rounded transition-colors ${isLinkedToNext ? 'bg-[#99ff00]/10 text-[#99ff00] border border-[#99ff00]/30' : 'text-content-300 hover:bg-base-300/50 border border-transparent'}`}
                        >
                            <LinkIcon className="w-3 h-3 flex-shrink-0" />
                            {isLinkedToNext ? (
                                <span>LINKED</span>
                            ) : (
                                <div className="flex flex-col text-left leading-none gap-0.5">
                                    <span>LINK</span>
                                    <span>SUPERSET</span>
                                </div>
                            )}
                        </button>
                    )}
                    <button onClick={onRemove} className="text-content-300 hover:text-brand-alert transition-colors p-1 shrink-0">
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Intensity Row */}
            <div className="mb-5 flex justify-between items-center">
                <IntensityToggle 
                    value={exercise.intensity}
                    onChange={(val) => onUpdate('intensity', val)}
                    onOpenInfo={onOpenInfo}
                />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3 mb-4">
                <LabeledInput label="SETS" value={exercise.sets} onChange={(e) => onUpdate('sets', e.target.value)} />
                <LabeledInput label="REPS" value={exercise.reps} onChange={(e) => onUpdate('reps', e.target.value)} />
                <LabeledInput label="MUSCLE" value={exercise.muscle} onChange={(e) => onUpdate('muscle', e.target.value)} />
            </div>

            {/* Form Note */}
             <div className="flex flex-col">
                <label className="text-[10px] text-content-200 font-bold tracking-widest uppercase mb-1.5">FORM NOTE</label>
                <div className="bg-base-300 rounded-lg p-1">
                    <input 
                        type="text" 
                        value={exercise.notes || ''} 
                        onChange={(e) => onUpdate('notes', e.target.value)} 
                        placeholder="Add form cues..."
                        className="w-full bg-transparent text-content-100 p-2 text-sm font-medium border-none focus:outline-none focus:ring-0 placeholder-content-300" 
                    />
                </div>
            </div>
            
            {isLinkedToNext && !isDragging && (
                 <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 z-10 w-8 h-5 flex items-center justify-center bg-base-100 border border-[#99ff00] rounded-full text-[#99ff00]">
                      <LinkIcon className="w-3 h-3" />
                 </div>
            )}
        </div>
    );
};


const ExerciseManager = ({ split, onBack }) => {
    const [editedSplit, setEditedSplit] = useState(JSON.parse(JSON.stringify(split)));
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const { saveWorkoutSplit, weeklySchedule } = useWorkoutStore(s => ({
        saveWorkoutSplit: s.saveWorkoutSplit,
        weeklySchedule: s.weeklySchedule,
    }));
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
    
    const dayOfWeek = Object.keys(weeklySchedule).find(key => weeklySchedule[parseInt(key)] === split.id);
    const dayName = dayOfWeek ? ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][parseInt(dayOfWeek)] : '';

    const handleFieldChange = (field, value) => {
        setEditedSplit(prev => ({ ...prev, [field]: value }));
    };

    const handleExerciseUpdate = (exerciseId, field, value) => {
        setEditedSplit(prev => ({
            ...prev,
            exercises: prev.exercises.map(ex => {
                if (ex.id === exerciseId) {
                    const updatedEx = { ...ex, [field]: value };
                    if (field === 'intensity') {
                        if (value === 'HEAVY') {
                            updatedEx.reps = '6-8';
                        } else if (value === 'VOLUME') {
                            updatedEx.reps = '12-15';
                        }
                    }
                    return updatedEx;
                }
                return ex;
            })
        }));
    };

    const handleAddExercise = () => {
        const newExercise = {
            id: `new-${Date.now()}`,
            name: 'New Exercise',
            muscle: 'Muscle',
            sets: '3',
            reps: '10',
            intensity: null
        };
        setEditedSplit(prev => ({ ...prev, exercises: [...prev.exercises, newExercise] }));
    };
    
    const handleRemoveExercise = (exerciseId) => {
        setEditedSplit(prev => ({ ...prev, exercises: prev.exercises.filter(ex => ex.id !== exerciseId) }));
    };
    
    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        setEditedSplit(prev => {
            const oldIndex = prev.exercises.findIndex(ex => ex.id === active.id);
            const newIndex = prev.exercises.findIndex(ex => ex.id === over.id);
            return { ...prev, exercises: arrayMove(prev.exercises, oldIndex, newIndex) };
        });
    };
    
    const handleSaveChanges = () => {
        saveWorkoutSplit(editedSplit);
        onBack();
    };

    return (
        <div className="bg-base-100 min-h-screen text-content-100 font-sans flex flex-col">
            <header className="p-6 flex items-center justify-between sticky top-0 bg-base-100/95 backdrop-blur-sm z-20 border-b border-white/5">
                <div className="flex items-center gap-4">
                    <LightningIcon className="w-6 h-6 text-brand-primary" />
                    <div className="flex flex-col">
                        <h1 className="font-bold text-xl text-content-100 uppercase tracking-wide leading-none">
                            REPROGRAM
                        </h1>
                        <h1 className="font-bold text-xl text-content-100 uppercase tracking-wide leading-none">
                            {dayName}
                        </h1>
                    </div>
                </div>
                <button onClick={onBack} className="p-2 -mr-2 text-content-200 hover:text-content-100">
                    <XIcon className="w-6 h-6" />
                </button>
            </header>

            <main className="flex-grow px-6 py-6 space-y-8 overflow-y-auto">
                {/* Header Section: Emoji & Name */}
                <div className="flex gap-4">
                    <div className="flex-shrink-0">
                        <label className="block text-[10px] text-content-200 font-bold tracking-widest uppercase mb-2">EMOJI</label>
                        <div className="w-16 h-14 bg-base-200 rounded-xl flex items-center justify-center border border-white/5">
                            <LightningIcon className="w-8 h-8 text-brand-primary"/>
                        </div>
                    </div>
                    <div className="flex-grow">
                        <label className="block text-[10px] text-content-200 font-bold tracking-widest uppercase mb-2">DAY NAME</label>
                        <input 
                            type="text" 
                            value={editedSplit.name}
                            onChange={(e) => handleFieldChange('name', e.target.value)}
                            className="w-full h-14 bg-base-200 text-content-100 rounded-xl px-4 border border-white/5 focus:outline-none focus:ring-1 focus:ring-brand-primary font-medium" 
                        />
                    </div>
                </div>
                
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-content-200 text-sm tracking-widest uppercase">EXERCISES ({editedSplit.exercises.length})</h3>
                    </div>
                    
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={editedSplit.exercises.map(ex => ex.id)} strategy={verticalListSortingStrategy}>
                            {editedSplit.exercises.map((exercise, index) => {
                                const nextExercise = editedSplit.exercises[index + 1];
                                const isLinkedToNext = exercise.supersetWith === nextExercise?.id;
                                const prevExercise = editedSplit.exercises[index - 1];
                                const isLinkedFromPrev = prevExercise?.supersetWith === exercise.id;

                                return (
                                    <SortableExerciseItem
                                        key={exercise.id}
                                        exercise={exercise}
                                        isLinkedToNext={!!isLinkedToNext}
                                        isLinkedFromPrev={!!isLinkedFromPrev}
                                        hasNext={!!nextExercise}
                                        onUpdate={(field, value) => handleExerciseUpdate(exercise.id, field, value)}
                                        onRemove={() => handleRemoveExercise(exercise.id)}
                                        onOpenInfo={() => setIsInfoModalOpen(true)}
                                        onToggleSuperset={() => {
                                            if (nextExercise) {
                                                handleExerciseUpdate(exercise.id, 'supersetWith', isLinkedToNext ? null : nextExercise.id);
                                            }
                                        }}
                                    />
                                );
                            })}
                        </SortableContext>
                    </DndContext>
                </div>
            </main>

            <footer className="p-6 bg-base-100 border-t border-white/5 space-y-4">
                <button
                    onClick={handleAddExercise}
                    className="w-full bg-base-200 hover:bg-base-300 text-content-100 font-bold py-4 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors border border-white/5"
                >
                    <PlusCircleIcon className="w-5 h-5 text-brand-primary" />
                    <span className="uppercase tracking-wider text-sm">Add Exercise</span>
                </button>
                
                <button
                    onClick={handleSaveChanges}
                    className="w-full bg-brand-primary hover:bg-brand-secondary text-base-100 font-bold py-4 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-brand-primary/20"
                >
                    <SaveIcon className="w-5 h-5" />
                    <span className="uppercase tracking-wider text-sm">Save Changes</span>
                </button>
            </footer>
            <IntensityInfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} />
        </div>
    );
};

export default ExerciseManager;
