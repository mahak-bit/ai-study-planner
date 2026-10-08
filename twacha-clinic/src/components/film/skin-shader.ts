/**
 * Fragment shader for the hero "skin film": a satin, skin-like surface with a
 * golden serum droplet that falls, is absorbed and sends ripples outward.
 * Everything is driven by `uP` (scroll progress 0–1); `uTime` only adds a slow
 * living drift. Pure procedural rendering — no textures, no 3D library.
 */
export const vertexShader = /* glsl */ `
attribute vec2 aPos;
void main() {
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

export const fragmentShader = /* glsl */ `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2 uRes;
uniform float uTime;
uniform float uP;
uniform vec2 uMouse;

const vec3 IVORY = vec3(0.969, 0.945, 0.910);
const vec3 SAND  = vec3(0.855, 0.788, 0.706);
const vec3 PEACH = vec3(0.902, 0.757, 0.639);
const vec3 AMBER = vec3(0.788, 0.541, 0.271);
const vec3 L     = vec3(-0.477, 0.811, 0.334); // normalised key light

const float IMPACT = 0.30;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float impactT() { return clamp((uP - IMPACT) / (1.0 - IMPACT), 0.0, 1.0); }

float height(vec2 q, float detail) {
  float t = uTime;
  float h = 0.07 * sin(q.x * 1.1 + 0.8 * sin(q.y * 0.7 + t * 0.12));
  h += 0.045 * sin(q.y * 1.6 - q.x * 0.6 + t * 0.09);
  h += 0.02 * sin((q.x + q.y) * 2.7 + t * 0.2);
  h += detail * 0.006 * (noise(q * 9.0) - 0.5);
  h += detail * 0.0025 * (noise(q * 38.0) - 0.5);

  float it = impactT();
  if (it > 0.0) {
    float r = length(q);
    float R = it * 5.5;
    float amp = 0.11 * exp(-1.6 * it) * smoothstep(0.0, 0.04, it);
    float d1 = r - R;
    h += amp * sin(d1 * 10.0) * exp(-d1 * d1 * 2.2);
    float d2 = r - R * 0.62;
    h += amp * 0.6 * sin(d2 * 11.0) * exp(-d2 * d2 * 3.0);
    float d3 = r - R * 0.3;
    h += amp * 0.35 * sin(d3 * 12.0) * exp(-d3 * d3 * 5.0);
  }
  return h;
}

vec3 normalAt(vec2 q, float detail) {
  float e = 0.012;
  float hx = height(q + vec2(e, 0.0), detail) - height(q - vec2(e, 0.0), detail);
  float hz = height(q + vec2(0.0, e), detail) - height(q - vec2(0.0, e), detail);
  return normalize(vec3(-hx, 2.0 * e, -hz));
}

// Droplet state, shared by the surface (shadow/caustic) and the droplet itself.
float fallT()   { return clamp(uP / IMPACT, 0.0, 1.0); }
float absorbT() { return smoothstep(IMPACT, IMPACT + 0.1, uP); }
float dropRad() { return 0.3 * (1.0 - absorbT()); }
float stretch() { return 1.0 + 0.35 * fallT() * (1.0 - absorbT()); }
vec3 dropCenter() {
  float f = fallT();
  float bob = 0.05 * sin(uTime * 1.4) * (1.0 - smoothstep(0.0, 0.08, uP));
  return vec3(0.0, mix(1.2, 0.27, f * f) + bob, 0.0);
}

vec3 shadeSurface(vec3 p, vec3 rd, float detail) {
  vec3 n = normalAt(p.xz, detail);
  float dif = clamp(dot(n, L), 0.0, 1.0);
  vec3 hv = normalize(L - rd);
  float nh = clamp(dot(n, hv), 0.0, 1.0);
  float spec = pow(nh, 60.0) * 0.32 + pow(nh, 10.0) * 0.1;
  float fres = pow(1.0 - clamp(dot(n, -rd), 0.0, 1.0), 4.0);

  // warm "subsurface" tone in the shaded folds, ivory where lit
  vec3 col = mix(PEACH * 0.93, IVORY, smoothstep(0.35, 1.0, dif));
  col = mix(col, SAND, 0.22 * (1.0 - dif));
  col += vec3(1.0, 0.96, 0.9) * spec;
  col += IVORY * fres * 0.2;

  float rad = dropRad();
  if (rad > 0.001) {
    vec3 c = dropCenter();
    vec3 s = c - L * (c.y / L.y);
    float dist = length(p.xz - s.xz);
    float soft = rad * (1.0 + c.y * 1.2);
    float occl = (1.0 - smoothstep(0.0, soft * 1.4, dist)) / (1.0 + c.y * 0.8);
    col *= 1.0 - 0.3 * occl;
    // light focused through the drop lands just inside its shadow
    vec2 cc = s.xz + (c.xz - s.xz) * 0.25;
    float cd = length(p.xz - cc);
    float caustic = exp(-cd * cd / (0.012 + 0.03 * c.y)) * 0.7 / (1.0 + c.y);
    col += AMBER * caustic * 0.55 + vec3(1.0, 0.86, 0.62) * caustic * 0.3;
  }

  // brief golden glow where the drop is absorbed
  float flash = smoothstep(IMPACT - 0.01, IMPACT + 0.02, uP) * (1.0 - smoothstep(IMPACT + 0.02, IMPACT + 0.16, uP));
  col += AMBER * 0.35 * flash * exp(-dot(p.xz, p.xz) * 3.0);
  return col;
}

