import { useState, useEffect } from 'react';
import { motion } from 'motion/react';

interface TimerProps {
  duration: number;
  onComplete: () => void;
}

export function Timer({ duration, onComplete }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete();
      return;
    }

    const intervalId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeLeft, onComplete]);

  const percentage = (timeLeft / duration) * 100;
  
  // Determine color based on time left
  let colorClass = "text-emerald-500";
  if (percentage < 60) colorClass = "text-yellow-500";
  if (percentage < 25) colorClass = "text-red-500";

  return (
    <div className="flex flex-col items-center justify-center py-4">
      <div className="relative w-48 h-48 flex items-center justify-center">
        {/* Background Circle */}
        <svg className="absolute w-full h-full transform -rotate-90 drop-shadow-md">
          <circle
            cx="96"
            cy="96"
            r="80"
            stroke="currentColor"
            strokeWidth="16"
            fill="white"
            className="text-slate-100"
          />
          {/* Progress Circle */}
          <motion.circle
            cx="96"
            cy="96"
            r="80"
            stroke="currentColor"
            strokeWidth="16"
            fill="transparent"
            strokeLinecap="round"
            className={colorClass}
            strokeDasharray="502"
            strokeDashoffset={502 - (502 * percentage) / 100}
            initial={{ strokeDashoffset: 0 }}
            animate={{ strokeDashoffset: 502 - (502 * percentage) / 100 }}
            transition={{ duration: 0.5 }}
          />
        </svg>
        <div className="flex flex-col items-center z-10">
          <motion.div 
            key={timeLeft}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`text-6xl font-black ${colorClass}`}
          >
            {timeLeft}
          </motion.div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Detik</span>
        </div>
      </div>
    </div>
  );
}
