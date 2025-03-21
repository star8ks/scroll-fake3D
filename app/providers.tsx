'use client';

import React from 'react';
import useGyro from '../hooks/useGyro';

export const GyroContext = React.createContext<ReturnType<typeof useGyro>>({ x: 0, y: 0 });

export function Providers({ children }: { children: React.ReactNode }) {
  const gyroData = useGyro(90);
  return <GyroContext.Provider value={gyroData}>{children}</GyroContext.Provider>;
}