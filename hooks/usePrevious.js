import { useRef, useEffect } from 'react';

/**
 * Custom hook to store the previous value of a state or prop.
 * @param value The value to track.
 * @returns The value from the previous render.
 */
export const usePrevious = (value) => {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};
