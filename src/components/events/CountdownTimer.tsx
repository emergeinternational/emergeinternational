
import { useState, useEffect } from "react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface CountdownTimerProps {
  targetDate: Date;
  className?: string;
}

export const CountdownTimer = ({ targetDate, className }: CountdownTimerProps) => {
  const calculateTimeLeft = (): TimeLeft => {
    const difference = +targetDate - +new Date();
    let timeLeft: TimeLeft = {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0
    };

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    }

    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearTimeout(timer);
  });

  const isPast = +targetDate - +new Date() <= 0;
  
  if (isPast) {
    return null;
  }

  return (
    <div className={`flex justify-center space-x-4 ${className}`}>
      <div className="text-center">
        <div className="text-2xl font-bold">{timeLeft.days}</div>
        <div className="text-xs text-gray-500">Days</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold">{timeLeft.hours}</div>
        <div className="text-xs text-gray-500">Hours</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold">{timeLeft.minutes}</div>
        <div className="text-xs text-gray-500">Mins</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold">{timeLeft.seconds}</div>
        <div className="text-xs text-gray-500">Secs</div>
      </div>
    </div>
  );
};
