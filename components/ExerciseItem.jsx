import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckIcon, SwapIcon, ChevronRightIcon, EditIcon } from './icons';
import { useWorkoutStore } from '../store/useWorkoutStore';
import EditExerciseModal from './EditExerciseModal';

const ExerciseItem = (props) => {
  const { exercise, originalExerciseId, isCompleted, onInitiateSubstitution, suggestion, focusSetIndex } = props;
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { logSet, dailyLog, exerciseNotes, saveExerciseNote, workoutHistory, updateExerciseInSession } = useWorkoutStore(s => {
      const isTemp = s.activeView === 'temporary_day';
      return { 
          logSet: isTemp ? s.logTempSet : s.logSet, 
          dailyLog: isTemp ? s.tempDailyLog : s.dailyLog,
          exerciseNotes: s.userMetrics.exerciseNotes || {},
          saveExerciseNote: s.saveExerciseNote,
          workoutHistory: s.userMetrics.workoutHistory || [],
          updateExerciseInSession: isTemp ? s.updateExerciseInSessionTemp : s.updateExerciseInSession
      };
  });
  
  const pastLogForExercise = [...workoutHistory]
      .reverse()
      .find(log => log.performance && log.performance[originalExerciseId])
      ?.performance[originalExerciseId];

  const getPlaceholders = (index) => {
      const historicalSet = pastLogForExercise?.sets[index];
      const fbWeight = suggestion?.weight?.toString() ?? exercise.weight?.toString() ?? '0';
      const fbReps = exercise.intensity === 'HEAVY' ? '6-8' : (exercise.intensity === 'VOLUME' ? '12-15' : exercise.reps);
      
      const pWeight = historicalSet?.weight?.toString() ?? fbWeight;
      const pReps = historicalSet?.reps?.toString() ?? fbReps;
      
      const pDropWeight = historicalSet?.dropSets?.[0]?.weight?.toString() ?? "Weight";
      const pDropReps = historicalSet?.dropSets?.[0]?.reps?.toString() ?? "AMRAP";

      return { pWeight, pReps, pDropWeight, pDropReps };
  };
  
  const numSets = isNaN(parseInt(exercise.sets, 10)) ? 1 : parseInt(exercise.sets, 10);
  
  const performanceForThisExercise = dailyLog?.performance[originalExerciseId];

  const initialSets = Array.from({ length: numSets }, (_, i) => {
      const loggedSet = performanceForThisExercise?.sets[i];
      const firstDropSet = loggedSet?.dropSets?.[0];
      return {
          reps: loggedSet?.reps != null ? loggedSet.reps.toString() : '',
          weight: loggedSet?.weight != null ? loggedSet.weight.toString() : '',
          dropReps: firstDropSet?.reps != null ? firstDropSet.reps.toString() : '',
          dropWeight: firstDropSet?.weight != null ? firstDropSet.weight.toString() : '',
          showDropSet: !!firstDropSet,
      }
  });

  const [setsData, setSetsData] = useState(initialSets);
  const weightInputRefs = useRef([]);
  const repsInputRefs = useRef([]);

  useEffect(() => {
    weightInputRefs.current = weightInputRefs.current.slice(0, numSets);
    repsInputRefs.current = repsInputRefs.current.slice(0, numSets);
  }, [numSets]);

  useEffect(() => {
    if (focusSetIndex !== null && focusSetIndex !== undefined) {
        weightInputRefs.current[focusSetIndex]?.focus();
        weightInputRefs.current[focusSetIndex]?.select();
    }
  }, [focusSetIndex]);

  const handleSetChange = (index, field, value) => {
    const newSets = [...setsData];
    newSets[index] = { ...newSets[index], [field]: value };
    setSetsData(newSets);
  };
  
  const handleToggleDropSet = (index) => {
      const newSets = [...setsData];
      newSets[index] = { ...newSets[index], showDropSet: !newSets[index].showDropSet };
      if (!newSets[index].showDropSet) {
          newSets[index].dropReps = '';
          newSets[index].dropWeight = '';
      }
      setSetsData(newSets);
  };
  
  const handleLogSet = (index) => {
    const currentSet = setsData[index];
    const ph = getPlaceholders(index);
    
    const finalRepsStr = currentSet.reps.trim() !== '' ? currentSet.reps : ph.pReps;
    const finalWeightStr = currentSet.weight.trim() !== '' ? currentSet.weight : ph.pWeight;
    
    const parsedReps = parseInt(finalRepsStr, 10);
    if (isNaN(parsedReps)) {
        repsInputRefs.current[index]?.focus();
        return;
    }
    
    let parsedWeight = parseFloat(finalWeightStr);
    if (isNaN(parsedWeight)) {
        parsedWeight = 0;
    }

    const setData = {
        reps: parsedReps,
        weight: parsedWeight
    };
    
    if (setData.weight > 2000 || setData.reps > 2000) {
        if (!window.confirm(`Sanity Check: Are you sure you want to log a weight of ${setData.weight}kg and ${setData.reps} reps?`)) {
            return;
        }
    }

    if (currentSet.showDropSet) {
        const finalDropWeightStr = currentSet.dropWeight.trim() !== '' ? currentSet.dropWeight : ph.pDropWeight;
        const finalDropRepsStr = currentSet.dropReps.trim() !== '' ? currentSet.dropReps : ph.pDropReps;
        
        const dropReps = parseInt(finalDropRepsStr, 10);
        const dropWeight = isNaN(parseFloat(finalDropWeightStr)) ? 0 : parseFloat(finalDropWeightStr);
        
        if (!isNaN(dropReps) && !isNaN(dropWeight)) {
            if (dropWeight > 2000 || dropReps > 2000) {
                if (!window.confirm(`Sanity Check: Are you sure you want to log a drop set weight of ${dropWeight}kg and ${dropReps} reps?`)) {
                    return;
                }
            }
            setData.dropSets = [{ reps: dropReps, weight: dropWeight }];
        } else if (currentSet.dropReps.trim() === '' && isNaN(parseInt(ph.pDropReps, 10))) {
             return; // Requires valid input
        }
    }

    const isFinalSet = index === numSets - 1;
    logSet(originalExerciseId, index, setData, isFinalSet);
  };
  
  const isSetLogged = (index) => {
    return !!(performanceForThisExercise && performanceForThisExercise.sets[index]);
  };
  
  const repsToDisplay = exercise.intensity === 'HEAVY' ? '6-8' : (exercise.intensity === 'VOLUME' ? '12-15' : exercise.reps);

  return (
    <motion.div layout className="bg-base-200 rounded-2xl border border-base-300 overflow-hidden">
        <div 
            onClick={() => !isCompleted && setIsExpanded(!isExpanded)}
            className={`flex items-center p-4 transition-colors ${!isCompleted ? 'cursor-pointer' : ''} ${isExpanded ? 'bg-base-300/60' : 'hover:bg-base-300/60'}`}
        >
            <div className="flex-grow flex items-center" style={{ opacity: isCompleted ? 0.5 : 1 }}>
              <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${isCompleted ? 'bg-brand-primary border-brand-primary' : 'bg-transparent border-base-300'}`}>
                {isCompleted && <CheckIcon className="w-5 h-5 text-base-100" />}
              </div>
              <div className="flex-grow mx-3">
                <p className="font-bold text-base sm:text-lg text-content-100 leading-tight">{exercise.name}</p>
                <p className="text-sm text-content-200 tracking-wider uppercase">{exercise.muscle}</p>
                {exercise.notes && !isExpanded && (
                    <p className="text-xs text-[#FF8C00] mt-1 font-bold tracking-wider uppercase font-mono">
                        {exercise.notes}
                    </p>
                )}
              </div>
              <div className="text-right mr-2">
                <p className="font-semibold text-content-100 font-mono whitespace-nowrap">{repsToDisplay}</p>
                <p className="text-sm text-content-200 tracking-wider whitespace-nowrap">{exercise.sets} sets</p>
              </div>
            </div>
            {!isCompleted && (
                <div className="flex items-center">
                    <ChevronRightIcon className={`w-6 h-6 text-content-200 transition-transform pointer-events-none ${isExpanded ? 'rotate-90' : ''}`} />
                </div>
            )}
        </div>
      
        <AnimatePresence>
        {isExpanded && !isCompleted && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 pb-4"
          >
            <div className="border-t border-base-300 pt-4">
              {suggestion && (
                <div className="bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-semibold p-2 rounded-lg mb-4 text-center">
                  {suggestion.note}
                </div>
              )}
              <div className="flex justify-between items-center mb-2">
                  <p className="text-xs font-bold text-content-200 uppercase w-12 text-center">Set</p>
                  <p className="text-xs font-bold text-content-200 uppercase flex-1 text-center">Weight (kg)</p>
                  <p className="text-xs font-bold text-content-200 uppercase flex-1 text-center">Reps</p>
                  <div className="w-24" />
              </div>
              <div className="space-y-1">
                {setsData.map((set, index) => {
                  const logged = isSetLogged(index);
                  const ph = getPlaceholders(index);
                  return (
                      <div key={index} className="flex flex-col gap-1 bg-base-300/30 py-1 px-2 rounded-xl">
                          <div className="flex items-stretch gap-2">
                            <span className={`w-12 flex items-center justify-center font-mono font-bold transition-colors ${logged ? 'text-brand-primary' : 'text-content-100'}`}>{index + 1}</span>
                            <input ref={el => weightInputRefs.current[index] = el} type="text" inputMode="decimal" pattern="[0-9]*[.]?[0-9]*" placeholder={ph.pWeight} value={set.weight} onChange={(e) => handleSetChange(index, 'weight', e.target.value)} disabled={logged} className="w-full bg-base-300 text-content-100 rounded-lg p-2 text-center font-mono text-lg disabled:opacity-50 placeholder-content-300/50" />
                            <input ref={el => repsInputRefs.current[index] = el} type="text" inputMode="numeric" pattern="[0-9]*" placeholder={ph.pReps} value={set.reps} onChange={(e) => handleSetChange(index, 'reps', e.target.value)} disabled={logged} className="w-full bg-base-300 text-content-100 rounded-lg p-2 text-center font-mono text-lg disabled:opacity-50 placeholder-content-300/50" onKeyDown={(e) => e.key === 'Enter' && !set.showDropSet && handleLogSet(index)} />
                            <div className="w-24 flex items-center justify-end gap-1">
                                {!logged && (
                                    <>
                                        <button
                                            onClick={() => handleToggleDropSet(index)}
                                            className={`w-9 h-10 flex items-center justify-center rounded-lg transition-colors group ${set.showDropSet ? 'bg-[#FF8C00]/20' : 'bg-base-300 hover:bg-base-300/80'}`}
                                            title="Add Drop Set"
                                        >
                                            <span className={`text-[10px] font-bold font-mono transition-colors ${set.showDropSet ? 'text-[#FF8C00]' : 'text-content-200 group-hover:text-content-100'}`}>+DS</span>
                                        </button>
                                        <motion.button
                                            whileTap={{ scale: 0.8 }}
                                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                            onClick={() => handleLogSet(index)}
                                            className="w-12 h-10 flex items-center justify-center bg-brand-primary/10 hover:bg-brand-primary/20 rounded-lg transition-colors active:bg-brand-primary group"
                                        >
                                            <CheckIcon className="w-5 h-5 text-brand-primary transition-colors group-active:text-base-100" />
                                        </motion.button>
                                    </>
                                )}
                            </div>
                          </div>
                          {set.showDropSet && (
                              <div className="flex items-stretch gap-2 pl-14">
                                  <div className="w-12 flex items-center justify-center font-mono font-bold text-[#FF8C00] text-xs">DS</div>
                                  <input type="text" inputMode="decimal" pattern="[0-9]*[.]?[0-9]*" placeholder={ph.pDropWeight} value={set.dropWeight} onChange={(e) => handleSetChange(index, 'dropWeight', e.target.value)} disabled={logged} className="w-full bg-base-300/50 text-[#FF8C00] rounded-lg p-2 text-center font-mono text-sm disabled:opacity-50 border border-[#FF8C00]/20 placeholder-[#FF8C00]/40" />
                                  <input type="text" inputMode="numeric" pattern="[0-9]*" placeholder={ph.pDropReps} value={set.dropReps} onChange={(e) => handleSetChange(index, 'dropReps', e.target.value)} disabled={logged} className="w-full bg-base-300/50 text-[#FF8C00] rounded-lg p-2 text-center font-mono text-sm disabled:opacity-50 border border-[#FF8C00]/20 placeholder-[#FF8C00]/40" onKeyDown={(e) => e.key === 'Enter' && handleLogSet(index)} />
                                  <div className="w-24" />
                              </div>
                          )}
                      </div>
                  );
                })}
              </div>
              <div className="mt-3 pt-3 border-t border-base-300">
                  <input 
                      type="text" 
                      placeholder="Note for next session..."
                      value={exerciseNotes[originalExerciseId]?.text || ''}
                      onChange={(e) => saveExerciseNote(originalExerciseId, e.target.value)}
                      className="w-full bg-transparent text-content-100 placeholder:text-content-200/60 text-sm font-mono p-3 rounded border border-brand-primary/40 focus:border-brand-primary focus:outline-none transition-colors"
                  />
              </div>
            </div>
          </motion.div>
        )}
        </AnimatePresence>

        <EditExerciseModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            exercise={exercise}
            onSave={(updatedExt) => {
                updateExerciseInSession(originalExerciseId, updatedExt);
                setIsEditModalOpen(false);
            }}
        />
    </motion.div>
  );
};

export default ExerciseItem;
