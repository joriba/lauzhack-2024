// Threejs is the 3d graphics library used
import * as THREE from "three";
import { TubePainter } from "three/examples/jsm/misc/TubePainter.js";
import { XRButton } from "three/examples/jsm/webxr/XRButton.js";
import { XRControllerModelFactory } from "three/examples/jsm/webxr/XRControllerModelFactory.js";
// GLTFLoader loads GLTF objects, aka 3d assets
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
// DRACOloader loads geometry (compressed with DRACO) into the scene
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

// ======= MAIN SCRIPT
// CONSTANTS
const DRAW_COLOR = "#000000"

// Global variables to store the state of the camera, scene, controllers etc.
let camera, scene, renderer;
let controller1, controller2;
let controllerGrip1, controllerGrip2;
let stylus;
let painter1;
let gamepad1;
let isDrawing = false;
let prevIsDrawing = false;

// The material with which to draw the strokes
const material = new THREE.MeshPhongMaterial({
  color: DRAW_COLOR
})
// const material = new THREE.MeshNormalMaterial({
//   flatShading: true,
//   side: THREE.DoubleSide,
// });

const cursor = new THREE.Vector3();

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

init();

// is run once, at the beginning of the program
function init() {
  // =========== BASIC SCENE SETUP ================
  const canvas = document.querySelector("canvas.webgl");
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

  // ========== LIGHT ==============
  scene.add(new THREE.HemisphereLight(0x888877, 0x777788, 3));

  const light = new THREE.DirectionalLight(0xffffff, 1.5);
  light.position.set(0, 4, 0);
  scene.add(light);

  // a TubePainter lets us draw fixed-width 3d lines
  painter1 = new TubePainter();
  painter1.mesh.material = material;
  painter1.setSize(0.1);

  scene.add(painter1.mesh);

  // set up the scene renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
  renderer.setPixelRatio(window.devicePixelRatio, 2);
  renderer.setSize(sizes.width, sizes.height);
  renderer.setAnimationLoop(animate);
  renderer.xr.enabled = true;
  document.body.appendChild(XRButton.createButton(renderer, { optionalFeatures: ["unbounded"] }));

  // Set up the controllers
  const controllerModelFactory = new XRControllerModelFactory();

  controller1 = renderer.xr.getController(0);
  controller1.addEventListener("connected", onControllerConnected);
  controller1.addEventListener("selectstart", onSelectStart);
  controller1.addEventListener("selectend", onSelectEnd);
  controllerGrip1 = renderer.xr.getControllerGrip(0);
  controllerGrip1.add(controllerModelFactory.createControllerModel(controllerGrip1));
  scene.add(controllerGrip1);
  scene.add(controller1);

  controller2 = renderer.xr.getController(1);
  controller2.addEventListener("connected", onControllerConnected);
  controller2.addEventListener("selectstart", onSelectStart);
  controller2.addEventListener("selectend", onSelectEnd);
  controllerGrip2 = renderer.xr.getControllerGrip(1);
  controllerGrip2.add(controllerModelFactory.createControllerModel(controllerGrip2));
  scene.add(controllerGrip2);
  scene.add(controller2);
}

// boilerplate function, probably needed; updates the camera and 
// renderer when the view is resized
window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// updates the view if a button is pressed, that is, draws stuff
function animate() {
  if (!stylus) return;
  cursor.set(stylus.position.x, stylus.position.y, stylus.position.z);

  handleDrawing(stylus);

  // Render
  renderer.render(scene, camera);
}

// utility function that draws (who would've thunk)
function handleDrawing(controller) {
  const userData = controller.userData;
  const painter = userData.painter;

  if (gamepad1) {
    prevIsDrawing = isDrawing;
    isDrawing = gamepad1.buttons[5].value > 0;
    // debugGamepad(gamepad1);

    if (userData.isSelecting || isDrawing) {
      painter.lineTo(cursor);
      painter.update();
    }
    else {
      painter.moveTo(controller.position)
    }
  }
}

// setup and teardown functions
function onControllerConnected(e) {
  if (e.data.profiles.includes("logitech-mx-ink")) {
    stylus = e.target;
    stylus.userData.painter = painter1;
    gamepad1 = e.data.gamepad;
  }
}

function onSelectStart(e) {
  if (e.target !== stylus) return;
  const painter = stylus.userData.painter;
  painter.moveTo(stylus.position);
  this.userData.isSelecting = true;
}

function onSelectEnd() {
  this.userData.isSelecting = false;
}

function debugGamepad(gamepad) {
  gamepad.buttons.forEach((btn, index) => {
    if (btn.pressed) {
      console.log(`BTN ${index} - Pressed: ${btn.pressed} - Touched: ${btn.touched} - Value: ${btn.value}`);
    }

    if (btn.touched) {
      console.log(`BTN ${index} - Pressed: ${btn.pressed} - Touched: ${btn.touched} - Value: ${btn.value}`);
    }
  });
}
