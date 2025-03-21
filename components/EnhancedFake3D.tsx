"use client";

import React, { useRef, useEffect, useState, useContext } from "react";
import { useFrame, useThree, useLoader } from "@react-three/fiber";
import { TextureLoader, Vector2 } from "three";
import * as THREE from "three";
import { PerspectiveCamera } from "@react-three/drei";
import vertexShader from "./shaders/fake3d.vert";
import fragmentShader from "./shaders/fake3d.frag";
import { GyroContext, MouseContext } from "../app/providers";

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
const Fake3DPlane: React.FC<Omit<IFake3DProps, "className" | "style">> = ({
  imageUrl,
  depthUrl,
  horizontalThreshold = 1.0,
  verticalThreshold = 1.0,
  verticalFix = 0.0,
  useGyroscope = false,
}) => {
  // load texture
  const [originalTexture, depthTexture] = useLoader(TextureLoader, [
    imageUrl,
    depthUrl,
  ]);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // mouse state
  const mouse = useRef({ x: 0, y: 0 });
  const mouseTarget = useRef({ x: 0, y: 0 });

  // get scene info
  const { viewport } = useThree();
  const [resizeCount, setResizeCount] = useState(0);

  // use gyroscope hook (if enabled)
  const gyroData = useGyroscope ? useContext(GyroContext) : { x: 0, y: 0 };
  const mouseData = useContext(MouseContext);
  
  // set texture
  useEffect(() => {
    if (originalTexture && depthTexture) {
      [originalTexture, depthTexture].forEach((texture) => {
        texture.needsUpdate = true;
      });
    }
  }, [originalTexture, depthTexture]);

  // handle mouse move
  useEffect(() => {
    mouseTarget.current = {
      x: mouseData.x,
      y: mouseData.y,
    };
  }, [mouseData]);

  // 更新陀螺仪数据
  useEffect(() => {
    if (useGyroscope) {
      mouseTarget.current = {
        x: gyroData.x,
        y: gyroData.y,
      };
      console.log("update from gyroscope", mouseTarget.current);
    }
  }, [gyroData, useGyroscope]);

  // 动画帧更新
  useFrame((_, delta) => {
    if (materialRef.current) {
      // 添加惯性，使得移动更平滑
      mouse.current.x += (mouseTarget.current.x - mouse.current.x) * 0.5;
      mouse.current.y += (mouseTarget.current.y - mouse.current.y) * 0.5;

      // 更新着色器的uniform
      materialRef.current.uniforms.mouse.value.set(
        mouse.current.x,
        mouse.current.y + verticalFix
      );
      materialRef.current.uniforms.time.value += delta;
    }
  });

  // 计算纹理长宽比
  const imageAspect = originalTexture
    ? originalTexture.image.height / originalTexture.image.width
    : 1;

  // 计算平面尺寸
  const getPlaneSize = () => {
    const viewportAspect = viewport.width / viewport.height;

    if (imageAspect > viewportAspect) {
      // 图像高度受限
      return {
        width: viewport.height * (1 / imageAspect),
        height: viewport.height,
      };
    } else {
      // 图像宽度受限
      return {
        width: viewport.width,
        height: viewport.width * imageAspect,
      };
    }
  };

  const { width, height } = getPlaneSize();

  useEffect(() => {
    const handleResize = () => setResizeCount((prev) => prev + 1);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <mesh key={resizeCount + `${mouseTarget.current.x}-${mouseTarget.current.y}`}>
      <planeGeometry key={`geometry-${resizeCount}`} args={[width, height]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={{
          originalTexture: { value: originalTexture },
          depthTexture: { value: depthTexture },
          mouse: { value: new Vector2(0, 0) },
          threshold: {
            value: new Vector2(horizontalThreshold, verticalThreshold),
          },
          time: { value: 0 },
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
    <>
      <PerspectiveCamera
        makeDefault
        position={[0, 0, 5]}
        fov={50}
        near={0.1}
        far={1000}
      />
      <Fake3DPlane {...planeProps} />
    </>
  );
};

export default EnhancedFake3D;
