'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const VCET_LAT = 19.3838;
const VCET_LON = 72.8286;
const EARTH_RADIUS = 80;

function latLonToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

function createProceduralEarthMap(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 2048;
  c.height = 1024;
  const ctx = c.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, 0, 1024);
  grad.addColorStop(0, '#0a1d37');
  grad.addColorStop(0.5, '#0e2b52');
  grad.addColorStop(1, '#08172c');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 2048, 1024);

  ctx.fillStyle = '#1c3d28';
  ctx.beginPath();
  ctx.ellipse(1430, 480, 240, 160, 0.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#265335';
  ctx.beginPath();
  ctx.moveTo(1410, 460);
  ctx.lineTo(1490, 470);
  ctx.lineTo(1440, 560);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#224830';
  ctx.beginPath();
  ctx.ellipse(1150, 540, 130, 200, -0.1, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(550, 420, 140, 180, 0.3, 0, Math.PI * 2);
  ctx.ellipse(680, 680, 110, 180, -0.2, 0, Math.PI * 2);
  ctx.fill();

  return new THREE.CanvasTexture(c);
}

function createGoogleMapPinTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 160;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, 128, 160);

  // Soft contact ground shadow underneath pin tip
  const shadowGrad = ctx.createRadialGradient(64, 150, 2, 64, 150, 26);
  shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.45)');
  shadowGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.20)');
  shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = shadowGrad;
  ctx.beginPath();
  ctx.ellipse(64, 150, 26, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  // Classic Google Maps Pin Silhouette
  ctx.beginPath();
  ctx.moveTo(64, 146);
  ctx.bezierCurveTo(46, 114, 28, 84, 28, 48);
  ctx.arc(64, 48, 36, Math.PI, 0, false);
  ctx.bezierCurveTo(100, 84, 82, 114, 64, 146);
  ctx.closePath();

  // Authentic Google Maps Red Gradient
  const pinGrad = ctx.createLinearGradient(64, 12, 64, 146);
  pinGrad.addColorStop(0, '#FF5252');
  pinGrad.addColorStop(0.4, '#EA4335');
  pinGrad.addColorStop(1, '#B31412');
  ctx.fillStyle = pinGrad;
  ctx.fill();

  // Crisp border stroke
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = '#990000';
  ctx.stroke();

  // White inner circular cutout
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(64, 48, 14, 0, Math.PI * 2);
  ctx.fill();

  // Red inner focal point
  ctx.fillStyle = '#EA4335';
  ctx.beginPath();
  ctx.arc(64, 48, 6.5, 0, Math.PI * 2);
  ctx.fill();

  const tex = new THREE.CanvasTexture(canvas);
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  return tex;
}

