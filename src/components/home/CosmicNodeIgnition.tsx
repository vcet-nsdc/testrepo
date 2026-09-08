'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ArrowUpRight } from 'lucide-react';
import { getHasPlayedIntro, setHasPlayedIntro } from '@/lib/introState';

interface CosmicNodeIgnitionProps {
  onSequenceComplete?: () => void;
}

// =============================================================================
// LOW-OPACITY GLSL BACKGROUND SHADER: SOFT COSMIC ETHER
// Extremely subtle, dark, atmospheric ether that does not overpower the logo
// =============================================================================
const bgVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const bgFragmentShader = `
  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec2 uLogoPos;
  uniform vec2 uMouse;
  varying vec2 vUv;

  // Lightweight 2D simplex noise helpers
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                        -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m;
    m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  // Optimized 3-octave FBM for silky smooth performance
  float fbm3(vec2 p) {
    float total = snoise(p) * 0.55;
    total += snoise(p * 2.08) * 0.30;
    total += snoise(p * 4.15) * 0.15;
    return total;
  }

  void main() {
    vec2 uv = vUv;
    vec2 aspectUv = (gl_FragCoord.xy - 0.5 * uResolution.xy) / uResolution.y;

    // Gentle slow cosmic ether drift
    float t = uTime * 0.035;
    vec2 flow = vec2(
      snoise(aspectUv * 1.2 + vec2(t * 0.3, -t * 0.2)),
      snoise(aspectUv * 1.2 + vec2(-t * 0.2, t * 0.35))
    );

    vec2 p = aspectUv + flow * 0.22 + (uMouse - 0.5) * 0.04;

    // Subtle localized glow centered behind the logo position
    vec2 logoScreenOffset = (uLogoPos - 0.5) * vec2(uResolution.x / uResolution.y, 1.0);
    float distToLogo = length(aspectUv - logoScreenOffset);
    float logoGlow = exp(-distToLogo * 1.8) * 0.65;

    // Nebula density
    float nebula = fbm3(p * 1.6 + vec2(t * 0.25, -t * 0.15));
    nebula = clamp(nebula * 0.8 + 0.25, 0.0, 1.0);

    // Deep Velvet Space Void
    vec3 deepVoid = vec3(0.0157, 0.0078, 0.0314);   // #040208
    vec3 purpleCore = vec3(0.18, 0.06, 0.35);       // Soft deep purple
    vec3 neonViolet = vec3(0.38, 0.18, 0.68);       // Muted electric violet
    vec3 lavenderGlow = vec3(0.55, 0.35, 0.85);     // Soft lavender aura

    // Low-opacity, non-intrusive blending
    vec3 color = deepVoid;
    color = mix(color, purpleCore, nebula * 0.22);
    color = mix(color, neonViolet, pow(nebula, 2.4) * 0.20);
    color += lavenderGlow * logoGlow * 0.14;

    // Soft smooth edge vignette
    float vignette = smoothstep(1.35, 0.25, length(aspectUv * vec2(0.85, 1.1)));
    color = mix(deepVoid, color, clamp(vignette, 0.0, 1.0));

    // Subtle film grain
    float grain = (fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * 0.012;
    color += grain;

    gl_FragColor = vec4(color, 1.0);
  }
`;

