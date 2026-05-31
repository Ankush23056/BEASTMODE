// Day of week mapping: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
export const weeklySchedule = {
  0: 'recovery',      // Sunday
  1: 'chest_back',// Monday
  2: 'back_biceps',// Tuesday
  3: 'quads_hamstrings_calves', // Wednesday
  4: 'chest_shoulders_triceps', // Thursday
  5: 'glutes_legs_core',      // Friday
  6: 'rest_day',        // Saturday (Now editable)
};

export const workoutSplits = [
  {
    id: 'chest_shoulders_triceps',
    name: 'Chest / Shoulders / Triceps',
    muscleGroups: 'Chest / Shoulders / Triceps',
    exercises: [
      { id: 'cst1', name: 'Incline Bench Press', muscle: 'Chest', sets: '4', reps: '6-8', weight: 60, intensity: 'HEAVY', formCue: 'Retract scapula, drive with legs' },
      { id: 'cst2', name: 'Shoulder Press', muscle: 'Shoulders', sets: '4', reps: '6-8', weight: 40, intensity: 'HEAVY', formCue: 'Keep core tight, don\'t arch back' },
      { id: 'cst3', name: 'Flat Dumbbell Press', muscle: 'Chest', sets: '3', reps: '12-15', weight: 25, intensity: 'VOLUME', formCue: 'Full range of motion, squeeze at top' },
      { id: 'cst4', name: 'Lateral Raises', muscle: 'Shoulders', sets: '3', reps: '12-15', weight: 10, intensity: 'VOLUME', formCue: 'Slight forward lean, no swinging' },
      { id: 'cst5', name: 'Tricep Rope Pushdown', muscle: 'Triceps', sets: '3', reps: '12-15', weight: 20, intensity: 'VOLUME', formCue: 'Keep elbows tucked, full extension' },
    ],
  },
  {
    id: 'back_biceps',
    name: 'Back / Biceps',
    muscleGroups: 'Back / Biceps',
    exercises: [
        { id: 'bb1', name: 'Pull Ups', muscle: 'Back', sets: '4', reps: 'AMRAP', weight: 0, formCue: 'Full range of motion, squeeze at top' },
        { id: 'bb2', name: 'Barbell Rows', muscle: 'Back', sets: '4', reps: '6-8', weight: 70, intensity: 'HEAVY', formCue: 'Keep back straight, pull to hips' },
        { id: 'bb3', name: 'Lat Pulldowns', muscle: 'Back', sets: '3', reps: '12-15', weight: 50, intensity: 'VOLUME', formCue: 'Pull with elbows, not biceps' },
        { id: 'bb4', name: 'Dumbbell Curls', muscle: 'Biceps', sets: '3', reps: '12-15', weight: 15, intensity: 'VOLUME', formCue: 'Control the eccentric, no swinging' },
        { id: 'bb5', name: 'Face Pulls', muscle: 'Back', sets: '3', reps: '15-20', weight: 15, formCue: 'Pull to forehead, squeeze rear delts' },
    ],
  },
  {
    id: 'quads_hamstrings_calves',
    name: 'Quads / Hamstrings / Calves',
    muscleGroups: 'Quads / Hamstrings / Calves',
    exercises: [
        { id: 'qhc1', name: 'Squats', muscle: 'Quads', sets: '4', reps: '6-8', weight: 100, intensity: 'HEAVY', formCue: 'Keep chest up, knees out' },
        { id: 'qhc2', name: 'Romanian Deadlifts', muscle: 'Hamstrings', sets: '4', reps: '8-10', weight: 80, formCue: 'Hinge at hips, keep back flat' },
        { id: 'qhc3', name: 'Leg Press', muscle: 'Quads', sets: '3', reps: '12-15', weight: 150, intensity: 'VOLUME', formCue: 'Don\'t lock knees at top' },
        { id: 'qhc4', name: 'Seated Leg Curls', muscle: 'Hamstrings', sets: '3', reps: '12-15', weight: 40, intensity: 'VOLUME', formCue: 'Control the movement, squeeze hamstrings' },
        { id: 'qhc5', name: 'Calf Raises', muscle: 'Calves', sets: '4', reps: '15-20', weight: 90, formCue: 'Full stretch at bottom, squeeze at top' },
    ],
  },
    {
    id: 'chest_back',
    name: 'Chest / Back',
    muscleGroups: 'Chest / Back',
    exercises: [
        { id: 'cba1', name: 'Bench Press', muscle: 'Chest', sets: '4', reps: '6-8', weight: 80, intensity: 'HEAVY', formCue: 'Retract scapula, drive with legs' },
        { id: 'cba2', name: 'T-Bar Rows', muscle: 'Back', sets: '4', reps: '8-10', weight: 60, formCue: 'Keep back flat, pull to chest' },
        { id: 'cba3', name: 'Incline Dumbbell Curls', muscle: 'Biceps', sets: '3', reps: '12-15', weight: 12, intensity: 'VOLUME', formCue: 'Full stretch at bottom' },
        { id: 'cba4', name: 'Skullcrushers', muscle: 'Triceps', sets: '3', reps: '12-15', weight: 25, intensity: 'VOLUME', formCue: 'Keep elbows stationary' },
        { id: 'cba5', name: 'Cable Flys', muscle: 'Chest', sets: '3', reps: '12-15', weight: 15, formCue: 'Squeeze chest at peak contraction' },
    ],
  },
  {
    id: 'glutes_legs_core',
    name: 'Glutes / Legs / Core',
    muscleGroups: 'Glutes / Legs / Core',
    exercises: [
      { id: 'glc1', name: 'Hip Thrusts', muscle: 'Glutes', sets: '4', reps: '6-8', weight: 100, intensity: 'HEAVY', formCue: 'Chin tucked, squeeze glutes at top' },
      { id: 'glc2', name: 'Front Squat', muscle: 'Quads', sets: '4', reps: '8-10', weight: 50, formCue: 'Keep elbows high, chest up' },
      { id: 'glc3', name: 'Walking Lunges', muscle: 'Legs', sets: '3', reps: '12 each', weight: 15, formCue: 'Keep torso upright, knee over ankle' },
      { id: 'glc4', name: 'Leg Extensions', muscle: 'Quads', sets: '3', reps: '12-15', weight: 40, intensity: 'VOLUME', formCue: 'Squeeze quads at top' },
      { id: 'glc5', name: 'Plank Hold', muscle: 'Core', sets: '3', reps: '60s', weight: 0, formCue: 'Keep body in straight line, engage core' },
    ],
  },
  {
    id: 'recovery',
    name: 'Full Body Mobility',
    muscleGroups: 'Full Body Mobility',
    exercises: [
        { id: 'rec1', name: 'Light Cardio', muscle: 'Cardio', sets: '1', reps: '20-30 min', weight: 0 },
        { id: 'rec2', name: 'Full Body Stretch', muscle: 'Flexibility', sets: '1', reps: '15 min', weight: 0 },
        { id: 'rec3', name: 'Foam Rolling', muscle: 'Recovery', sets: '1', reps: '10 min', weight: 0 },
    ],
  },
  {
    id: 'rest_day',
    name: 'Rest Day',
    muscleGroups: 'None',
    exercises: [],
  }
];
