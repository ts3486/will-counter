import { useState, useEffect } from 'react';

export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export const useThrottle = <T>(value: T, limit: number): T => {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const [lastRun, setLastRun] = useState<number>(Date.now());

  useEffect(() => {
    if (Date.now() - lastRun >= limit) {
      setThrottledValue(value);
      setLastRun(Date.now());
    } else {
      const handler = setTimeout(() => {
        setThrottledValue(value);
        setLastRun(Date.now());
      }, limit - (Date.now() - lastRun));

      return () => {
        clearTimeout(handler);
      };
    }
  }, [value, limit, lastRun]);

  return throttledValue;
};