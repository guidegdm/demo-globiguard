import { useRef, useMemo, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Billboard } from '@react-three/drei';
import * as THREE from 'three';

// ─── Constants ────────────────────────────────────────────────────────────────

const ORBIT_RADIUS = 2.4;
const ORBIT_SPEED = 0.14; // radians per second
const PARTICLES_PER_MODEL = 15;

const MODELS = [
  { name: 'GPT-4o',     provider: 'OpenAI',    color: '#10a37f', logo: 'openai',    angle: 0 },
  { name: 'Claude 3.5', provider: 'Anthropic', color: '#e8761a', logo: 'anthropic', angle: Math.PI / 2 },
  { name: 'Gemini 1.5', provider: 'Google',    color: '#4285f4', logo: 'gemini',    angle: Math.PI },
  { name: 'Llama 3',    provider: 'Meta',      color: '#0866ff', logo: 'meta',      angle: Math.PI * 1.5 },
] as const;

type Model = (typeof MODELS)[number];

const EMERALD = new THREE.Color('#10b981');
// emerald in linear rgb01 for particle lerp
const ER = 0.025, EG = 0.527, EB = 0.377;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function hexToRgb01(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16) / 255,
    parseInt(hex.slice(3, 5), 16) / 255,
    parseInt(hex.slice(5, 7), 16) / 255,
  ];
}

function rrect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y); ctx.arcTo(x + w, y,     x + w, y + r,     r);
  ctx.lineTo(x + w, y + h - r); ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h); ctx.arcTo(x,     y + h, x,     y + h - r, r);
  ctx.lineTo(x, y + r); ctx.arcTo(x,     y,     x + r, y,         r);
}

// ─── Canvas logo icon drawing ─────────────────────────────────────────────────

function drawLogoIcon(
  ctx: CanvasRenderingContext2D,
  logo: string,
  cx: number, cy: number,
  size: number,
  color: string
) {
  ctx.save();
  ctx.translate(cx, cy);

  switch (logo) {
    case 'openai': {
      // Stylised bloom: 6 overlapping petals in a ring
      const petR = size * 0.39;
      ctx.globalAlpha = 0.92;
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
        ctx.beginPath();
        ctx.arc(Math.cos(a) * petR * 0.5, Math.sin(a) * petR * 0.5, petR * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      }
      // Dark centre cutout
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.17, 0, Math.PI * 2);
      ctx.fillStyle = '#060c14';
      ctx.fill();
      break;
    }

    case 'anthropic': {
      // Solid triangle with hollow inner triangle (Anthropic chevron mark)
      ctx.globalAlpha = 0.92;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(0,         -size * 0.52);
      ctx.lineTo( size * 0.46,  size * 0.36);
      ctx.lineTo(-size * 0.46,  size * 0.36);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#060c14';
      ctx.beginPath();
      ctx.moveTo(0,         -size * 0.18);
      ctx.lineTo( size * 0.28,  size * 0.22);
      ctx.lineTo(-size * 0.28,  size * 0.22);
      ctx.closePath();
      ctx.fill();
      break;
    }

    case 'gemini': {
      // 4-pointed elongated star (Gemini sparkle mark)
      const s = size * 0.52;
      const n = size * 0.10;
      ctx.globalAlpha = 0.92;
      ctx.fillStyle = color;
      [0, 90, 180, 270].forEach(deg => {
        ctx.save();
        ctx.rotate((deg * Math.PI) / 180);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo( n, -s * 0.28, 0, -s);
        ctx.quadraticCurveTo(-n, -s * 0.28, 0,  0);
        ctx.fill();
        ctx.restore();
      });
      break;
    }

    case 'meta': {
      // Lemniscate of Bernoulli — the mathematical infinity curve
      const a = size * 0.44;
      ctx.globalAlpha = 0.92;
      ctx.strokeStyle = color;
      ctx.lineWidth = size * 0.14;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      for (let t = 0; t <= Math.PI * 2 + 0.05; t += 0.04) {
        const d = 1 + Math.sin(t) * Math.sin(t);
        const x = (a * Math.cos(t)) / d;
        const y = (a * Math.sin(t) * Math.cos(t)) / d;
        t < 0.05 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
      break;
    }
  }

  ctx.restore();
}

// ─── Logo texture factory (called once per model in useMemo) ──────────────────

