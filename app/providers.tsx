'use client';

import React from 'react';
import useGyro from '../hooks/useGyro';
import useMouse from '../hooks/useMouse';

export const GyroContext = React.createContext<ReturnType<typeof useGyro>>({ x: 0, y: 0 });
export const MouseContext = React.createContext<ReturnType<typeof useMouse>>({ x: 0, y: 0 });

export function Providers({ children }: { children: React.ReactNode }) {
  const gyroData = useGyro(90);
  const mouseData = useMouse();
  return (
    <GyroContext.Provider value={gyroData}>
      <MouseContext.Provider value={mouseData}>
        {children}
      </MouseContext.Provider>
    </GyroContext.Provider>
  );
}