// Ray vs vertically stretched sphere. Returns distance or -1.
float hitDrop(vec3 ro, vec3 rd, out vec3 n) {
  float rad = dropRad();
  if (rad < 0.001) return -1.0;
  vec3 c = dropCenter();
  vec3 sc = vec3(1.0, 1.0 / stretch(), 1.0);
  vec3 oc = (ro - c) * sc;
  vec3 d = rd * sc;
  float a = dot(d, d);
  float b = dot(oc, d);
  float k = dot(oc, oc) - rad * rad;
  float disc = b * b - a * k;
  if (disc < 0.0) return -1.0;
  float t = (-b - sqrt(disc)) / a;
  if (t < 0.0) return -1.0;
  vec3 pl = ro + rd * t - c;
  float s2 = stretch() * stretch();
  n = normalize(vec3(pl.x, pl.y / s2, pl.z));
  return t;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  float aspect = uRes.x / uRes.y;
  float ease = smoothstep(0.0, 1.0, uP);

  // keep the droplet to the right of the headline on wide screens
  uv.x -= 0.42 * smoothstep(1.1, 1.7, aspect);
  // on portrait screens the copy sits low, so frame the droplet near the top
  uv.y -= 0.17 * (1.0 - smoothstep(0.5, 0.9, aspect));

  float ang = -0.6 + 0.45 * uP + uMouse.x * 0.06;
  float dist = mix(4.6, 3.0, ease) * (1.0 + max(0.0, 1.0 - aspect) * 0.9);
  float camH = mix(2.4, 1.35, ease) + uMouse.y * 0.08;
  vec3 ro = vec3(sin(ang) * dist, camH, cos(ang) * dist);
  vec3 ta = vec3(0.0, mix(0.75, 0.2, ease), 0.0);
  vec3 ww = normalize(ta - ro);
  vec3 uu = normalize(cross(ww, vec3(0.0, 1.0, 0.0)));
  vec3 vv = cross(uu, ww);
  vec3 rd = normalize(uv.x * uu + uv.y * vv + 1.7 * ww);

  vec3 bg = mix(IVORY, vec3(0.925, 0.886, 0.835), smoothstep(-0.2, 0.7, uv.y));
  vec3 col = bg;

  float tPlane = rd.y < 0.0 ? -ro.y / rd.y : 1e5;
  vec3 dn;
  float tDrop = hitDrop(ro, rd, dn);

  if (tDrop > 0.0 && tDrop < tPlane) {
    vec3 hp = ro + rd * tDrop;
    float facing = clamp(dot(dn, -rd), 0.0, 1.0);
    float fr = pow(1.0 - facing, 3.0);
    vec3 rr = refract(rd, dn, 0.75);
    vec3 behind = bg;
    if (rr.y < 0.0) {
      float tp = -hp.y / rr.y;
      behind = shadeSurface(hp + rr * tp, rr, 1.0);
    }
    col = mix(behind, AMBER, 0.5) * vec3(1.06, 0.96, 0.86);
    col += AMBER * 0.25 * pow(1.0 - facing, 1.5);
    float spec = pow(clamp(dot(reflect(rd, dn), L), 0.0, 1.0), 120.0) * 1.4;
    spec += pow(clamp(dot(reflect(rd, dn), normalize(vec3(0.6, 0.4, -0.5))), 0.0, 1.0), 40.0) * 0.25;
    col = mix(col, IVORY, fr * 0.45) + spec;
  } else if (tPlane < 1e4) {
    vec3 p = ro + rd * tPlane;
    float detail = 1.0 - smoothstep(3.0, 8.0, tPlane);
    col = shadeSurface(p, rd, detail);
    col = mix(col, bg, smoothstep(5.0, 13.0, tPlane));
  }

  // final warm bloom
  col *= 1.0 + 0.04 * smoothstep(0.65, 1.0, uP);
  col *= mix(vec3(1.0), vec3(1.02, 1.0, 0.975), smoothstep(0.6, 1.0, uP));
  col *= 1.0 - 0.1 * dot(uv, uv);
  col += (hash(gl_FragCoord.xy + fract(uTime) * 91.0) - 0.5) * 0.022;

  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;
