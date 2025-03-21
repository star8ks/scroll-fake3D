import { useEffect, useState } from "react";

interface IMouseData {
  x: number;
  y: number;
}

export default function useMouse() {
  const [mouseData, setMouseData] = useState<IMouseData>({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const halfWidth = window.innerWidth / 2;
      const halfHeight = window.innerHeight / 2;
      // Normalize coordinates to range [-1, 1]
      const x = (halfWidth - e.clientX) / halfWidth;
      const y = (halfHeight - e.clientY) / halfHeight;
      setMouseData({ x, y });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return mouseData;
}
