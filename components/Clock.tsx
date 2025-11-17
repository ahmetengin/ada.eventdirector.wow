
import React, { useState, useEffect } from 'react';

export const Clock: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, []);

  const formatTime = (date: Date) => {
    // Using Los Angeles time for the "Live from the Dolby Theatre" theme
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'America/Los_Angeles',
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', {
          timeZone: 'America/Los_Angeles',
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
      })
  }

  return (
    <div className="font-orbitron text-yellow-400 text-center sm:text-right">
      <div className="text-2xl font-bold tracking-widest">
        {formatTime(time)} <span className="text-lg opacity-80">PST</span>
      </div>
      <div className="text-xs text-gray-400 tracking-wider">
        {formatDate(time)}
      </div>
    </div>
  );
};
