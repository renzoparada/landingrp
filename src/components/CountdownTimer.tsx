"use client";

import { useEffect, useState } from "react";

interface CountdownTimerProps {
  targetIso: string;
  expiredMessage: string;
  onExpire?: () => void;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
}

function computeTimeLeft(targetIso: string): TimeLeft {
  const diff = new Date(targetIso).getTime() - Date.now();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }
  const seconds = Math.floor(diff / 1000) % 60;
  const minutes = Math.floor(diff / (1000 * 60)) % 60;
  const hours = Math.floor(diff / (1000 * 60 * 60)) % 24;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  return { days, hours, minutes, seconds, expired: false };
}

function Unit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-14 sm:w-16 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 py-2 text-center shadow-lg">
        <span className="text-xl sm:text-2xl font-bold tabular-nums text-white">
          {value.toString().padStart(2, "0")}
        </span>
      </div>
      <span className="mt-1 text-[10px] sm:text-xs uppercase tracking-wide text-white/60">
        {label}
      </span>
    </div>
  );
}

export default function CountdownTimer({
  targetIso,
  expiredMessage,
  onExpire,
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    // Deferred to the client only, to avoid an SSR/CSR hydration mismatch
    // (the server has no notion of "now" for this purpose).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTimeLeft(computeTimeLeft(targetIso));
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const next = computeTimeLeft(targetIso);
        if (next.expired && prev && !prev.expired) onExpire?.();
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [targetIso, onExpire]);

  if (!timeLeft) {
    // Avoid hydration mismatch: render nothing meaningful until mounted.
    return <div className="h-[68px]" />;
  }

  if (timeLeft.expired) {
    return (
      <p className="text-sm sm:text-base font-medium text-white/80 bg-white/10 border border-white/15 rounded-xl px-4 py-3 text-center">
        {expiredMessage}
      </p>
    );
  }

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <Unit value={timeLeft.days} label="días" />
      <span className="text-white/40 text-xl -mt-4">:</span>
      <Unit value={timeLeft.hours} label="hrs" />
      <span className="text-white/40 text-xl -mt-4">:</span>
      <Unit value={timeLeft.minutes} label="min" />
      <span className="text-white/40 text-xl -mt-4">:</span>
      <Unit value={timeLeft.seconds} label="seg" />
    </div>
  );
}
