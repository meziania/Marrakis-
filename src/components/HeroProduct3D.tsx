"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Float,
  PresentationControls,
  Sparkles,
  useTexture,
} from "@react-three/drei";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";

const LOGO_SRC = "/brand/logo-marrakisse.png";

function MoroccanArch({ scale = 1 }: { scale?: number }) {
  const geometries = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const r = 1.15;
    pts.push(new THREE.Vector3(-r, -1.55, 0));
    pts.push(new THREE.Vector3(-r, 0.1, 0));
    for (let i = 0; i <= 56; i++) {
      const t = i / 56;
      const a = Math.PI - t * Math.PI;
      const bulge = 1 + 0.12 * Math.sin(t * Math.PI);
      pts.push(
        new THREE.Vector3(
          Math.cos(a) * r * bulge,
          0.1 + Math.sin(a) * r * 0.95,
          0
        )
      );
    }
    pts.push(new THREE.Vector3(r, 0.1, 0));
    pts.push(new THREE.Vector3(r, -1.55, 0));
    const curve = new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.12);
    return {
      main: new THREE.TubeGeometry(curve, 180, 0.045, 16, false),
      glow: new THREE.TubeGeometry(curve, 180, 0.02, 12, false),
    };
  }, []);

  return (
    <group scale={scale}>
      <mesh geometry={geometries.main} castShadow>
        <meshStandardMaterial
          color="#d4af37"
          metalness={1}
          roughness={0.18}
          envMapIntensity={1.5}
        />
      </mesh>
      <mesh geometry={geometries.glow}>
        <meshStandardMaterial
          color="#f5e6a8"
          metalness={1}
          roughness={0.1}
          emissive="#c9a227"
          emissiveIntensity={0.35}
        />
      </mesh>
    </group>
  );
}

function FloatingTiles() {
  const group = useRef<THREE.Group>(null);
  const tiles = useMemo(() => {
    const colors = ["#0d5c75", "#148a9a", "#1fb3b8", "#c9a227", "#0a3d4a"];
    return Array.from({ length: 18 }, (_, i) => {
      const a = (i / 18) * Math.PI * 2;
      const radius = 1.55 + (i % 3) * 0.22;
      return {
        color: colors[i % colors.length],
        radius,
        speed: 0.15 + (i % 5) * 0.04,
        phase: a,
        y: -0.9 + (i % 6) * 0.35,
        size: 0.1 + (i % 4) * 0.025,
      };
    });
  }, []);

  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.getElapsedTime();
    group.current.children.forEach((child, i) => {
      const tile = tiles[i];
      const a = tile.phase + t * tile.speed;
      child.position.set(
        Math.cos(a) * tile.radius,
        tile.y + Math.sin(t * 0.8 + i) * 0.08,
        Math.sin(a) * tile.radius * 0.55
      );
      child.rotation.x = t * 0.4 + i;
      child.rotation.z = Math.PI / 4 + t * 0.2;
    });
  });

  return (
    <group ref={group}>
      {tiles.map((tile, i) => (
        <mesh key={i} castShadow>
          <boxGeometry args={[tile.size, tile.size, 0.04]} />
          <meshStandardMaterial
            color={tile.color}
            metalness={tile.color === "#c9a227" ? 0.95 : 0.35}
            roughness={0.3}
            emissive={tile.color}
            emissiveIntensity={0.15}
          />
        </mesh>
      ))}
    </group>
  );
}

