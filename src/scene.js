import * as THREE from "three";
import { XRButton } from "three/examples/jsm/webxr/XRButton.js";

// GLTFLoader loads GLTF objects, aka 3d assets
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
// DRACOloader loads geometry (compressed with DRACO) into the scene
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

export let scene, camera, renderer;

export const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

export function init(animationLoop) {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x222222);

  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.01, 50);
  camera.position.set(0, 1.6, 3);

  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("/draco/");

  const gltfLoader = new GLTFLoader();
  gltfLoader.setDRACOLoader(dracoLoader);

  const grid = new THREE.GridHelper(4, 1, 0x111111, 0x111111);
  scene.add(grid);

  // set up the scene renderer
  const canvas = document.querySelector("canvas.webgl");
  renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
  renderer.setPixelRatio(window.devicePixelRatio, 2);
  renderer.setSize(sizes.width, sizes.height);
  renderer.setAnimationLoop(animationLoop);
  renderer.xr.enabled = true;
  document.body.appendChild(XRButton.createButton(renderer, { optionalFeatures: ["unbounded"] }));
}

export function resize() {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}