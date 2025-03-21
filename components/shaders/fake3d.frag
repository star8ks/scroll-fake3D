uniform sampler2D originalTexture;
uniform sampler2D depthTexture;
uniform vec2 mouse;
uniform vec2 threshold;
uniform float time;

varying vec2 vUv;
/**
 * Creates a mirrored version of texture coordinates to prevent visible seams
 * when the UV coordinates go outside the 0-1 range.
 * @param v - The input texture coordinates
 * @return - Mirrored texture coordinates that wrap around at boundaries
 */
vec2 mirrored(vec2 v) {
  // Get the remainder of dividing by 2.0 to create a repeating pattern
  vec2 m = mod(v, 2.0);
  // For values > 1.0, invert the coordinates to create a mirror effect
  return mix(m, 2.0 - m, step(1.0, m));
}

void main() {
  // Sample the depth map at the current UV coordinate
  vec4 depth = texture2D(depthTexture, vUv);
  
  // Calculate the parallax offset based on depth and mouse position
  // The depth value (0-1) is centered around 0.5 to allow for bidirectional movement
  // Mouse values are scaled by threshold to control the parallax intensity
  vec2 fake3d = vec2(
    vUv.x + (depth.r - 0.5) * mouse.x / threshold.x,
    vUv.y + (depth.r - 0.5) * mouse.y / threshold.y
  );
  
  // Sample the original texture with the parallax-adjusted coordinates
  // Using mirrored function to handle edge cases smoothly
  vec4 color = texture2D(originalTexture, mirrored(fake3d));
  
  // Output the final color
  gl_FragColor = color;
} 