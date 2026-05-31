const tagRules = {
  HEAVY: { rest: 180, reps: '6-8', note: 'Higher Weight, High Tension' },
  VOLUME: { rest: 90, reps: '8-12', note: 'Moderate Weight, More TUT' },
  DETAIL: { rest: 30, reps: '12-15', note: 'Lighter Weight, Slower Reps' },
  CONTROL: { },
  EXPLOSIVE: { note: 'Explosive Up' },
};

/**
 * Calculates adaptive workout targets based on focus tags.
 * @param tags - An array of focus tags (e.g., ['HEAVY', 'CONTROL']).
 * @returns An object with adaptive rest timer, reps, and focus notes.
 */
export const getAdaptiveTargets = (tags) => {
  if (!tags || tags.length === 0) {
    return { restTimer: null, reps: null, focusNote: null, sourceTag: null };
  }

  let minRest = Infinity;
  let finalReps = null;
  let sourceTag = null;
  let firstNote = null;

  tags.forEach(tag => {
    const rule = tagRules[tag];
    if (rule) {
      if (rule.rest !== undefined && rule.reps !== undefined) {
         if (rule.rest < minRest) {
           minRest = rule.rest;
           finalReps = rule.reps;
           sourceTag = tag;
         }
      }
      if (rule.note && firstNote === null) {
        firstNote = rule.note;
      }
    }
  });

  return {
    restTimer: minRest === Infinity ? null : minRest,
    reps: finalReps,
    focusNote: firstNote,
    sourceTag: sourceTag,
  };
};
