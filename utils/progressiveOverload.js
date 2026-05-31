export const getProgressiveOverloadSuggestion = (
  exerciseId,
  history
) => {
  if (!history || history.length === 0) return null;

  // Find the last time this exercise was performed
  for (let i = history.length - 1; i >= 0; i--) {
    const log = history[i];
    if (log.performance[exerciseId]) {
      const lastPerformance = log.performance[exerciseId];
      const lastSet = lastPerformance.sets[lastPerformance.sets.length - 1];
      if (lastSet && lastSet.weight > 0) {
        // Simple logic: suggest adding 2.5kg to the last weight
        const suggestedWeight = lastSet.weight + 2.5;
        return {
          weight: suggestedWeight,
          reps: lastSet.reps.toString(),
          note: `Last time: ${lastSet.weight}kg. Aim for ${suggestedWeight}kg!`,
        };
      } else if (lastSet) {
        // For bodyweight exercises, suggest one more rep
         const suggestedReps = lastSet.reps + 1;
         return {
            weight: 0,
            reps: suggestedReps.toString(),
            note: `Last time: ${lastSet.reps} reps. Aim for ${suggestedReps}!`,
         }
      }
    }
  }
  return null;
};