function createLogoTexture(model: Model): THREE.CanvasTexture {
  const S = 256;
  const canvas = document.createElement('canvas');
  canvas.width = S; canvas.height = S;
  const ctx = canvas.getContext('2d')!;
  const cx = S / 2, cy = S / 2;

  // Card background
  ctx.fillStyle = '#060c14';
  ctx.beginPath(); rrect(ctx, 0, 0, S, S, 24); ctx.fill();

  // Gradient border
  const bg = ctx.createLinearGradient(0, 0, S, S);
  bg.addColorStop(0, model.color + 'cc');
  bg.addColorStop(1, model.color + '33');
  ctx.strokeStyle = bg; ctx.lineWidth = 2;
  ctx.beginPath(); rrect(ctx, 1, 1, S - 2, S - 2, 23); ctx.stroke();

  // Inner glow
  const glow = ctx.createRadialGradient(cx, cy - 18, 0, cx, cy - 18, 96);
  glow.addColorStop(0, model.color + '22');
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow; ctx.fillRect(0, 0, S, S);

  // Logo icon
  drawLogoIcon(ctx, model.logo, cx, cy - 20, 48, model.color);

  // Model name
  ctx.font = 'bold 20px system-ui,-apple-system,sans-serif';
  ctx.fillStyle = '#f1f5f9';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(model.name, cx, cy + 46);

  // Provider label
  ctx.font = '14px system-ui,-apple-system,sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.fillText(model.provider, cx, cy + 68);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// ─── GlobiGuard centre node ───────────────────────────────────────────────────

function GlobiGuardCore() {
  const bracketRef = useRef<THREE.Group>(null);
  const ring1Ref   = useRef<THREE.Mesh>(null);
  const ring2Ref   = useRef<THREE.Mesh>(null);

  // Build extruded [ ] bracket geometry from normalised SVG path coordinates.
  // Source: D:\Dev\AI\globiguard\frontend\public\logo.svg  (viewBox 512×512)
  // Normalisation: x = (svg_x / 256 - 1) × 0.68   y = (1 - svg_y / 256) × 0.68
  const { leftGeom, rightGeom } = useMemo(() => {
    const extrude = { depth: 0.18, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.024, bevelSegments: 4 };

    const L = new THREE.Shape();
    L.moveTo(-0.483, 0.524); L.lineTo(-0.176, 0.524);
    L.lineTo(-0.176, 0.389); L.lineTo(-0.349, 0.389);
    L.lineTo(-0.349, -0.389); L.lineTo(-0.176, -0.389);
    L.lineTo(-0.176, -0.524); L.lineTo(-0.483, -0.524);
    L.closePath();

    const R = new THREE.Shape();
    R.moveTo(0.176, 0.524); R.lineTo(0.483, 0.524);
    R.lineTo(0.483, -0.524); R.lineTo(0.176, -0.524);
    R.lineTo(0.176, -0.389); R.lineTo(0.349, -0.389);
    R.lineTo(0.349, 0.389); R.lineTo(0.176, 0.389);
    R.closePath();

    return {
      leftGeom:  new THREE.ExtrudeGeometry(L, extrude),
      rightGeom: new THREE.ExtrudeGeometry(R, extrude),
    };
  }, []);

  useEffect(() => () => { leftGeom.dispose(); rightGeom.dispose(); }, [leftGeom, rightGeom]);

  const mat = useMemo(() => new THREE.MeshStandardMaterial({
    color: EMERALD, emissive: EMERALD, emissiveIntensity: 0.55,
    metalness: 0.45, roughness: 0.18,
  }), []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (bracketRef.current) bracketRef.current.scale.setScalar(1 + Math.sin(t * 1.6) * 0.03);
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z = t * 0.44;
      (ring1Ref.current.material as THREE.MeshBasicMaterial).opacity = 0.26 + Math.sin(t * 2 + 1) * 0.1;
    }
    if (ring2Ref.current) ring2Ref.current.rotation.z = -t * 0.21;
  });

  return (
    <group>
      {/* Dim outer guide ring */}
      <mesh ref={ring2Ref}>
        <torusGeometry args={[1.2, 0.005, 16, 100]} />
        <meshBasicMaterial color="#10b981" transparent opacity={0.1} />
      </mesh>

      {/* Animated inner glow ring */}
      <mesh ref={ring1Ref}>
        <torusGeometry args={[0.94, 0.018, 16, 72]} />
        <meshBasicMaterial color="#10b981" transparent opacity={0.3} />
      </mesh>

      {/* Extruded [ ] brackets, z-centred on the extrusion depth */}
      <group ref={bracketRef} position={[0, 0, -0.09]}>
        <mesh geometry={leftGeom}  material={mat} />
        <mesh geometry={rightGeom} material={mat} />
      </group>

      {/* Emerald point light from the core */}
      <pointLight color="#10b981" intensity={2.8} distance={5.5} decay={2} />
    </group>
  );
}

// ─── Orbiting model card ──────────────────────────────────────────────────────

function ModelCard({ model }: { model: Model }) {
  const groupRef = useRef<THREE.Group>(null);
  const texture  = useMemo(() => createLogoTexture(model), [model]);
  useEffect(() => () => texture.dispose(), [texture]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const a = model.angle + clock.getElapsedTime() * ORBIT_SPEED;
    groupRef.current.position.set(
      Math.cos(a) * ORBIT_RADIUS,
      0,
      Math.sin(a) * ORBIT_RADIUS,
    );
  });

  return (
    <group ref={groupRef}>
      {/* Billboard keeps the plane facing the camera regardless of orbit angle */}
      <Billboard>
        <mesh>
          <planeGeometry args={[1.08, 1.08]} />
          <meshBasicMaterial map={texture} transparent side={THREE.DoubleSide} />
        </mesh>
      </Billboard>
    </group>
  );
}

// ─── Data-stream particles ────────────────────────────────────────────────────
// 60 particles (15 per model) flow from each card toward the GlobiGuard core.
// Colour lerps from the model's brand colour → emerald as they near the centre.

