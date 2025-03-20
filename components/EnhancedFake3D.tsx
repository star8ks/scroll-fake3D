'use client';

import React, { useRef, useEffect } from 'react';
import { useFrame, useThree, useLoader, Canvas } from '@react-three/fiber';
import { TextureLoader, Vector2 } from 'three';
import * as THREE from 'three';
import { PerspectiveCamera } from '@react-three/drei';
import vertexShader from './shaders/fake3d.vert';
import fragmentShader from './shaders/fake3d.frag';
import useGyro from '../app/fake3d/utils/useGyro';

interface IFake3DProps {
  imageUrl: string;
  depthUrl: string;
  horizontalThreshold?: number;
  verticalThreshold?: number;
  verticalFix?: number;
  useGyroscope?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

// 实际的着色器平面组件
const Fake3DPlane: React.FC<Omit<IFake3DProps, 'className' | 'style'>> = ({
  imageUrl,
  depthUrl,
  horizontalThreshold = 1.0,
  verticalThreshold = 1.0,
  verticalFix = 0.0,
  useGyroscope = false
}) => {
  // 加载纹理
  const [originalTexture, depthTexture] = useLoader(TextureLoader, [imageUrl, depthUrl]);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  // 鼠标状态
  const mouse = useRef({ x: 0, y: 0 });
  const mouseTarget = useRef({ x: 0, y: 0 });
  
  // 获取场景信息
  const { viewport } = useThree();
  
  // 使用陀螺仪Hook (如果启用)
  const gyroData = useGyroscope ? useGyro(15) : { x: 0, y: 0 };
  
  // 设置纹理
  useEffect(() => {
    if (originalTexture && depthTexture) {
      [originalTexture, depthTexture].forEach(texture => {
        texture.needsUpdate = true;
      });
    }
  }, [originalTexture, depthTexture]);
  
  // 处理鼠标移动
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      
      const halfX = window.innerWidth / 2;
      const halfY = window.innerHeight / 2;
      
      mouseTarget.current = {
        x: (halfX - e.clientX) / halfX,
        y: (halfY - e.clientY) / halfY
      };
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [useGyroscope]);
  
  // 更新陀螺仪数据
  useEffect(() => {
    if (useGyroscope) {
      mouseTarget.current = {
        x: gyroData.x,
        y: gyroData.y
      };
      console.log('update from gyroscope', mouseTarget.current);
    }
  }, [gyroData, useGyroscope]);
  
  // 动画帧更新
  useFrame((_, delta) => {
    if (materialRef.current) {
      // 添加惯性，使得移动更平滑
      mouse.current.x += (mouseTarget.current.x - mouse.current.x) * 0.5;
      mouse.current.y += (mouseTarget.current.y - mouse.current.y) * 0.5;
      
      // 更新着色器的uniform
      materialRef.current.uniforms.mouse.value.set(mouse.current.x, mouse.current.y + verticalFix);
      materialRef.current.uniforms.time.value += delta;
    }
  });
  
  // 计算纹理长宽比
  const imageAspect = originalTexture ? originalTexture.image.height / originalTexture.image.width : 1;
  
  // 计算平面尺寸
  const getPlaneSize = () => {
    const viewportAspect = viewport.width / viewport.height;
    
    if (imageAspect > viewportAspect) {
      // 图像高度受限
      return {
        width: viewport.height * (1 / imageAspect),
        height: viewport.height
      };
    } else {
      // 图像宽度受限
      return {
        width: viewport.width,
        height: viewport.width * imageAspect
      };
    }
  };
  
  const { width, height } = getPlaneSize();
  
  return (
    <mesh>
      <planeGeometry args={[width, height]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={{
          originalTexture: { value: originalTexture },
          depthTexture: { value: depthTexture },
          mouse: { value: new Vector2(0, 0) },
          threshold: { value: new Vector2(horizontalThreshold, verticalThreshold) },
          time: { value: 0 }
        }}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
      />
    </mesh>
  );
};

// 包装组件，提供Canvas环境
const EnhancedFake3D: React.FC<IFake3DProps> = (props) => {
  const { className, style, ...planeProps } = props;
  
  return (
    <div className={className} style={{ width: '100%', height: '100%', ...style }}>
      <Canvas>
        <PerspectiveCamera 
          makeDefault
          position={[0, 0, 5]}
          fov={50}
          near={0.1}
          far={1000}
        />
        <Fake3DPlane {...planeProps} />
      </Canvas>
    </div>
  );
};

export default EnhancedFake3D; 