export function CosmicNodeIgnition({ onSequenceComplete }: CosmicNodeIgnitionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Three Duplicate Glowing Seed Nodes
  const seed1Ref = useRef<HTMLDivElement>(null); // Top Node -> Pill Navbar
  const seed2Ref = useRef<HTMLDivElement>(null); // Bottom-Left Node -> Social Sidebar
  const seed3Ref = useRef<HTMLDivElement>(null); // Center Node -> Hero Typography

  // Revealed UI Elements
  const heroTextRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    // Enforce instant scroll to top on refresh
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
      }
    }

    const alreadyPlayed = getHasPlayedIntro();

    // =========================================================================
    // 1. THREE.JS SCENE SETUP
    // =========================================================================
    const width = window.innerWidth;
    const height = window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 8.2);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: false,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;

    // =========================================================================
    // 2. ATMOSPHERIC LOW-OPACITY GLSL BACKGROUND SHADER PLANE
    // =========================================================================
    const bgUniforms = {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(width, height) },
      uLogoPos: { value: new THREE.Vector2(width >= 768 ? 0.32 : 0.5, 0.5) },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    };

    const bgScene = new THREE.Scene();
    const bgCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const bgQuad = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      new THREE.ShaderMaterial({
        vertexShader: bgVertexShader,
        fragmentShader: bgFragmentShader,
        uniforms: bgUniforms,
        depthWrite: false,
        depthTest: false,
      })
    );
    bgScene.add(bgQuad);

    // =========================================================================
    // 3. PHYSICAL STUDIO LIGHTING RIG
    // =========================================================================
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
    scene.add(ambientLight);

    // Front key specular light
    const frontKeyLight = new THREE.DirectionalLight(0xFFFFFF, 3.8);
    frontKeyLight.position.set(-2, 4, 7);
    scene.add(frontKeyLight);

    // Top-left neon lavender rim light
    const topRimLight = new THREE.DirectionalLight(0xC084FC, 3.4);
    topRimLight.position.set(-7, 8, 4);
    scene.add(topRimLight);

    // Bottom-right electric violet fill light
    const fillLight = new THREE.DirectionalLight(0x7F45DB, 2.6);
    fillLight.position.set(6, -5, 4);
    scene.add(fillLight);

    // Back kicker light
    const backLight = new THREE.DirectionalLight(0xA855F7, 2.8);
    backLight.position.set(0, 0, -4);
    scene.add(backLight);

    // Subtle 3D Cosmic Dust in front of shader
    const particleCount = 350;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePos[i] = (Math.random() - 0.5) * 26;
      particlePos[i + 1] = (Math.random() - 0.5) * 18;
      particlePos[i + 2] = (Math.random() - 0.5) * 14;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xD8B4FE,
      size: 0.038,
      transparent: true,
      opacity: alreadyPlayed ? 0.55 : 0,
      blending: THREE.AdditiveBlending,
    });
    const starfield = new THREE.Points(particleGeo, particleMat);
    scene.add(starfield);

    // =========================================================================
    // 4. REFINED 3D BRAND EMBLEM (FAITHFUL TO OFFICIAL VCET NSDC LOGO)
    // =========================================================================
    const targetEmblemScale = width >= 768 ? 0.9 : 0.78;
    const initialEmblemScale = alreadyPlayed ? targetEmblemScale : 0;

    const emblemGroup = new THREE.Group();
    if (width >= 768) {
      emblemGroup.position.set(-2.2, 0, 0);
    } else {
      emblemGroup.position.set(0, 0, 0);
    }
    emblemGroup.scale.set(initialEmblemScale, initialEmblemScale, initialEmblemScale);
    scene.add(emblemGroup);

    // Luxury Polished Obsidian-Chrome Material
    const obsidianChromeMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x2A1B45,
      metalness: 0.92,
      roughness: 0.12,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      reflectivity: 0.96,
      emissive: 0x6B21A8,
      emissiveIntensity: 0.35,
    });

    // Brilliant Emissive Core Crystal Material for Nodes (Dots)
    const coreCrystalMaterial = new THREE.MeshStandardMaterial({
      color: 0x4C1D95,
      emissive: 0xC084FC,
      emissiveIntensity: alreadyPlayed ? 2.4 : 0,
      roughness: 0.08,
      metalness: 0.85,
    });

    // Solid Metallic Diagonal Axis Rod Material
    const axisRodMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x24153B,
      emissive: 0x9333EA,
      emissiveIntensity: alreadyPlayed ? 1.6 : 0,
      metalness: 0.94,
      roughness: 0.10,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
    });

    const initialElementScale = alreadyPlayed ? 1 : 0;

    // -------------------------------------------------------------------------
    // 4A. The Three Clean Official Nodes (Dots) — NO attached collar on center!
    // -------------------------------------------------------------------------
    // Central Primary Node (Dot 1) — Pure dot, no collar ring
    const sphereCenter = new THREE.Mesh(new THREE.SphereGeometry(0.38, 36, 36), coreCrystalMaterial.clone());
    sphereCenter.position.set(0, 0, 0);
    sphereCenter.scale.set(initialElementScale, initialElementScale, initialElementScale);
    emblemGroup.add(sphereCenter);

    // Steep diagonal coordinate calculation matching official SVG (dy/dx = 2:1)
    const dotDist = 1.55;
    const dotAngle = 0.50; // ~28.6° from vertical (61.4° from horizontal)
    const dotDx = dotDist * Math.sin(dotAngle); // ~0.74
    const dotDy = dotDist * Math.cos(dotAngle); // ~1.36

    // Bottom-Left Node (Dot 2)
    const sphereBotLeft = new THREE.Mesh(new THREE.SphereGeometry(0.25, 32, 32), coreCrystalMaterial.clone());
    sphereBotLeft.position.set(-dotDx, -dotDy, 0);
    sphereBotLeft.scale.set(initialElementScale, initialElementScale, initialElementScale);
    emblemGroup.add(sphereBotLeft);

    // Top-Right Node (Dot 3)
    const sphereTopRight = new THREE.Mesh(new THREE.SphereGeometry(0.25, 32, 32), coreCrystalMaterial.clone());
    sphereTopRight.position.set(dotDx, dotDy, 0);
    sphereTopRight.scale.set(initialElementScale, initialElementScale, initialElementScale);
    emblemGroup.add(sphereTopRight);

    // Radiant Node Core Point Lights
    const initialLightIntensity = alreadyPlayed ? 3.8 : 0;
    const lightCenter = new THREE.PointLight(0xE9D5FF, initialLightIntensity, 7);
    sphereCenter.add(lightCenter);

    const lightBotLeft = new THREE.PointLight(0xA472F7, alreadyPlayed ? 2.8 : 0, 4.5);
    sphereBotLeft.add(lightBotLeft);

    const lightTopRight = new THREE.PointLight(0xA472F7, alreadyPlayed ? 2.8 : 0, 4.5);
    sphereTopRight.add(lightTopRight);

    // -------------------------------------------------------------------------
    // 4B. The Connecting Diagonal Axis Line (Ends at dots, does NOT stick out!)
    // -------------------------------------------------------------------------
    const rodLength = dotDist * 2 + 0.12; // 3.22 — terminates neatly at the outer dots!
    const rodRadius = 0.044; // Sleek, crisp metallic beam
    const axisRod = new THREE.Mesh(
      new THREE.CylinderGeometry(rodRadius, rodRadius, rodLength, 32),
      axisRodMaterial
    );
    axisRod.rotation.z = -dotAngle;
    axisRod.scale.set(1, alreadyPlayed ? 1 : 0, 1);
    emblemGroup.add(axisRod);

    // -------------------------------------------------------------------------
    // 4C. The Complete Rings Around It (Appear only after dots & line end)
    // -------------------------------------------------------------------------
    const gyroGroup = new THREE.Group();
    emblemGroup.add(gyroGroup);

    // 1. Inner Concentric Ring
    const ring3 = new THREE.Mesh(
      new THREE.TorusGeometry(1.05, 0.036, 32, 96),
      obsidianChromeMaterial
    );
    ring3.rotation.x = Math.PI / 2.2;
    ring3.scale.set(initialElementScale, initialElementScale, initialElementScale);
    gyroGroup.add(ring3);

    // 2. Primary Orbital Elliptical Ring 1 (Tilted orbital ellipse 1)
    const ring1 = new THREE.Mesh(
      new THREE.TorusGeometry(1.60, 0.042, 32, 120),
      obsidianChromeMaterial
    );
    ring1.rotation.x = 0.60;
    ring1.rotation.y = 0.32;
    ring1.scale.set(initialElementScale, initialElementScale, initialElementScale);
    gyroGroup.add(ring1);

    // 3. Primary Orbital Elliptical Ring 2 (Tilted orbital ellipse 2)
    const ring2 = new THREE.Mesh(
      new THREE.TorusGeometry(1.60, 0.042, 32, 120),
      obsidianChromeMaterial
    );
    ring2.rotation.x = -0.60;
    ring2.rotation.y = -0.32;
    ring2.scale.set(initialElementScale, initialElementScale, initialElementScale);
    gyroGroup.add(ring2);

    // 4. Outer Concentric Framing Ring (Encloses the emblem perimeter)
    const ring4 = new THREE.Mesh(
      new THREE.TorusGeometry(2.15, 0.038, 32, 120),
      obsidianChromeMaterial
    );
    ring4.scale.set(initialElementScale, initialElementScale, initialElementScale);
    gyroGroup.add(ring4);

    // Rotation multiplier object controlled by GSAP
    // Starts at 0, only accelerates to 1 once the 3 dots burst!
    const rotationSpeed = { value: alreadyPlayed ? 1 : 0 };

    // =========================================================================
    // 5. ENTRANCE TIMELINE: DOTS FIRST -> LINE SECOND -> RINGS THIRD -> BURST -> ROTATE
    // =========================================================================
    let isMounted = true;

    const ctx = gsap.context(() => {
      // If returning to home page in same session: immediately fully resolved
      if (alreadyPlayed) {
        gsap.set([seed1Ref.current, seed2Ref.current, seed3Ref.current], {
          opacity: 0,
          scale: 0,
        });

        gsap.set(heroTextRef.current, {
          opacity: 1,
          x: 0,
          scale: 1,
        });

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('nsdc-navbar-reveal'));
          window.dispatchEvent(new CustomEvent('nsdc-socials-reveal'));
          window.dispatchEvent(new CustomEvent('nsdc-reveal-bento'));
        }
        if (onSequenceComplete) {
          onSequenceComplete();
        }
        return;
      }

      // FRESH REFRESH: Viewer initially sees ONLY the empty subtle background shader!
      const tl = gsap.timeline({
        onComplete: () => {
          setHasPlayedIntro(true);
        }
      });

      // Initial state: Everything hidden
      gsap.set([seed1Ref.current, seed2Ref.current, seed3Ref.current], {
        opacity: 0,
        scale: 0,
      });

      gsap.set(heroTextRef.current, {
        opacity: 0,
        x: 40,
        scale: 0.96,
      });

      // -----------------------------------------------------------------------
      // STAGE 0 (0.0s – 0.7s): Pure Subtle Cosmic Void
      // -----------------------------------------------------------------------
      tl.to(
        starfield.material,
        {
          opacity: 0.55,
          duration: 1.0,
          ease: 'power2.inOut',
        },
        0.6
      );

      tl.set(
        emblemGroup.scale,
        {
          x: targetEmblemScale,
          y: targetEmblemScale,
          z: targetEmblemScale,
        },
        0.7
      );

      // -----------------------------------------------------------------------
      // STEP 1 (0.8s – 1.8s): THE DOTS APPEAR FIRST (Pure dots, no collar!)
      // -----------------------------------------------------------------------
      // Center dot pops and radiates light
      tl.to(
        sphereCenter.scale,
        {
          x: 1.25,
          y: 1.25,
          z: 1.25,
          duration: 0.55,
          ease: 'back.out(2.2)',
        },
        0.8
      ).to(
        sphereCenter.scale,
        {
          x: 1.0,
          y: 1.0,
          z: 1.0,
          duration: 0.35,
          ease: 'power2.out',
        },
        1.35
      );

      tl.to(
        sphereCenter.material,
        {
          emissiveIntensity: 2.4,
          duration: 0.6,
          ease: 'power3.out',
        },
        0.8
      );

      tl.to(
        lightCenter,
        {
          intensity: 4.0,
          duration: 0.6,
          ease: 'power3.out',
        },
        0.8
      );

      // Outer satellite dots ignite right after
      const outerNodes = [sphereBotLeft, sphereTopRight];
      tl.to(
        outerNodes.map((n) => n.scale),
        {
          x: 1.25,
          y: 1.25,
          z: 1.25,
          duration: 0.5,
          stagger: 0.12,
          ease: 'back.out(2.2)',
        },
        1.2
      ).to(
        outerNodes.map((n) => n.scale),
        {
          x: 1.0,
          y: 1.0,
          z: 1.0,
          duration: 0.3,
          stagger: 0.12,
          ease: 'power2.out',
        },
        1.7
      );

      tl.to(
        [sphereBotLeft.material, sphereTopRight.material],
        {
          emissiveIntensity: 2.0,
          duration: 0.55,
          stagger: 0.12,
          ease: 'power3.out',
        },
        1.25
      );

      tl.to(
        [lightBotLeft, lightTopRight],
        {
          intensity: 2.8,
          duration: 0.55,
          stagger: 0.12,
          ease: 'power3.out',
        },
        1.25
      );

      // -----------------------------------------------------------------------
      // STEP 2 (1.8s – 2.8s): THEN THE LINE CONNECTS THROUGH THEM
      // -----------------------------------------------------------------------
      tl.to(
        axisRod.scale,
        {
          y: 1.0,
          duration: 0.95,
          ease: 'expo.out',
        },
        1.85
      );

      tl.to(
        axisRod.material,
        {
          emissiveIntensity: 1.6,
          duration: 0.6,
          ease: 'power2.out',
        },
        2.05
      );

      // -----------------------------------------------------------------------
      // STEP 3 (2.85s – 5.2s): RINGS APPEAR ONLY ONCE DOT AND LINE ANIMATION ENDS
      // -----------------------------------------------------------------------
      // 3A: Inner Concentric Ring forms around center dot first
      tl.to(
        ring3.scale,
        {
          x: 1.0,
          y: 1.0,
          z: 1.0,
          duration: 0.85,
          ease: 'back.out(1.8)',
        },
        2.85
      );

      // 3B: Two Interlocking Orbital Elliptical Rings unfold around the axis
      tl.to(
        [ring1.scale, ring2.scale],
        {
          x: 1.0,
          y: 1.0,
          z: 1.0,
          duration: 1.0,
          stagger: 0.22,
          ease: 'back.out(1.6)',
        },
        3.45
      );

      // 3C: Outer Framing Ring encloses the whole logo
      tl.to(
        ring4.scale,
        {
          x: 1.0,
          y: 1.0,
          z: 1.0,
          duration: 1.05,
          ease: 'expo.out',
        },
        4.35
      );

      // -----------------------------------------------------------------------
      // STEP 4 (5.4s): THE THREE DOTS BURST -> ROTATION STARTS AT THIS MOMENT!
      // -----------------------------------------------------------------------
      tl.to(
        [seed1Ref.current, seed2Ref.current, seed3Ref.current],
        {
          opacity: 1,
          scale: 1.3,
          duration: 0.35,
          stagger: 0.08,
          ease: 'back.out(2)',
        },
        5.4
      ).to(
        [seed1Ref.current, seed2Ref.current, seed3Ref.current],
        {
          scale: 1.0,
          duration: 0.2,
          ease: 'power2.out',
        },
        5.75
      );

      // Continuous axial rotation starts ONLY ONCE THE THREE DOTS HAVE BURST!
      tl.to(
        rotationSpeed,
        {
          value: 1.0,
          duration: 1.6,
          ease: 'power2.out',
        },
        5.5
      );

      // -----------------------------------------------------------------------
      // STEP 5 (5.9s – 7.1s): Departure to UI Targets (Navbar, Socials, Hero)
      // -----------------------------------------------------------------------
      // Seed 1: Ascends to the enlarged transparent Navbar Top-Center
      tl.to(
        seed1Ref.current,
        {
          top: '1.75rem',
          left: '50%',
          xPercent: -50,
          yPercent: 0,
          duration: 1.2,
          ease: 'power4.inOut',
        },
        5.9
      );

      // Seed 2: Travels to Left Social Sidebar
      tl.to(
        seed2Ref.current,
        {
          left: '2.5rem',
          top: '50%',
          xPercent: 0,
          yPercent: -50,
          duration: 1.2,
          ease: 'power4.inOut',
        },
        5.9
      );

      // Seed 3: Travels to Right Hero Typography block
      tl.to(
        seed3Ref.current,
        {
          left: width >= 1024 ? '70%' : width >= 768 ? '65%' : '50%',
          top: '50%',
          xPercent: -50,
          yPercent: -50,
          duration: 1.2,
          ease: 'power4.inOut',
        },
        5.9
      );

      // -----------------------------------------------------------------------
      // STEP 6 (7.1s – 7.8s): Grand Morph & Harmonized Reveal
      // -----------------------------------------------------------------------
      tl.to(
        [seed1Ref.current, seed2Ref.current, seed3Ref.current],
        {
          opacity: 0,
          scale: 2.5,
          duration: 0.35,
          ease: 'power2.out',
        },
        7.1
      );

      // Reveal Enlarged Transparent Navbar
      tl.call(
        () => {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('nsdc-navbar-reveal'));
          }
        },
        undefined,
        7.1
      );

      // Reveal Social Sidebar (appears directly!)
      tl.call(
        () => {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('nsdc-socials-reveal'));
          }
        },
        undefined,
        7.1
      );

      // Reveal Hero Typography smoothly
      tl.to(
        heroTextRef.current,
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 0.9,
          ease: 'power3.out',
        },
        7.15
      );

      // Reveal Bento Grid Below & Finish Intro
      tl.call(
        () => {
          setHasPlayedIntro(true);
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('nsdc-reveal-bento'));
          }
          if (onSequenceComplete) {
            onSequenceComplete();
          }
        },
        undefined,
        7.6
      );
    }, containerRef);

    // =========================================================================
    // 6. DELTA-BASED AXIAL LOGO ROTATION (Starts only when dots burst!)
    // =========================================================================
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const onMouseMove = (e: MouseEvent) => {
      bgUniforms.uMouse.value.x = e.clientX / window.innerWidth;
      bgUniforms.uMouse.value.y = 1.0 - e.clientY / window.innerHeight;
    };

    window.addEventListener('mousemove', onMouseMove);

    const animate = () => {
      if (!isMounted) return;
      animationFrameId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Update background shader uniform time
      bgUniforms.uTime.value = elapsedTime;

      // Subtle slow-moving cosmic dust
      starfield.rotation.y = elapsedTime * 0.015;
      starfield.rotation.x = elapsedTime * 0.008;

      // Rotation begins smoothly only once the 3 dots have burst!
      if (emblemGroup && rotationSpeed.value > 0) {
        emblemGroup.rotation.y += delta * 0.36 * rotationSpeed.value;
      }
      if (gyroGroup && rotationSpeed.value > 0) {
        gyroGroup.rotation.y += delta * 0.18 * rotationSpeed.value;
      }

      // Dual-pass rendering: 1. Background Shader Quad, 2. 3D Scene Objects
      renderer.autoClear = false;
      renderer.clear();
      renderer.render(bgScene, bgCamera);
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      const newW = window.innerWidth;
      const newH = window.innerHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);

      bgUniforms.uResolution.value.set(newW, newH);
      bgUniforms.uLogoPos.value.set(newW >= 768 ? 0.32 : 0.5, 0.5);

      const updatedScale = newW >= 768 ? 0.9 : 0.78;
      if (newW >= 768) {
        emblemGroup.position.set(-2.2, 0, 0);
      } else {
        emblemGroup.position.set(0, 0, 0);
      }
      if (getHasPlayedIntro()) {
        emblemGroup.scale.set(updatedScale, updatedScale, updatedScale);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      isMounted = false;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      ctx.revert();
    };
  }, [onSequenceComplete]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen w-full flex flex-col justify-center overflow-hidden bg-[#05030A] select-none"
    >
      {/* 1. Full-Viewport Three.js WebGL Canvas with Background Shader (100vw x 100vh) */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full z-0 pointer-events-none"
      />

      {/* =======================================================================
          2. THE THREE GLOWING SEED NODES (Spawn on logo spheres & depart)
          Initial opacity-0 prevents any flash on page reload/refresh
         ======================================================================= */}
      {/* Seed 1: Spawns near top logo sphere -> Shoots to Navbar Top-Center */}
      <div
        ref={seed1Ref}
        className="fixed z-40 w-6 h-6 rounded-full bg-gradient-to-tr from-white via-[#C084FC] to-[#7F45DB] shadow-[0_0_22px_#FFFFFF] shadow-purple-500/80 pointer-events-none opacity-0"
        style={{
          top: 'calc(50% - 80px)',
          left: 'calc(50% - 200px + 40px)',
          transform: 'translate(-50%, -50%)',
        }}
      />

      {/* Seed 2: Spawns near bottom-left logo sphere -> Shoots to Social Sidebar */}
      <div
        ref={seed2Ref}
        className="fixed z-40 w-5 h-5 rounded-full bg-gradient-to-tr from-white via-[#A472F7] to-[#7F45DB] shadow-[0_0_18px_#A472F7] shadow-purple-500/80 pointer-events-none opacity-0"
        style={{
          top: 'calc(50% + 80px)',
          left: 'calc(50% - 200px - 40px)',
          transform: 'translate(-50%, -50%)',
        }}
      />

      {/* Seed 3: Spawns at center logo sphere -> Shoots to Hero Typography */}
      <div
        ref={seed3Ref}
        className="fixed z-40 w-6 h-6 rounded-full bg-gradient-to-tr from-white via-[#E9D5FF] to-[#A472F7] shadow-[0_0_24px_#FFFFFF] shadow-purple-500/90 pointer-events-none opacity-0"
        style={{
          top: '50%',
          left: 'calc(50% - 200px)',
          transform: 'translate(-50%, -50%)',
        }}
      />

      {/* =======================================================================
          3. HERO TYPOGRAPHY BLOCK (Spawned & Unfolded from Seed Node 3)
         ======================================================================= */}
      <div className="relative z-20 w-full max-w-7xl px-8 sm:px-12 lg:px-16 mx-auto flex flex-col md:flex-row items-center justify-between pointer-events-none">
        {/* Generous left spacer reserving space for the 3D rotating emblem */}
        <div className="w-full md:w-[50%] min-h-[320px] md:min-h-[500px] pointer-events-none" />

        {/* High-Contrast Premium Typography with ample breathing room */}
        <div
          ref={heroTextRef}
          className="w-full md:w-[48%] md:ml-auto flex flex-col text-center md:text-left pointer-events-auto space-y-3.5 max-w-lg lg:max-w-xl opacity-0"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-white tracking-tight leading-snug drop-shadow-md">
            Artificial Intelligence &amp; Data Science&apos;s
          </h2>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold tracking-tight bg-gradient-to-r from-[#D8B4FE] via-[#C084FC] to-[#818CF8] bg-clip-text text-transparent drop-shadow-[0_0_28px_rgba(192,132,252,0.45)]">
            National Student Data Corps
          </h1>

          <p className="text-sm sm:text-base text-slate-200 font-sans leading-relaxed">
            VCET&apos;s first Student Chapter for Data Visualization and Machine Learning
            from the brand new branch of Artificial Intelligence &amp; Data Science
          </p>

          <blockquote className="italic text-xs sm:text-sm text-purple-300/90 font-mono-tech tracking-wide pt-0.5">
            &ldquo;Data beats emotions.&rdquo;
          </blockquote>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
            <a
              href="#bento-grid"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] hover:from-[#7C3AED] hover:to-[#9333EA] text-white font-medium text-xs sm:text-sm shadow-[0_0_25px_rgba(139,92,246,0.5)] hover:shadow-[0_0_35px_rgba(168,85,247,0.7)] transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <span>About Us</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