export function OrbitalLocationMap() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const liveMapRef = useRef<HTMLDivElement>(null);

  const [isMapActive, setIsMapActive] = useState(false);
  const isMapActiveRef = useRef(false);

  // Animation State: Direct continuous 1.4s zoom
  const animStateRef = useRef({
    progress: 0,
    startTime: 0,
    animating: false,
    duration: 1400, // Fast, cinematic, direct 1.4s zoom
  });

  const triggerDiveRef = useRef<() => void>(() => {});

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty('--card-mouse-x', `${x}px`);
    e.currentTarget.style.setProperty('--card-mouse-y', `${y}px`);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const viewport = viewportRef.current;
    if (!canvas || !viewport) return;

    let vWidth = viewport.clientWidth || 600;
    let vHeight = viewport.clientHeight || 420;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020108);

    const camera = new THREE.PerspectiveCamera(45, vWidth / vHeight, 0.1, 4500);
    camera.position.set(0, 0, 320);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(vWidth, vHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;

    // 2. Lights - Bright, Vibrant, Photorealistic NASA Earth Lighting
    const sunLight = new THREE.DirectionalLight(0xffffff, 2.2);
    sunLight.position.set(120, 100, 280);
    scene.add(sunLight);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x1e1b4b, 1.1);
    scene.add(hemiLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
    scene.add(ambientLight);

    const fillLight = new THREE.DirectionalLight(0xa5b4fc, 0.9);
    fillLight.position.set(-200, 80, 180);
    scene.add(fillLight);

    const rimPurpleLight = new THREE.DirectionalLight(0x8b5cf6, 0.85);
    rimPurpleLight.position.set(-250, -80, -120);
    scene.add(rimPurpleLight);

    // 3. Starfield Generator
    const starCount = 2800;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    const starColorPalette = [
      new THREE.Color('#ffffff'),
      new THREE.Color('#f8fafc'),
      new THREE.Color('#e2e8f0'),
      new THREE.Color('#c084fc'),
      new THREE.Color('#38bdf8'),
      new THREE.Color('#a855f7'),
    ];

    for (let i = 0; i < starCount; i++) {
      const r = THREE.MathUtils.randFloat(600, 2000);
      const theta = THREE.MathUtils.randFloat(0, Math.PI * 2);
      const phi = THREE.MathUtils.randFloat(0, Math.PI);

      starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = r * Math.cos(phi);

      const col = starColorPalette[Math.floor(Math.random() * starColorPalette.length)] ?? starColorPalette[0]!;
      starColors[i * 3] = col.r;
      starColors[i * 3 + 1] = col.g;
      starColors[i * 3 + 2] = col.b;
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 1.6,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      sizeAttenuation: true,
    });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // 4. Earth Sphere Dimensions
    const earthGroup = new THREE.Group();
    scene.add(earthGroup);

    // Texture Loader with CORS
    const textureLoader = new THREE.TextureLoader();
    textureLoader.setCrossOrigin('anonymous');

    // Procedural Fallback Earth Canvas
    const fallbackEarthTex = createProceduralEarthMap();

    // Earth Mesh
    const earthGeo = new THREE.SphereGeometry(EARTH_RADIUS, 64, 64);
    const earthMat = new THREE.MeshPhongMaterial({
      map: fallbackEarthTex,
      shininess: 12,
      specular: new THREE.Color(0x333333),
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    earthGroup.add(earthMesh);

    // Asynchronously load high-res NASA textures
    textureLoader.load(
      'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/textures/planets/earth_atmos_2048.jpg',
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        earthMat.map = tex;
        earthMat.needsUpdate = true;
      }
    );

    textureLoader.load(
      'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/textures/planets/earth_specular_2048.jpg',
      (tex) => {
        earthMat.specularMap = tex;
        earthMat.specular = new THREE.Color(0x666666);
        earthMat.needsUpdate = true;
      }
    );

    // 5. Cloud Layer
    const cloudsGeo = new THREE.SphereGeometry(EARTH_RADIUS * 1.012, 64, 64);
    const cloudsMat = new THREE.MeshPhongMaterial({
      transparent: true,
      opacity: 0.85,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });
    const cloudsMesh = new THREE.Mesh(cloudsGeo, cloudsMat);
    earthGroup.add(cloudsMesh);

    textureLoader.load(
      'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/textures/planets/earth_clouds_1024.png',
      (tex) => {
        cloudsMat.map = tex;
        cloudsMat.needsUpdate = true;
      }
    );

    // 6. Coordinates Math for VCET Campus: 9RMH+GF Vasai-Virar (19.3838° N, 72.8286° E)
    const vcetTargetPos = latLonToVector3(VCET_LAT, VCET_LON, EARTH_RADIUS);
    const vcetNormal = vcetTargetPos.clone().normalize();

    // 7. Google Maps Pin Sprite on VCET coordinates
    const pinTex = createGoogleMapPinTexture();
    const pinMat = new THREE.SpriteMaterial({
      map: pinTex,
      transparent: true,
      depthTest: true,
      depthWrite: false,
    });
    const googleMapPin = new THREE.Sprite(pinMat);
    googleMapPin.center.set(0.5, 0.0875);
    googleMapPin.position.copy(latLonToVector3(VCET_LAT, VCET_LON, EARTH_RADIUS + 0.12));
    earthGroup.add(googleMapPin);

    // North and East vectors on Earth surface at VCET (for true map orientation)
    const northLatPos = latLonToVector3(VCET_LAT + 0.1, VCET_LON, EARTH_RADIUS);
    const northVec = northLatPos.clone().sub(vcetTargetPos).normalize();
    const eastVec = new THREE.Vector3().crossVectors(northVec, vcetNormal).normalize();

    // Target Orientation Quaternion (VCET facing camera with North directly up)
    const M_align = new THREE.Matrix4().makeBasis(eastVec, northVec, vcetNormal);
    const invM_align = M_align.clone().transpose();
    const targetLockQuat = new THREE.Quaternion().setFromRotationMatrix(invM_align);

    // Direct Cinematic Controller
    const startCinematicDive = () => {
      isMapActiveRef.current = false;
      setIsMapActive(false);
      animStateRef.current.progress = 0;
      animStateRef.current.startTime = performance.now();
      animStateRef.current.animating = true;
    };
    triggerDiveRef.current = startCinematicDive;

    // Auto-Play: Direct dive starts as soon as user arrives at location card
    let hasAutoplayed = false;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAutoplayed) {
            hasAutoplayed = true;
            setTimeout(startCinematicDive, 40);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(viewport);

    // Viewport Resize Handler
    const handleResize = () => {
      if (!viewport) return;
      const w = viewport.clientWidth;
      const h = viewport.clientHeight;
      if (w && h) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    };
    window.addEventListener('resize', handleResize);
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(viewport);

    // Smooth cubic ease-in-out curve
    function easeInOutCubic(t: number): number {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    // Initial globe orientation
    const initialQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.15, 0.45, 0));

    // Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const renderLoop = () => {
      animationFrameId = requestAnimationFrame(renderLoop);
      clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Direct continuous progress updating
      if (animStateRef.current.animating) {
        const elapsed = performance.now() - animStateRef.current.startTime;
        const rawT = Math.min(1, elapsed / animStateRef.current.duration);
        const p = easeInOutCubic(rawT);
        animStateRef.current.progress = p;

        // Activate live map during the dive (at 60% of zoom) so it dissolves in directly as the camera lands
        if (p >= 0.60 && !isMapActiveRef.current) {
          isMapActiveRef.current = true;
          setIsMapActive(true);
        }

        if (rawT >= 1) {
          animStateRef.current.animating = false;
          if (!isMapActiveRef.current) {
            isMapActiveRef.current = true;
            setIsMapActive(true);
          }
        }
      }

      const p = animStateRef.current.progress;

      // Dynamic Pin Scaling (Crisp ~30px marker at all zoom levels)
      const vcetWorldPos = new THREE.Vector3();
      googleMapPin.getWorldPosition(vcetWorldPos);
      const camDistToVcet = camera.position.distanceTo(vcetWorldPos);
      const pinScale = Math.max(0.07, Math.min(camDistToVcet * 0.026, 5.0));
      googleMapPin.scale.set(pinScale * 0.8, pinScale, 1.0);

      // Cloud rotation
      cloudsMesh.rotation.y += 0.00035;

      // DIRECT CONTINUOUS ZOOM MOTION (No pauses, no stalls, no delays):
      // 1. Continuous camera descent from 320 to 122 across the entire duration
      const cameraDist = THREE.MathUtils.lerp(320, 122, p);
      camera.position.set(0, 0, cameraDist);
      camera.lookAt(0, 0, EARTH_RADIUS);

      // 2. Continuous alignment to VCET orientation
      const rotT = Math.min(1, p / 0.68);
      const rotEase = Math.sin((rotT * Math.PI) / 2);
      earthGroup.quaternion.slerpQuaternions(initialQuat, targetLockQuat, rotEase);

      // 3. Clouds dissipate smoothly during the dive
      if (p < 0.50) {
        cloudsMat.opacity = Math.max(0, 0.85 * (1 - p / 0.50));
      } else {
        cloudsMat.opacity = 0.0;
      }

      // Star Parallax
      starField.rotation.y = elapsedTime * 0.0002;
      starField.rotation.x = elapsedTime * 0.0001;

      renderer.render(scene, camera);
    };

    renderLoop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
      observer.disconnect();

      // Clean up Three.js objects
      starGeo.dispose();
      starMat.dispose();
      earthGeo.dispose();
      earthMat.dispose();
      cloudsGeo.dispose();
      cloudsMat.dispose();
      pinTex.dispose();
      pinMat.dispose();
      fallbackEarthTex.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      className="clean-card location-card full-width-location reveal-motion reveal-d5"
      onMouseMove={handleMouseMove}
    >
      <div className="location-header">
        <div className="location-left">
          <div className="location-icon-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <div className="location-text">
            <h4>VCET Campus</h4>
            <p>K.T. Marg, Vasai Station Road, Vasai (W), 401202</p>
          </div>
        </div>
        <div className="location-actions">
          <a
            href="https://www.google.com/maps/dir/?api=1&destination=9RMH%2BGF+Vasai-Virar,+Maharashtra,+India"
            target="_blank"
            rel="noreferrer"
            className="location-btn"
          >
            <span>Directions</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 17 17 7M7 7h10v10" />
            </svg>
          </a>
        </div>
      </div>

      {/* Embedded 3D Globe & Interactive Live Map Viewport (Full Width, Clean Unobstructed View) */}
      <div className="location-map-viewport" id="location-map-viewport" ref={viewportRef}>
        {/* 3D WebGL Canvas */}
        <canvas id="orbital-canvas" ref={canvasRef} />

        {/* Actual Live Interactive Map (Embedded Google Map Satellite at 9RMH+GF Vasai) */}
        <div
          className={`embedded-live-map ${isMapActive ? 'active' : ''}`}
          id="embedded-live-map"
          ref={liveMapRef}
        >
          <iframe
            id="gmap-iframe"
            src="https://maps.google.com/maps?q=9RMH%2BGF+Vasai-Virar,+Maharashtra,+India&t=k&z=17&ie=UTF8&iwloc=&output=embed"
            title="VCET Campus Interactive Live Satellite Map"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}
