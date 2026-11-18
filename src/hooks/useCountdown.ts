"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Hook countdown sederhana.
 * `start(seconds, onDone)` menjalankan hitungan mundur, memanggil onDone
 * sekali saat mencapai 0. `cancel()` menghentikan hitungan.
 */
export function useCountdown() {
  const [value, setValue] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const cancel = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setValue(null);
  }, []);

  const start = useCallback(
    (seconds: number, onDone: () => void) => {
      cancel();
      let remaining = seconds;
      setValue(remaining);
      timerRef.current = setInterval(() => {
        remaining -= 1;
        if (remaining <= 0) {
          if (timerRef.current) clearInterval(timerRef.current);
          timerRef.current = null;
          setValue(0);
          // beri jeda singkat supaya angka "0"/flash sempat render
          setTimeout(() => {
            setValue(null);
            onDone();
          }, 120);
        } else {
          setValue(remaining);
        }
      }, 1000);
    },
    [cancel],
  );

  useEffect(() => () => cancel(), [cancel]);

  return { value, start, cancel };
}