function DataStreams() {
  const pointsRef = useRef<THREE.Points>(null);

  const { geo, modelRgb } = useMemo(() => {
    const N = MODELS.length * PARTICLES_PER_MODEL;
    const posArr = new Float32Array(N * 3);
    const colArr = new Float32Array(N * 3);
    const modelRgb = MODELS.map(m => hexToRgb01(m.color));

    MODELS.forEach((m, mi) => {
      const [mr, mg, mb] = modelRgb[mi];
      for (let pi = 0; pi < PARTICLES_PER_MODEL; pi++) {
        const idx = mi * PARTICLES_PER_MODEL + pi;
        const t   = pi / PARTICLES_PER_MODEL; // spread along path 0→1
        posArr[idx * 3]     = Math.cos(m.angle) * ORBIT_RADIUS * (1 - t) + (Math.random() - 0.5) * 0.3;
        posArr[idx * 3 + 1] = (Math.random() - 0.5) * 0.25;
        posArr[idx * 3 + 2] = Math.sin(m.angle) * ORBIT_RADIUS * (1 - t) + (Math.random() - 0.5) * 0.3;
        colArr[idx * 3] = mr; colArr[idx * 3 + 1] = mg; colArr[idx * 3 + 2] = mb;
      }
    });

    const posAttr = new THREE.BufferAttribute(posArr, 3);
    const colAttr = new THREE.BufferAttribute(colArr, 3);
    posAttr.usage = THREE.DynamicDrawUsage;
    colAttr.usage = THREE.DynamicDrawUsage;

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', posAttr);
    geo.setAttribute('color',    colAttr);
    return { geo, modelRgb };
  }, []);

  useEffect(() => () => geo.dispose(), [geo]);

  useFrame(({ clock }, delta) => {
    const pts = pointsRef.current;
    if (!pts) return;

    const pos   = pts.geometry.attributes.position.array as Float32Array;
    const col   = pts.geometry.attributes.color.array    as Float32Array;
    const speed = 1.5 * Math.min(delta, 0.05); // cap delta to avoid teleports
    const tOrb  = clock.getElapsedTime() * ORBIT_SPEED;

    MODELS.forEach((m, mi) => {
      const [mr, mg, mb] = modelRgb[mi];
      // Model world position this frame — same formula as ModelCard.useFrame
      const worldAngle = m.angle + tOrb;
      const mx = Math.cos(worldAngle) * ORBIT_RADIUS;
      const mz = Math.sin(worldAngle) * ORBIT_RADIUS;

      for (let pi = 0; pi < PARTICLES_PER_MODEL; pi++) {
        const i3  = (mi * PARTICLES_PER_MODEL + pi) * 3;
        const x = pos[i3], y = pos[i3 + 1], z = pos[i3 + 2];
        const dist = Math.sqrt(x * x + y * y + z * z);

        if (dist < 0.28) {
          // Respawn at current model world position with jitter
          pos[i3]     = mx + (Math.random() - 0.5) * 0.42;
          pos[i3 + 1] = (Math.random() - 0.5) * 0.28;
          pos[i3 + 2] = mz + (Math.random() - 0.5) * 0.42;
        } else {
          const inv = speed / dist;
          pos[i3]     -= x * inv;
          pos[i3 + 1] -= y * inv;
          pos[i3 + 2] -= z * inv;
        }

        // Lerp colour from model brand → emerald as particle nears core
        const blend = Math.max(0, Math.min(1, 1 - dist / ORBIT_RADIUS));
        col[i3]     = mr + (ER - mr) * blend;
        col[i3 + 1] = mg + (EG - mg) * blend;
        col[i3 + 2] = mb + (EB - mb) * blend;
      }
    });

    pts.geometry.attributes.position.needsUpdate = true;
    pts.geometry.attributes.color.needsUpdate    = true;
  });

  return (
    <points ref={pointsRef} geometry={geo}>
      <pointsMaterial
        size={0.055}
        vertexColors
        transparent
        opacity={0.78}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

// ─── Full scene ───────────────────────────────────────────────────────────────

function Scene() {
  return (
    <>
      {/* Lighting — needed for MeshStandardMaterial on the brackets */}
      <ambientLight intensity={0.28} />
      <directionalLight position={[2, 4, 4]} intensity={0.7} />
      <pointLight position={[3, 1.5, 3]} intensity={0.9} color="#6366f1" distance={14} decay={2} />

      {/* Deep background stars */}
      <Stars radius={22} depth={9} count={600} factor={2.5} saturation={0.05} speed={0.4} fade />

      <GlobiGuardCore />

      {MODELS.map((m, i) => <ModelCard key={i} model={m} />)}

      <DataStreams />
    </>
  );
}

// ─── Canvas wrapper — exported and lazy-loaded by HeroSection ─────────────────

export function HeroScene3D() {
  return (
    <Canvas
      camera={{ position: [0, 1.6, 6], fov: 42, near: 0.1, far: 60 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 1.5]}
      style={{ background: 'transparent' }}
    >
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
    </Canvas>
  );
}
