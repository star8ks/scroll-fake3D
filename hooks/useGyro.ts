import { useState, useEffect, useRef } from 'react';

export interface GyroData {
  x: number;
  y: number;
  permissionGranted: boolean;
}

// singleton storage
let globalGyroData: GyroData = { x: 0, y: 0, permissionGranted: false };
let listeners = new Set<() => void>();

export default function useGyro(maxTilt = 15) {
  const [gyroData, setGyroData] = useState<GyroData>(globalGyroData);
  const initialOrientation = useRef<{ beta: number; gamma: number } | null>(null);

  useEffect(() => {
    const update = () => setGyroData(globalGyroData);
    listeners.add(update);
    return () => { listeners.delete(update); };
  }, []);

  useEffect(() => {
    // Function to handle device orientation events
    const handleOrientation = (event: DeviceOrientationEvent) => {
      // Capture initial orientation on first event
      if (!initialOrientation.current) {
        initialOrientation.current = {
          beta: event.beta ?? 0,
          gamma: event.gamma ?? 0
        };
        console.log('initialOrientation', initialOrientation.current);
        return;
      }

      // Calculate relative tilt from initial position
      const deltaX = (event.gamma ?? 0) - initialOrientation.current.gamma;
      const deltaY = (event.beta ?? 0) - initialOrientation.current.beta;
      
      const x = clamp(deltaX, -maxTilt, maxTilt) / maxTilt;
      const y = -clamp(deltaY, -maxTilt, maxTilt) / maxTilt;
      
      globalGyroData = { ...globalGyroData, x, y };
      listeners.forEach(fn => fn());
    };

    // Function to request permission (needed for iOS 13+)
    const requestPermission = async () => {
      const requestPermissionFn = (DeviceOrientationEvent as any).requestPermission;
      if (typeof requestPermissionFn === 'function') {
        try {
          console.log('Requesting permission');
          // iOS 13+ requires explicit permission
          const permission = await requestPermissionFn();
          if (permission === 'granted') {
            console.log('Permission granted');
            globalGyroData = { ...globalGyroData, permissionGranted: true };
            window.addEventListener('deviceorientation', handleOrientation);
          } else {
            console.log('Permission denied');
            globalGyroData = { ...globalGyroData, permissionGranted: false };
            console.log('Gyroscope permission denied');
          }
        } catch (error) {
          console.log('Device orientation supported on this device');
          globalGyroData = { ...globalGyroData, permissionGranted: false };
          console.log('Error requesting gyroscope permission', error);
        }
      } else {
        // Non-iOS devices or older iOS versions don't need permission
        globalGyroData = { ...globalGyroData, permissionGranted: true };
        window.addEventListener('deviceorientation', handleOrientation);
      }
    };

    // Check if device orientation is supported
    if ('DeviceOrientationEvent' in window) {
      requestPermission();
    } else {
      console.log('Device orientation not supported on this device');
    }

    // Cleanup
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [maxTilt]);

  return gyroData;
}

function clamp(number: number, min: number, max: number): number {
  return Math.max(min, Math.min(number, max));
} 