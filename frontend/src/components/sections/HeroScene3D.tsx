import { useRef, useMemo, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Billboard } from '@react-three/drei';
import * as THREE from 'three';

// ─── Constants ────────────────────────────────────────────────────────────────

const ORBIT_RADIUS = 2.0;
const ORBIT_SPEED  = 0.10;  // rad/s — comfortable pace for 8 models
const PARTICLES_PER_MODEL = 15;

const MODELS = [
  { name: 'GPT-5.4',     provider: 'OpenAI',    color: '#10a37f', logo: 'openai',    angle: 0              },
  { name: 'Claude 4.7',  provider: 'Anthropic', color: '#d97757', logo: 'anthropic', angle: Math.PI * 0.25 },
  { name: 'Gemini 3.1',  provider: 'Google',    color: '#4285f4', logo: 'gemini',    angle: Math.PI * 0.5  },
  { name: 'Llama 4',     provider: 'Meta',      color: '#0866ff', logo: 'meta',      angle: Math.PI * 0.75 },
  { name: 'Grok 3',      provider: 'xAI',       color: '#a3a3a3', logo: 'grok',      angle: Math.PI        },
  { name: 'Qwen 3',      provider: 'Alibaba',   color: '#8b5cf6', logo: 'qwen',      angle: Math.PI * 1.25 },
  { name: 'Kimi k2',     provider: 'Moonshot',  color: '#06b6d4', logo: 'kimi',      angle: Math.PI * 1.5  },
  { name: 'DeepSeek R2', provider: 'DeepSeek',  color: '#4f46e5', logo: 'deepseek',  angle: Math.PI * 1.75 },
] as const;

type Model = (typeof MODELS)[number];

const EMERALD = new THREE.Color('#10b981');
const ER = 0.025, EG = 0.527, EB = 0.377; // emerald in linear rgb01

// ─── Helpers ──────────────────────────────────────────────────────────────────

function hexToRgb01(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16) / 255,
    parseInt(hex.slice(3, 5), 16) / 255,
    parseInt(hex.slice(5, 7), 16) / 255,
  ];
}

function rrect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y); ctx.arcTo(x + w, y,     x + w, y + r,     r);
  ctx.lineTo(x + w, y + h - r); ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h); ctx.arcTo(x,     y + h, x,     y + h - r, r);
  ctx.lineTo(x, y + r); ctx.arcTo(x,     y,     x + r, y,         r);
}

// ─── Logo icon drawing ────────────────────────────────────────────────────────

