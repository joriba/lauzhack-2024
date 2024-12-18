// Threejs is the 3d graphics library used
import * as THREE from "three";
import { TubePainter } from "three/examples/jsm/misc/TubePainter.js";
import { XRControllerModelFactory } from "three/examples/jsm/webxr/XRControllerModelFactory.js";

import * as SCENE from "./scene.js";
import { Communication, SpellSocket } from "./communication.js";
// import { Calibration } from "./calibration.js";
import * as DRAWING from "./drawings.js"

import { Communication, SpellSocket } from "./communication.js";

// ======= MAIN SCRIPT
// CONSTANTS
const DRAW_COLOR = "#ffffff"

// Global variables to store the state of the camera, scene, controllers etc.
let camera, scene, renderer;
let controller1, controller2;
let controllerGrip1, controllerGrip2;
let stylus;
let painter1;
let gamepad1;
let connection;

// The material with which to draw the strokes
const material = new THREE.MeshPhongMaterial({
  color: DRAW_COLOR
})
// const material = new THREE.MeshNormalMaterial({
//   flatShading: true,
//   side: THREE.DoubleSide,
// });

const cursor = new THREE.Vector3();

const sizes = SCENE.sizes;

init();

// is run once, at the beginning of the program
function init() {
  // ===========  NETWORK INITIALISATION ================
  let socket = new SpellSocket().then( () => {
    connection = new Communication(socket);
  });


  // =========== BASIC SCENE SETUP ================
  SCENE.init(animate)
  scene = SCENE.scene;
  camera = SCENE.camera;
  renderer = SCENE.renderer;
  DRAWING.init()

  // ========== LIGHT ==============
  scene.add(new THREE.HemisphereLight(0x888877, 0x777788, 3));

  const light = new THREE.DirectionalLight(0xffffff, 1.5);
  light.position.set(0, 4, 0);
  scene.add(light);

  painter1 = new TubePainter();
  painter1.mesh.material = material;
  painter1.setSize(0.1);

  scene.add(painter1.mesh);

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
  SCENE.resize(window);
});

// updates the view if a button is pressed, that is, draws stuff
function animate() {
  if (!stylus) return;
  cursor.set(stylus.position.x, stylus.position.y, stylus.position.z);

  DRAWING.update(gamepad1, cursor, scene);

  /*let cal = new Calibration();
  cal.calibrate(gamepad1, cursor, scene);*/

  connection.send(DRAWING.exportLinesToJSON());
  connection.setOnDataReceivedHandler(
    (data) => {
      DRAWING.importLinesFromJSON(data,scene)
    }
  );

  // Render
  renderer.render(scene, camera);
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
