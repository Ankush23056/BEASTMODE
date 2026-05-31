
export interface PerformanceSet {
  reps: number;
  weight: number;
  dropSets?: { weight: number; reps: number }[];
}

export interface PerformanceLog {
  sets: (PerformanceSet | undefined)[];
  notes?: string;
}

export interface Exercise {
  id: string;
  name:string;
  muscle: string;
  sets: string;
  reps: string;
  notes?: string;
  weight?: number; // Starting weight suggestion
  intensity?: 'HEAVY' | 'VOLUME' | null;
  formCue?: string;
  supersetWith?: string | null;
  hasDropSet?: boolean;
  dropWeight?: string;
  dropReps?: string;
}

export interface WorkoutSplit {
  id: string;
  name: string;
  muscleGroups?: string;
  exercises: Exercise[];
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  performance: { [exerciseId: string]: PerformanceLog };
  overrides?: { [key: string]: Exercise }; // Key is the original exercise ID
  sessionStartTime?: number | null;
  sessionStatusText?: string;
  sessionDuration?: number; // in seconds
  totalVolume?: number;
  splitId?: string;
}

export interface WeightEntry {
  date: string; // YYYY-MM-DD
  value: number;
}

export interface MeasurementEntry {
  date: string; // YYYY-MM-DD
  muscle: string;
  value: number;
}

export interface ExerciseNote {
  text: string;
  timestamp: number;
  expiresAt?: number;
}

export interface UserMetrics {
  streak: number;
  lastCompletedDate: string | null;
  weight: WeightEntry[];
  measurements: MeasurementEntry[];
  workoutHistory: DailyLog[];
  exerciseNotes?: { [exerciseId: string]: ExerciseNote };
}