export const waterVertexShader = /* glsl */ `
uniform float uTime;
uniform vec2 uMouse;
uniform float uRippleStrength;
varying vec2 vUv;
varying float vElevation;
varying vec3 vWorldPosition;
varying vec3 vNormalW;

float wave(vec2 p) {
  float w1 = sin(p.x * 4.8 + uTime * 1.2) * 0.11;
  float w2 = sin((p.y * 2.2 + p.x * 1.4) * 3.8 - uTime * 0.85) * 0.08;
  float w3 = sin(p.x * 10.0 - uTime * 1.7) * 0.035;
  float w4 = sin(p.y * 14.0 + uTime * 1.55) * 0.018;
  float w5 = sin((p.x - p.y) * 7.0 + uTime * 1.9) * 0.022;
  return w1 + w2 + w3 + w4 + w5;
}

void main() {
  vUv = uv;
  vec3 pos = position;

  float baseWave = wave(pos.xz);
  float distToRipple = distance(vUv, uMouse);
  float rippleRing = sin(56.0 * distToRipple - uTime * 8.6) * exp(-10.0 * distToRipple);
  float rippleCore = exp(-26.0 * distToRipple);
  float ripple = (rippleRing * 0.28 + rippleCore * 0.12) * uRippleStrength;

  pos.y += baseWave + ripple;
  pos.x += ripple * 0.06;
  pos.z += ripple * 0.08;

  vec4 world = modelMatrix * vec4(pos, 1.0);
  vWorldPosition = world.xyz;
  vElevation = pos.y;

  vec3 objectNormal = normalize(vec3(
    -(cos(pos.x * 4.8 + uTime * 1.2) * 0.42 + cos((pos.x - pos.z) * 7.0 + uTime * 1.9) * 0.12),
    1.0,
    -(cos((pos.z * 2.2 + pos.x * 1.4) * 3.8 - uTime * 0.85) * 0.28 + cos(pos.z * 14.0 + uTime * 1.55) * 0.08)
  ));

  vNormalW = normalize(mat3(modelMatrix) * objectNormal);

  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

export const waterFragmentShader = /* glsl */ `
uniform float uTime;
uniform vec2 uMouse;
uniform float uRippleStrength;
uniform float uThemeMix;
varying vec2 vUv;
varying float vElevation;
varying vec3 vWorldPosition;
varying vec3 vNormalW;

void main() {
  vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
  float fresnel = pow(1.0 - max(dot(viewDirection, normalize(vNormalW)), 0.0), 3.0);

  vec3 darkDeep = vec3(0.015, 0.075, 0.14);
  vec3 darkShallow = vec3(0.08, 0.24, 0.37);
  vec3 darkGlow = vec3(0.98, 0.90, 0.62);

  vec3 lightDeep = vec3(0.24, 0.46, 0.62);
  vec3 lightShallow = vec3(0.54, 0.75, 0.89);
  vec3 lightGlow = vec3(1.0, 0.95, 0.72);

  vec3 deepWater = mix(darkDeep, lightDeep, uThemeMix);
  vec3 shallowWater = mix(darkShallow, lightShallow, uThemeMix);
  vec3 glowColor = mix(darkGlow, lightGlow, uThemeMix);

  float shimmer = sin(vUv.x * 88.0 + uTime * 3.8 + vElevation * 26.0) * 0.5 + 0.5;
  float shimmer2 = sin(vUv.y * 64.0 - uTime * 2.4 + vElevation * 18.0) * 0.5 + 0.5;
  float mouseAura = exp(-18.0 * distance(vUv, uMouse));
  float highlightBand = smoothstep(0.08, 0.78, 1.0 - abs(vUv.x - 0.5));
  float horizon = smoothstep(0.22, 0.92, vUv.y);

  vec3 color = mix(deepWater, shallowWater, vUv.y * 0.75 + fresnel * 0.4);
  color += glowColor * fresnel * mix(0.38, 0.24, uThemeMix);
  color += glowColor * shimmer * 0.07 * highlightBand;
  color += glowColor * shimmer2 * 0.04 * horizon;
  color += glowColor * mouseAura * (0.16 + uRippleStrength * 0.35);
  color += vec3(0.08) * mouseAura * uRippleStrength;

  float alpha = mix(0.92, 0.88, uThemeMix);
  gl_FragColor = vec4(color, alpha);
}
`;
