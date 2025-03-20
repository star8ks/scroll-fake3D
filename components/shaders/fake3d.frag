uniform sampler2D originalTexture;
uniform sampler2D depthTexture;
uniform vec2 mouse;
uniform vec2 threshold;
uniform float time;

varying vec2 vUv;

vec2 mirrored(vec2 v) {
  vec2 m = mod(v, 2.0);
  return mix(m, 2.0 - m, step(1.0, m));
}

void main() {
  vec4 depth = texture2D(depthTexture, vUv);
  
  // 使用深度图和鼠标位置创建3D效果
  vec2 fake3d = vec2(
    vUv.x + (depth.r - 0.5) * mouse.x / threshold.x,
    vUv.y + (depth.r - 0.5) * mouse.y / threshold.y
  );
  
  vec4 color = texture2D(originalTexture, mirrored(fake3d));
  gl_FragColor = color;
} 