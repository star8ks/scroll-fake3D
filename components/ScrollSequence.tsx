import React, { useContext, useEffect, useState } from 'react';
import { Canvas as ThreeCanvas } from '@react-three/fiber';
import EnhancedFake3D from './EnhancedFake3D';
import { GyroContext } from '../app/providers';

interface ScrollSequenceProps {
  images: string[];
  imagesRoot: string;
  imagesDepthRoot: string;
  playbackSpeed?: number;
}

const ScrollSequence: React.FC<ScrollSequenceProps> = ({
  images,
  imagesRoot,
  imagesDepthRoot,
  playbackSpeed = 1,
}) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const { x, y, permissionGranted } = useContext(GyroContext);


  const handleScroll = () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollFraction = docHeight > 0 ? scrollTop / docHeight : 0;
    const frame = Math.min(images.length - 1, Math.floor(scrollFraction * images.length));
    setCurrentFrame(frame);
    console.log(`Scroll Fraction: ${scrollFraction}, Frame: ${frame}`);
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initialize frame based on current scroll position
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [images.length]);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: -1,
      pointerEvents: 'none',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, color: 'black', zIndex: 1000 }}>
        {currentFrame}<br/>
        {x}<br/>
        {y}<br/>
        {permissionGranted ? 'true' : 'false'}
      </div>
      <ThreeCanvas>
        {/* <GrayscaleTexture key={currentFrame} imageUrl={`${imagesRoot}${images[currentFrame]}`} /> */}
        <EnhancedFake3D 
          key={currentFrame}
          useGyroscope
          horizontalThreshold={140.0}
          verticalThreshold={150.0}
          imageUrl={`${imagesRoot}${images[currentFrame]}`} 
          depthUrl={`${imagesDepthRoot}${images[currentFrame].replace(/\.(jpg|jpeg|webp|png)$/i, '.$1')}`}
        />
      </ThreeCanvas>
    </div>
  );
};

export default ScrollSequence; 