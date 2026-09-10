import { useState, useCallback } from "react";

const FREE_USER_DELAY = 7000; // 7 seconds

export const useFreeUserDelay = () => {
  const [isPro] = useState(false); // In real app, get from user subscription
  const [isDelaying, setIsDelaying] = useState(false);
  const [delayProgress, setDelayProgress] = useState(0);

  const applyDelay = useCallback(async () => {
    if (isPro) return; // Pro users skip delay

    setIsDelaying(true);
    setDelayProgress(0);

    const startTime = Date.now();
    const endTime = startTime + FREE_USER_DELAY;

    return new Promise<void>((resolve) => {
      const interval = setInterval(() => {
        const now = Date.now();
        const progress = Math.min(((now - startTime) / FREE_USER_DELAY) * 100, 100);
        setDelayProgress(progress);

        if (now >= endTime) {
          clearInterval(interval);
          setIsDelaying(false);
          setDelayProgress(100);
          resolve();
        }
      }, 100);
    });
  }, [isPro]);

  return {
    isPro,
    isDelaying,
    delayProgress,
    applyDelay,
    delayTime: FREE_USER_DELAY / 1000,
  };
};
