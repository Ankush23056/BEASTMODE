import { useEffect } from 'react';
import { useWorkoutStore } from '../store/useWorkoutStore';
import { getInitialWorkoutData } from '../utils/dataInitializer';

/**
 * This hook initializes the application's state by fetching the workout data
 * and hydrating the Zustand store when the App component mounts for the first time.
 */
export const useInitWorkoutData = () => {
    useEffect(() => {
    if (!useWorkoutStore.getState().isInitialized) {
      const initialState = getInitialWorkoutData();
      useWorkoutStore.getState().initialize(initialState);
    }
  }, []);
};
