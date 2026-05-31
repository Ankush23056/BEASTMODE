export const exerciseAlternatives = {
  // Chest / Shoulders / Triceps
  'cst1': [ // Incline Bench Press
    { name: 'Incline Dumbbell Press', muscle: 'Chest', sets: '4', reps: '8-10', weight: 25 },
    { name: 'Smith Machine Incline Press', muscle: 'Chest', sets: '4', reps: '8-10', weight: 50 },
    { name: 'Machine Chest Press (Incline)', muscle: 'Chest', sets: '3', reps: '10-12', weight: 60 },
  ],
  'cst2': [ // Shoulder Press
    { name: 'Dumbbell Shoulder Press', muscle: 'Shoulders', sets: '4', reps: '8-10', weight: 20 },
    { name: 'Arnold Press', muscle: 'Shoulders', sets: '4', reps: '10-12', weight: 18 },
  ],
  // Back / Biceps
  'bb2': [ // Barbell Rows
    { name: 'T-Bar Row', muscle: 'Back', sets: '4', reps: '8-10', weight: 50 },
    { name: 'Dumbbell Rows', muscle: 'Back', sets: '4', reps: '10-12', weight: 25 },
  ],
  // Quads / Hamstrings / Calves
  'qhc1': [ // Squats
    { name: 'Leg Press', muscle: 'Quads', sets: '4', reps: '10-12', weight: 120 },
    { name: 'Hack Squat', muscle: 'Quads', sets: '4', reps: '10-12', weight: 80 },
    { name: 'Goblet Squat', muscle: 'Quads', sets: '3', reps: '12-15', weight: 30 },
  ],
  // Default fallback
  'default': [
    { name: 'Dumbbell Curls', muscle: 'Biceps', sets: '3', reps: '10-12', weight: 12 },
    { name: 'Push Ups', muscle: 'Chest', sets: '3', reps: 'AMRAP', weight: 0 },
  ],
};
