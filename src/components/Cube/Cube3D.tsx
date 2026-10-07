import React, { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { CubeSize, FaceName, Move, CUBE_COLORS, INNER_COLOR } from '../../engine/types';
import { useCubeStore } from '../../store/cubeStore';
import { useSettingsStore } from '../../store/settingsStore';
import { computeMoveFromDrag } from '../../engine/dragMove';
import { parseMoveString } from '../../engine/notation';

export type CameraViewPreset = 'front' | 'back' | 'left' | 'right' | 'top' | 'bottom' | 'default';

interface Cube3DProps {
  interactive?: boolean;
  autoRotate?: boolean;
  className?: string;
  onCameraViewReady?: (setView: (view: CameraViewPreset) => void) => void;
}

const NORMAL_VECTORS: Record<string, THREE.Vector3> = {
  '+x': new THREE.Vector3(1, 0, 0),
  '-x': new THREE.Vector3(-1, 0, 0),
  '+y': new THREE.Vector3(0, 1, 0),
  '-y': new THREE.Vector3(0, -1, 0),
  '+z': new THREE.Vector3(0, 0, 1),
  '-z': new THREE.Vector3(0, 0, -1),
};

export const Cube3D: React.FC<Cube3DProps> = ({
  interactive = true,
  autoRotate = false,
  className = '',
  onCameraViewReady,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Zustand state
  const size = useCubeStore((s) => s.size);
  const syncCounter = useCubeStore((s) => s.syncCounter);
  const executeMove = useCubeStore((s) => s.executeMove);
  const enqueueMove = useCubeStore((s) => s.enqueueMove);
  const dequeueMove = useCubeStore((s) => s.dequeueMove);
  const moveQueue = useCubeStore((s) => s.moveQueue);
  const setIsAnimating = useCubeStore((s) => s.setIsAnimating);
  const isSolvingPlaying = useCubeStore((s) => s.isSolvingPlaying);
  const isAnimating = useCubeStore((s) => s.isAnimating);

  const getDurationMs = useSettingsStore((s) => s.getDurationMs);
  const cameraSensitivity = useSettingsStore((s) => s.cameraSensitivity);

  // Three.js instances ref
  const threeRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    rootGroup: THREE.Group;
    pivotGroup: THREE.Group;
    cubieMeshes: Map<number, THREE.Group>;
    targetSpherical: THREE.Spherical;
    currentSpherical: THREE.Spherical;
    cameraDistance: number;
    animating: boolean;
    reqId: number;
  } | null>(null);

  // Interaction tracking ref
  const interactionRef = useRef<{
    isPointerDown: boolean;
    pointerMode: 'none' | 'camera_orbit' | 'face_drag' | 'drag_completed';
    startX: number;
    startY: number;
    lastX: number;
    lastY: number;
    hitNormalKey: '+x' | '-x' | '+y' | '-y' | '+z' | '-z' | null;
    hitPoint: THREE.Vector3 | null;
    hitGridX: number;
    hitGridY: number;
    hitGridZ: number;
    pinchDist: number | null;
  }>({
    isPointerDown: false,
    pointerMode: 'none',
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    hitNormalKey: null,
    hitPoint: null,
    hitGridX: 0,
    hitGridY: 0,
    hitGridZ: 0,
    pinchDist: null,
  });

  // Calculate default camera distance based on cube size
  const defaultDist = size * 2.3 + 3.2;

  // Camera preset handler
  const setCameraView = useCallback((preset: CameraViewPreset) => {
    if (!threeRef.current) return;
    const { targetSpherical, cameraDistance } = threeRef.current;

    switch (preset) {
      case 'front':
        targetSpherical.set(cameraDistance, Math.PI / 2, 0);
        break;
      case 'back':
        targetSpherical.set(cameraDistance, Math.PI / 2, Math.PI);
        break;
      case 'left':
        targetSpherical.set(cameraDistance, Math.PI / 2, -Math.PI / 2);
        break;
      case 'right':
        targetSpherical.set(cameraDistance, Math.PI / 2, Math.PI / 2);
        break;
      case 'top':
        targetSpherical.set(cameraDistance, 0.05, 0);
        break;
      case 'bottom':
        targetSpherical.set(cameraDistance, Math.PI - 0.05, 0);
        break;
      case 'default':
      default:
        targetSpherical.set(cameraDistance, Math.PI / 3, Math.PI / 4);
        break;
    }
  }, []);

  // Expose camera controller to parent
  useEffect(() => {
    if (onCameraViewReady) {
      onCameraViewReady(setCameraView);
    }
  }, [onCameraViewReady, setCameraView]);

  // Helper to build 3D mesh for a cubie
  const createCubieMesh = useCallback(
    (cubieData: { id: number; x: number; y: number; z: number; stickers: Record<string, FaceName> }) => {
      const group = new THREE.Group();
      group.name = `cubie_${cubieData.id}`;
      (group as unknown as { cubieId: number }).cubieId = cubieData.id;

      // Base plastic cube
      const cubieSize = 0.94;
      const cornerRadius = 0.06;
      // High-performance geometry with slightly beveled look
      const bodyGeo = new THREE.BoxGeometry(cubieSize, cubieSize, cubieSize);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: INNER_COLOR,
        roughness: 0.5,
        metalness: 0.1,
      });
      const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
      bodyMesh.castShadow = true;
      bodyMesh.receiveShadow = true;
      (bodyMesh as unknown as { cubieId: number }).cubieId = cubieData.id;
      group.add(bodyMesh);

      // Stickers
      const stickerThickness = 0.015;
      const stickerSize = 0.84;
      const offset = cubieSize / 2 + stickerThickness / 2;

      const stickerGeo = new THREE.PlaneGeometry(stickerSize, stickerSize);

      const faceNormals: { key: '+x' | '-x' | '+y' | '-y' | '+z' | '-z'; pos: [number, number, number]; rot: [number, number, number] }[] = [
        { key: '+x', pos: [offset, 0, 0], rot: [0, Math.PI / 2, 0] },
        { key: '-x', pos: [-offset, 0, 0], rot: [0, -Math.PI / 2, 0] },
        { key: '+y', pos: [0, offset, 0], rot: [-Math.PI / 2, 0, 0] },
        { key: '-y', pos: [0, -offset, 0], rot: [Math.PI / 2, 0, 0] },
        { key: '+z', pos: [0, 0, offset], rot: [0, 0, 0] },
        { key: '-z', pos: [0, 0, -offset], rot: [0, Math.PI, 0] },
      ];

      for (const { key, pos, rot } of faceNormals) {
        const colorName = cubieData.stickers[key];
        if (colorName) {
          const hexColor = CUBE_COLORS[colorName] || '#FFFFFF';
          const stickerMat = new THREE.MeshStandardMaterial({
            color: hexColor,
            roughness: 0.25,
            metalness: 0.05,
            side: THREE.FrontSide,
          });
          const stickerMesh = new THREE.Mesh(stickerGeo, stickerMat);
          stickerMesh.position.set(...pos);
          stickerMesh.rotation.set(...rot);
          stickerMesh.name = `sticker_${key}`;
          (stickerMesh as unknown as { normalKey: string; cubieId: number }).normalKey = key;
          (stickerMesh as unknown as { normalKey: string; cubieId: number }).cubieId = cubieData.id;
          group.add(stickerMesh);
        }
      }

      // Position cubie in 3D scene relative to center
      const c = (size - 1) / 2;
      group.position.set(cubieData.x - c, cubieData.y - c, cubieData.z - c);

      return group;
    },
    [size]
  );

  // Initialize Three.js scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 400;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    const cameraDist = size * 2.3 + 3.2;

    const targetSpherical = new THREE.Spherical(cameraDist, Math.PI / 3.2, Math.PI / 4.2);
    const currentSpherical = new THREE.Spherical(cameraDist, Math.PI / 3.2, Math.PI / 4.2);
    camera.position.setFromSpherical(currentSpherical);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(10, 16, 12);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x90c4ff, 1.1);
    fillLight.position.set(-12, -4, -10);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.8);
    rimLight.position.set(-8, 12, -10);
    scene.add(rimLight);

    // Root groups
    const rootGroup = new THREE.Group();
    rootGroup.name = 'cubeRoot';
    scene.add(rootGroup);

    const pivotGroup = new THREE.Group();
    pivotGroup.name = 'pivotGroup';
    scene.add(pivotGroup);

    // Build initial cubie meshes
    const cubieMeshes = new Map<number, THREE.Group>();
    const initialCubies = useCubeStore.getState().cubies;
    for (const c of initialCubies) {
      const mesh = createCubieMesh(c);
      rootGroup.add(mesh);
      cubieMeshes.set(c.id, mesh);
    }

    const state = {
      scene,
      camera,
      renderer,
      rootGroup,
      pivotGroup,
      cubieMeshes,
      targetSpherical,
      currentSpherical,
      cameraDistance: cameraDist,
      animating: false,
      reqId: 0,
    };
    threeRef.current = state;

    // Render loop with smooth camera interpolation
    let lastTime = performance.now();
    const animate = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      if (autoRotate && !interactionRef.current.isPointerDown) {
        state.targetSpherical.theta += dt * 0.45;
      }

      // Smooth camera lerp
      const lerpFactor = Math.min(1, dt * 14);
      state.currentSpherical.radius += (state.targetSpherical.radius - state.currentSpherical.radius) * lerpFactor;
      state.currentSpherical.theta += (state.targetSpherical.theta - state.currentSpherical.theta) * lerpFactor;
      state.currentSpherical.phi += (state.targetSpherical.phi - state.currentSpherical.phi) * lerpFactor;

      // Clamp phi to prevent flip
      state.currentSpherical.phi = Math.max(0.05, Math.min(Math.PI - 0.05, state.currentSpherical.phi));

      state.camera.position.setFromSpherical(state.currentSpherical);
      state.camera.lookAt(0, 0, 0);

      state.renderer.render(state.scene, state.camera);
      state.reqId = requestAnimationFrame(animate);
    };

    state.reqId = requestAnimationFrame(animate);

    // Resize observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: newW, height: newH } = entry.contentRect;
        if (newW > 0 && newH > 0) {
          state.camera.aspect = newW / newH;
          state.camera.updateProjectionMatrix();
          state.renderer.setSize(newW, newH);
        }
      }
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(state.reqId);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      threeRef.current = null;
    };
  }, [size, autoRotate, createCubieMesh]);

  // Synchronize cubies ONLY when size changes or cube is scrambled/reset/undone/redone
  useEffect(() => {
    if (!threeRef.current) return;
    const { rootGroup, cubieMeshes } = threeRef.current;

    // Clear existing
    while (rootGroup.children.length > 0) {
      rootGroup.remove(rootGroup.children[0]);
    }
    cubieMeshes.clear();

    // Rebuild for new cubies from fresh state
    const currentCubies = useCubeStore.getState().cubies;
    for (const c of currentCubies) {
      const mesh = createCubieMesh(c);
      rootGroup.add(mesh);
      cubieMeshes.set(c.id, mesh);
    }
  }, [size, syncCounter, createCubieMesh]);

  // Perform smooth 3D layer animation
  const animateLayerRotation = useCallback(
    (move: Move, onFinished: () => void) => {
      if (!threeRef.current) {
        onFinished();
        return;
      }

      const { rootGroup, pivotGroup } = threeRef.current;
      const c = (size - 1) / 2;
      // Auto-solve moves animate faster for crisp, engaging rhythm
      const duration = isSolvingPlaying ? Math.min(130, getDurationMs()) : getDurationMs();

      // Set rotation axis and angle (Three.js right-hand coordinate system)
      const quarterTurn = Math.PI / 2;
      const turns = move.amount === 2 ? 2 : move.amount === -1 ? -1 : 1;
      const axis = new THREE.Vector3();
      let targetAngle = 0;

      switch (move.face) {
        case 'R':
          axis.set(1, 0, 0);
          targetAngle = -quarterTurn * turns;
          break;
        case 'L':
          axis.set(1, 0, 0);
          targetAngle = quarterTurn * turns;
          break;
        case 'U':
          axis.set(0, 1, 0);
          targetAngle = -quarterTurn * turns;
          break;
        case 'D':
          axis.set(0, 1, 0);
          targetAngle = quarterTurn * turns;
          break;
        case 'F':
          axis.set(0, 0, 1);
          targetAngle = -quarterTurn * turns;
          break;
        case 'B':
          axis.set(0, 0, 1);
          targetAngle = quarterTurn * turns;
          break;
      }

      // Find all meshes belonging to this slice directly from their physical 3D space!
      // This eliminates any reliance on stale closures or array searches.
      const sliceMeshes: THREE.Group[] = [];
      for (const child of rootGroup.children) {
        const mesh = child as THREE.Group;
        const gx = Math.round(mesh.position.x + c);
        const gy = Math.round(mesh.position.y + c);
        const gz = Math.round(mesh.position.z + c);

        let inThisSlice = false;
        switch (move.face) {
          case 'R':
            inThisSlice = gx === size - 1 - move.slice;
            break;
          case 'L':
            inThisSlice = gx === move.slice;
            break;
          case 'U':
            inThisSlice = gy === size - 1 - move.slice;
            break;
          case 'D':
            inThisSlice = gy === move.slice;
            break;
          case 'F':
            inThisSlice = gz === size - 1 - move.slice;
            break;
          case 'B':
            inThisSlice = gz === move.slice;
            break;
        }

        if (inThisSlice) {
          sliceMeshes.push(mesh);
        }
      }

      // Reset pivot transforms
      pivotGroup.position.set(0, 0, 0);
      pivotGroup.rotation.set(0, 0, 0);
      pivotGroup.updateMatrix();

      // Attach slice meshes to pivot while preserving world coordinates
      for (const mesh of sliceMeshes) {
        pivotGroup.attach(mesh);
      }

      const startTime = performance.now();
      setIsAnimating(true);

      const step = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);

        // Smooth cubic ease-out for realistic mechanical snapping
        const eased = 1 - Math.pow(1 - progress, 3);
        const currentAngle = targetAngle * eased;

        pivotGroup.setRotationFromAxisAngle(axis, currentAngle);

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          // Finished: enforce exact target angle
          pivotGroup.setRotationFromAxisAngle(axis, targetAngle);
          pivotGroup.updateMatrixWorld(true);

          // Detach meshes back to rootGroup and mathematically snap
          // both position and orientation to eliminate any floating-point drift!
          const snapStep = Math.PI / 2;
          for (const mesh of sliceMeshes) {
            rootGroup.attach(mesh);

            // Snap position to exact integer grid coordinates
            mesh.position.x = Math.round(mesh.position.x + c) - c;
            mesh.position.y = Math.round(mesh.position.y + c) - c;
            mesh.position.z = Math.round(mesh.position.z + c) - c;

            // Snap rotation to exact 90-degree multiples
            const euler = new THREE.Euler().setFromQuaternion(mesh.quaternion, 'XYZ');
            euler.x = Math.round(euler.x / snapStep) * snapStep;
            euler.y = Math.round(euler.y / snapStep) * snapStep;
            euler.z = Math.round(euler.z / snapStep) * snapStep;
            mesh.quaternion.setFromEuler(euler);
            mesh.updateMatrix();
          }

          // Reset pivot rotation
          pivotGroup.rotation.set(0, 0, 0);
          pivotGroup.updateMatrix();

          // Update mathematical store state!
          executeMove(move.notation, true);

          setIsAnimating(false);
          onFinished();
        }
      };

      requestAnimationFrame(step);
    },
    [size, isSolvingPlaying, getDurationMs, setIsAnimating, executeMove]
  );

  // Move queue consumer
  useEffect(() => {
    if (!threeRef.current) return;
    if (moveQueue.length === 0) return;
    if (threeRef.current.animating) return;

    const runNext = () => {
      if (!threeRef.current || threeRef.current.animating) return;
      const item = dequeueMove();
      if (!item) return;

      threeRef.current.animating = true;
      animateLayerRotation(item.move, () => {
        if (threeRef.current) {
          threeRef.current.animating = false;
        }
        if (item.onComplete) item.onComplete();

        // Check if there are further moves in the queue
        const remaining = useCubeStore.getState().moveQueue;
        if (remaining.length > 0) {
          requestAnimationFrame(() => {
            runNext();
          });
        }
      });
    };

    runNext();
  }, [moveQueue, dequeueMove, animateLayerRotation]);

  // Touch and pointer interaction handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!interactive || !threeRef.current) return;
    const container = containerRef.current;
    if (!container) return;

    // Capture pointer
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    interactionRef.current.isPointerDown = true;
    interactionRef.current.startX = x;
    interactionRef.current.startY = y;
    interactionRef.current.lastX = x;
    interactionRef.current.lastY = y;
    interactionRef.current.pointerMode = 'none';

    // If auto-solver is actively playing or a layer is currently animating, orbit camera only
    if (isSolvingPlaying || threeRef.current.animating || isAnimating) {
      interactionRef.current.pointerMode = 'camera_orbit';
      return;
    }

    // Normalize coordinates for Raycaster (-1 to +1)
    const mouse = new THREE.Vector2((x / rect.width) * 2 - 1, -(y / rect.height) * 2 + 1);
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, threeRef.current.camera);

    // Check intersection with all cubies in rootGroup and pivotGroup
    const allTargets = [
      ...threeRef.current.rootGroup.children,
      ...threeRef.current.pivotGroup.children,
    ];
    const intersects = raycaster.intersectObjects(allTargets, true);

    if (intersects.length > 0) {
      const hit = intersects[0];

      // 1. Determine TRUE world-space face normal from hit polygon transformed by matrixWorld
      let normalKey: '+x' | '-x' | '+y' | '-y' | '+z' | '-z' | null = null;
      if (hit.face) {
        const wn = hit.face.normal.clone().transformDirection(hit.object.matrixWorld);
        const ax = Math.abs(wn.x);
        const ay = Math.abs(wn.y);
        const az = Math.abs(wn.z);
        if (ax > 0.6) {
          normalKey = wn.x > 0 ? '+x' : '-x';
        } else if (ay > 0.6) {
          normalKey = wn.y > 0 ? '+y' : '-y';
        } else if (az > 0.6) {
          normalKey = wn.z > 0 ? '+z' : '-z';
        }
      }

      // 2. Fallback using hit.point in cube space (for beveled corners or plastic edges)
      if (!normalKey) {
        const p = hit.point;
        const absX = Math.abs(p.x);
        const absY = Math.abs(p.y);
        const absZ = Math.abs(p.z);

        if (absX >= absY && absX >= absZ) {
          normalKey = p.x > 0 ? '+x' : '-x';
        } else if (absY >= absX && absY >= absZ) {
          normalKey = p.y > 0 ? '+y' : '-y';
        } else {
          normalKey = p.z > 0 ? '+z' : '-z';
        }
      }

      // Compute exact physical grid coordinates (0 to size - 1) of the touched cubie
      const c = (size - 1) / 2;
      const cubieX = Math.max(0, Math.min(size - 1, Math.round(hit.point.x + c)));
      const cubieY = Math.max(0, Math.min(size - 1, Math.round(hit.point.y + c)));
      const cubieZ = Math.max(0, Math.min(size - 1, Math.round(hit.point.z + c)));

      interactionRef.current.pointerMode = 'face_drag';
      interactionRef.current.hitNormalKey = normalKey;
      interactionRef.current.hitPoint = hit.point.clone();
      interactionRef.current.hitGridX = cubieX;
      interactionRef.current.hitGridY = cubieY;
      interactionRef.current.hitGridZ = cubieZ;
      return; // STOP HERE! Camera will never move during this touch.
    }

    // Otherwise empty space around cube was touched: Camera Orbit!
    interactionRef.current.pointerMode = 'camera_orbit';
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!interactionRef.current.isPointerDown || !threeRef.current) return;
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const dx = x - interactionRef.current.lastX;
    const dy = y - interactionRef.current.lastY;
    const totalDx = x - interactionRef.current.startX;
    const totalDy = y - interactionRef.current.startY;

    interactionRef.current.lastX = x;
    interactionRef.current.lastY = y;

    const sensFactor =
      cameraSensitivity === 'low' ? 0.003 : cameraSensitivity === 'high' ? 0.009 : 0.0055;

    // CAMERA ONLY ORBITS IF POINTER STARTED ON EMPTY SPACE
    if (interactionRef.current.pointerMode === 'camera_orbit') {
      threeRef.current.targetSpherical.theta -= dx * sensFactor;
      threeRef.current.targetSpherical.phi -= dy * sensFactor;
      threeRef.current.targetSpherical.phi = Math.max(
        0.05,
        Math.min(Math.PI - 0.05, threeRef.current.targetSpherical.phi)
      );
      return;
    }

    // FACE DRAG: CAMERA NEVER MOVES HERE
    if (interactionRef.current.pointerMode === 'face_drag') {
      const dist = Math.hypot(totalDx, totalDy);
      if (dist > 14) {
        const { hitNormalKey, hitPoint, hitGridX, hitGridY, hitGridZ } = interactionRef.current;
        if (hitNormalKey !== null && hitPoint !== null) {
          const camera = threeRef.current.camera;

          const worldTangents: { axis: 'x' | 'y' | 'z'; vec: THREE.Vector3 }[] = [];
          if (hitNormalKey === '+z' || hitNormalKey === '-z') {
            worldTangents.push({ axis: 'x', vec: new THREE.Vector3(1, 0, 0) });
            worldTangents.push({ axis: 'y', vec: new THREE.Vector3(0, 1, 0) });
          } else if (hitNormalKey === '+x' || hitNormalKey === '-x') {
            worldTangents.push({ axis: 'z', vec: new THREE.Vector3(0, 0, 1) });
            worldTangents.push({ axis: 'y', vec: new THREE.Vector3(0, 1, 0) });
          } else if (hitNormalKey === '+y' || hitNormalKey === '-y') {
            worldTangents.push({ axis: 'x', vec: new THREE.Vector3(1, 0, 0) });
            worldTangents.push({ axis: 'z', vec: new THREE.Vector3(0, 0, 1) });
          }

          let bestAxis: 'x' | 'y' | 'z' = worldTangents[0].axis;
          let bestSign: 1 | -1 = 1;
          let maxDot = -Infinity;

          const screenDrag = new THREE.Vector2(totalDx, totalDy).normalize();

          for (const { axis, vec } of worldTangents) {
            const p0 = hitPoint.clone().project(camera);
            const p1 = hitPoint.clone().add(vec).project(camera);

            const screenT = new THREE.Vector2(
              ((p1.x - p0.x) * rect.width) / 2,
              -((p1.y - p0.y) * rect.height) / 2
            ).normalize();

            const dot = screenDrag.dot(screenT);
            if (Math.abs(dot) > maxDot) {
              maxDot = Math.abs(dot);
              bestAxis = axis;
              bestSign = dot > 0 ? 1 : -1;
            }
          }

          const move = computeMoveFromDrag({
            faceNormalKey: hitNormalKey,
            cubieX: hitGridX,
            cubieY: hitGridY,
            cubieZ: hitGridZ,
            dragAxis: bestAxis,
            dragSign: bestSign,
            size,
          });

          if (move) {
            enqueueMove(move.notation);
            // Mark gesture completed so no further moves occur during this swipe
            interactionRef.current.pointerMode = 'drag_completed';
          }
        }
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignored
    }
    interactionRef.current.isPointerDown = false;
    interactionRef.current.pointerMode = 'none';
    interactionRef.current.pinchDist = null;
    interactionRef.current.hitNormalKey = null;
    interactionRef.current.hitPoint = null;
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!interactive || !threeRef.current) return;
    e.preventDefault();

    const zoomDelta = e.deltaY * 0.008;
    const minZoom = size * 1.5 + 1.5;
    const maxZoom = size * 4.5 + 8;

    threeRef.current.targetSpherical.radius = Math.max(
      minZoom,
      Math.min(maxZoom, threeRef.current.targetSpherical.radius + zoomDelta)
    );
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onWheel={handleWheel}
      className={`relative w-full h-full cursor-grab active:cursor-grabbing touch-none ${className}`}
      style={{ touchAction: 'none' }}
    />
  );
};