function LogoLayers() {
  const raw = useTexture(LOGO_SRC);
  const textures = useMemo(() => {
    const mk = (repeatX: number, repeatY: number, ox: number, oy: number) => {
      const t = raw.clone();
      t.colorSpace = THREE.SRGBColorSpace;
      t.repeat.set(repeatX, repeatY);
      t.offset.set(ox, oy);
      t.needsUpdate = true;
      return t;
    };
    return {
      full: (() => {
        const t = raw.clone();
        t.colorSpace = THREE.SRGBColorSpace;
        t.needsUpdate = true;
        return t;
      })(),
      calligraphy: mk(0.5, 0.28, 0.25, 0.58),
      zellige: mk(0.7, 0.18, 0.15, 0.08),
    };
  }, [raw]);

  const group = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.getElapsedTime();
    group.current.position.y = Math.sin(t * 0.7) * 0.06;
  });

  return (
    <group ref={group} position={[0, 0.05, 0]}>
      {/* Glass slab behind logo */}
      <mesh position={[0, 0, -0.12]}>
        <boxGeometry args={[1.7, 2.35, 0.08]} />
        <meshPhysicalMaterial
          color="#e8f2f4"
          transmission={0.7}
          thickness={0.55}
          roughness={0.15}
          metalness={0.05}
          ior={1.45}
          transparent
          envMapIntensity={1.1}
        />
      </mesh>

      {/* Main brand plaque */}
      <Float speed={1.4} rotationIntensity={0.08} floatIntensity={0.15}>
        <mesh castShadow position={[0, 0, 0]}>
          <boxGeometry args={[1.55, 2.15, 0.12]} />
          <meshStandardMaterial
            map={textures.full}
            metalness={0.55}
            roughness={0.35}
            envMapIntensity={1.2}
          />
        </mesh>
      </Float>

      {/* Calligraphy layer pushed forward */}
      <mesh castShadow position={[0, 0.55, 0.14]}>
        <boxGeometry args={[0.85, 0.5, 0.06]} />
        <meshStandardMaterial
          map={textures.calligraphy}
          metalness={0.7}
          roughness={0.25}
          emissive="#c9a227"
          emissiveIntensity={0.12}
        />
      </mesh>

      {/* Zellije strip floating ahead */}
      <mesh castShadow position={[0, -0.85, 0.16]}>
        <boxGeometry args={[1.15, 0.32, 0.07]} />
        <meshStandardMaterial
          map={textures.zellige}
          metalness={0.4}
          roughness={0.35}
          emissive="#0d5c75"
          emissiveIntensity={0.2}
        />
      </mesh>
    </group>
  );
}

function OrbitRings() {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.12;
    ref.current.rotation.z += delta * 0.04;
  });

  return (
    <group ref={ref}>
      <mesh rotation={[Math.PI / 2.4, 0, 0]}>
        <torusGeometry args={[1.85, 0.008, 12, 120]} />
        <meshStandardMaterial
          color="#d4af37"
          metalness={1}
          roughness={0.15}
          emissive="#c9a227"
          emissiveIntensity={0.4}
        />
      </mesh>
      <mesh rotation={[Math.PI / 3, 0.4, 0.2]}>
        <torusGeometry args={[2.05, 0.006, 12, 120]} />
        <meshStandardMaterial
          color="#1fb3b8"
          metalness={0.8}
          roughness={0.25}
          emissive="#0d5c75"
          emissiveIntensity={0.35}
        />
      </mesh>
    </group>
  );
}

function Scene() {
  const light = useRef<THREE.SpotLight>(null);
  useFrame(({ clock }) => {
    if (!light.current) return;
    const t = clock.getElapsedTime();
    light.current.position.x = Math.cos(t * 0.35) * 3.5;
    light.current.position.z = Math.sin(t * 0.35) * 3.5 + 1;
  });

  return (
    <>
      <ambientLight intensity={0.9} />
      <spotLight
        ref={light}
        position={[3, 4, 3]}
        angle={0.45}
        penumbra={0.7}
        intensity={2.4}
        castShadow
        color="#fff6e0"
      />
      <pointLight position={[0, 1, 2]} intensity={0.55} color="#7ec8d3" />
      <pointLight position={[0, -1.5, 1]} intensity={0.4} color="#c9a227" />

      <PresentationControls
        global
        cursor
        snap
        speed={1.05}
        zoom={1}
        polar={[-0.25, 0.3]}
        azimuth={[-0.9, 0.9]}
      >
        <group position={[0, 0.1, 0]}>
          <MoroccanArch />
          <LogoLayers />
          <FloatingTiles />
          <OrbitRings />
          <Sparkles
            count={45}
            scale={[4, 4, 3]}
            size={2}
            speed={0.3}
            color="#c9a227"
            opacity={0.45}
          />
        </group>
      </PresentationControls>

      <ContactShadows
        position={[0, -1.7, 0]}
        opacity={0.28}
        scale={12}
        blur={3.2}
        far={4.5}
        color="#5c4a28"
      />
      <Environment preset="studio" />
    </>
  );
}

export function HeroProduct3D() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        minHeight: "100%",
        touchAction: "none",
      }}
      aria-label="MARRAKISSE 3D brand experience"
      role="img"
    >
      <Canvas
        camera={{ position: [2.2, 0.4, 4.2], fov: 38 }}
        dpr={[1, 1.6]}
        gl={{ antialias: true, alpha: true }}
        shadows
        style={{ width: "100%", height: "100%", background: "transparent" }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}