function drawLogoIcon(
  ctx: CanvasRenderingContext2D,
  logo: string,
  cx: number, cy: number,
  size: number,
  color: string
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.globalAlpha = 0.92;

  switch (logo) {
    case 'openai': {
      ctx.fillStyle = color;
      for (let i = 0; i < 6; i++) {
        ctx.save();
        ctx.rotate((i * Math.PI) / 3);
        ctx.beginPath();
        ctx.ellipse(0, -size * 0.26, size * 0.11, size * 0.42, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#060c14';
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.17, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'anthropic': {
      ctx.strokeStyle = color;
      ctx.lineWidth = size * 0.15;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(-size * 0.38, size * 0.44);
      ctx.lineTo(0, -size * 0.48);
      ctx.lineTo(size * 0.38, size * 0.44);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-size * 0.21, size * 0.06);
      ctx.lineTo(size * 0.21, size * 0.06);
      ctx.stroke();
      break;
    }

    case 'gemini': {
      const s = size * 0.52;
      const n = size * 0.09;
      ctx.fillStyle = color;
      [0, 90, 180, 270].forEach(deg => {
        ctx.save();
        ctx.rotate((deg * Math.PI) / 180);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(n, -s * 0.28, 0, -s);
        ctx.quadraticCurveTo(-n, -s * 0.28, 0, 0);
        ctx.fill();
        ctx.restore();
      });
      break;
    }

    case 'meta': {
      const a = size * 0.44;
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

    case 'grok': {
      ctx.strokeStyle = color;
      ctx.lineWidth = size * 0.18;
      ctx.lineCap = 'round';
      const gs = size * 0.40;
      ctx.beginPath(); ctx.moveTo(-gs, -gs); ctx.lineTo(gs, gs); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(gs, -gs);  ctx.lineTo(-gs, gs); ctx.stroke();
      break;
    }

    case 'qwen': {
      ctx.strokeStyle = color;
      ctx.lineWidth = size * 0.13;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(0, -size * 0.05, size * 0.37, 0.35, Math.PI * 2 - 0.35);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(size * 0.19, size * 0.23);
      ctx.lineTo(size * 0.44, size * 0.48);
      ctx.stroke();
      break;
    }

    case 'kimi': {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.46, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#060c14';
      ctx.beginPath();
      ctx.arc(size * 0.17, -size * 0.10, size * 0.37, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'deepseek': {
      ctx.strokeStyle = color;
      ctx.lineWidth = size * 0.13;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-size * 0.44, 0);
      ctx.quadraticCurveTo(0, -size * 0.34, size * 0.44, 0);
      ctx.quadraticCurveTo(0,  size * 0.34, -size * 0.44, 0);
      ctx.stroke();
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.16, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#060c14';
      ctx.beginPath();
      ctx.arc(size * 0.05, -size * 0.05, size * 0.07, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
  }

  ctx.restore();
}

// ─── Card canvas texture factory ──────────────────────────────────────────────

function createLogoTexture(model: Model): THREE.CanvasTexture {
  const S = 256;
  const canvas = document.createElement('canvas');
  canvas.width = S; canvas.height = S;
  const ctx = canvas.getContext('2d')!;
  const cx = S / 2, cy = S / 2;

  ctx.fillStyle = '#060c14';
  ctx.beginPath(); rrect(ctx, 0, 0, S, S, 24); ctx.fill();

  const bg = ctx.createLinearGradient(0, 0, S, S);
  bg.addColorStop(0, model.color + 'cc');
  bg.addColorStop(1, model.color + '33');
  ctx.strokeStyle = bg; ctx.lineWidth = 2;
  ctx.beginPath(); rrect(ctx, 1, 1, S - 2, S - 2, 23); ctx.stroke();

  const glow = ctx.createRadialGradient(cx, cy - 18, 0, cx, cy - 18, 96);
  glow.addColorStop(0, model.color + '22');
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow; ctx.fillRect(0, 0, S, S);

  drawLogoIcon(ctx, model.logo, cx, cy - 20, 48, model.color);

  ctx.font = 'bold 19px system-ui,-apple-system,sans-serif';
  ctx.fillStyle = '#f1f5f9';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(model.name, cx, cy + 44);

  ctx.font = '13px system-ui,-apple-system,sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.fillText(model.provider, cx, cy + 64);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// ─── GlobiGuard centre node ───────────────────────────────────────────────────

function GlobiGuardCore() {
  const bracketRef = useRef<THREE.Group>(null);
  const ring1Ref   = useRef<THREE.Mesh>(null);
  const ring2Ref   = useRef<THREE.Mesh>(null);

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
      {/* Flat orbit-path guide ring in the XZ plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[ORBIT_RADIUS, 0.006, 16, 128]} />
        <meshBasicMaterial color="#10b981" transparent opacity={0.10} />
      </mesh>

      {/* Outer vertical decorative ring */}
      <mesh ref={ring2Ref}>
        <torusGeometry args={[1.0, 0.005, 16, 100]} />
        <meshBasicMaterial color="#10b981" transparent opacity={0.10} />
      </mesh>

      {/* Animated inner glow ring */}
      <mesh ref={ring1Ref}>
        <torusGeometry args={[0.78, 0.018, 16, 72]} />
        <meshBasicMaterial color="#10b981" transparent opacity={0.3} />
      </mesh>

      <group ref={bracketRef} position={[0, 0, -0.09]}>
        <mesh geometry={leftGeom}  material={mat} />
        <mesh geometry={rightGeom} material={mat} />
      </group>

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
      <Billboard>
        <mesh>
          <planeGeometry args={[0.9, 0.9]} />
          <meshBasicMaterial map={texture} transparent side={THREE.DoubleSide} />
        </mesh>
      </Billboard>
    </group>
  );
}

// ─── Data-stream particles ────────────────────────────────────────────────────

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
        const t   = pi / PARTICLES_PER_MODEL;
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
    const speed = 1.5 * Math.min(delta, 0.05);
    const tOrb  = clock.getElapsedTime() * ORBIT_SPEED;

    MODELS.forEach((m, mi) => {
      const [mr, mg, mb] = modelRgb[mi];
      const worldAngle = m.angle + tOrb;
      const mx = Math.cos(worldAngle) * ORBIT_RADIUS;
      const mz = Math.sin(worldAngle) * ORBIT_RADIUS;

      for (let pi = 0; pi < PARTICLES_PER_MODEL; pi++) {
        const i3   = (mi * PARTICLES_PER_MODEL + pi) * 3;
        const x = pos[i3], y = pos[i3 + 1], z = pos[i3 + 2];
        const dist = Math.sqrt(x * x + y * y + z * z);

        if (dist < 0.28) {
          pos[i3]     = mx + (Math.random() - 0.5) * 0.42;
          pos[i3 + 1] = (Math.random() - 0.5) * 0.28;
          pos[i3 + 2] = mz + (Math.random() - 0.5) * 0.42;
        } else {
          const inv = speed / dist;
          pos[i3]     -= x * inv;
          pos[i3 + 1] -= y * inv;
          pos[i3 + 2] -= z * inv;
        }

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
        size={0.052}
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
      <ambientLight intensity={0.28} />
      <directionalLight position={[2, 4, 4]} intensity={0.7} />
      <pointLight position={[3, 1.5, 3]} intensity={0.9} color="#6366f1" distance={14} decay={2} />
      <Stars radius={22} depth={9} count={600} factor={2.5} saturation={0.05} speed={0.4} fade />
      <GlobiGuardCore />
      {MODELS.map((m, i) => <ModelCard key={i} model={m} />)}
      <DataStreams />
    </>
  );
}

// ─── Canvas wrapper ───────────────────────────────────────────────────────────
// Camera fov=55: at worst-case orbit angle, card edge NDC_x ~0.774 — inside frustum.

export function HeroScene3D() {
  return (
    <Canvas
      camera={{ position: [0, 1.6, 6], fov: 55, near: 0.1, far: 60 }}
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
