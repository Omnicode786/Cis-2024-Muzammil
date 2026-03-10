export const waterVertexShader = /* glsl */ `
uniform float uTime;
uniform vec2 uMouse;
uniform float uRippleStrength;
uniform float uHover;
varying vec2 vUv;
varying float vElevation;
varying vec3 vWorldPosition;
varying vec3 vNormalW;

float wave(vec2 p) {
  float w1 = sin(p.x * 6.0 + uTime * 1.4) * 0.08;
  float w2 = sin((p.y + p.x) * 4.5 - uTime * 0.9) * 0.06;
  float w3 = sin(p.x * 12.0 - uTime * 2.0) * 0.025;
  float w4 = sin(p.y * 14.0 + uTime * 1.7) * 0.02;
  return w1 + w2 + w3 + w4;
}

void main() {
  vUv = uv;
  vec3 pos = position;

  float baseWave = wave(pos.xz);
  vec2 rippleCenter = vec2(uMouse.x, uMouse.y);
  float distToRipple = distance(vUv, rippleCenter);
  float rippleRing = sin(48.0 * distToRipple - uTime * 8.0) * exp(-9.0 * distToRipple);
  float ripple = rippleRing * uRippleStrength * 0.22;

  pos.y += baseWave + ripple;
  pos.x += ripple * 0.08;
  pos.z += ripple * 0.08;

  vec4 world = modelMatrix * vec4(pos, 1.0);
  vWorldPosition = world.xyz;
  vElevation = pos.y;

  vec3 objectNormal = normalize(vec3(
    -cos(pos.x * 6.0 + uTime * 1.4) * 0.45,
    1.0,
    -cos((pos.z + pos.x) * 4.5 - uTime * 0.9) * 0.3
  ));

  vNormalW = normalize(mat3(modelMatrix) * objectNormal);

  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

export const waterFragmentShader = /* glsl */ `
uniform float uTime;
uniform vec2 uMouse;
uniform float uRippleStrength;
uniform float uHover;
varying vec2 vUv;
varying float vElevation;
varying vec3 vWorldPosition;
varying vec3 vNormalW;

void main() {
  vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
  float fresnel = pow(1.0 - max(dot(viewDirection, normalize(vNormalW)), 0.0), 3.4);

  vec3 deepWater = vec3(0.01, 0.07, 0.14);
  vec3 shallowWater = vec3(0.08, 0.22, 0.35);
  vec3 moonGlow = vec3(0.98, 0.90, 0.62);

  float shimmer = sin(vUv.x * 70.0 + uTime * 3.5 + vElevation * 24.0) * 0.5 + 0.5;
  float mouseAura = exp(-14.0 * distance(vUv, uMouse));
  float highlightBand = smoothstep(0.15, 0.65, 1.0 - abs(vUv.x - 0.52));

  vec3 color = mix(deepWater, shallowWater, vUv.y + fresnel * 0.35);
  color += moonGlow * fresnel * 0.42;
  color += moonGlow * shimmer * 0.06 * highlightBand;
  color += moonGlow * mouseAura * (0.18 + uRippleStrength * 0.25);

  float alpha = 0.9;
  gl_FragColor = vec4(color, alpha);
}
`;
