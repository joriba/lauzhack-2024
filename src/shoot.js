import * as THREE from "three";

let prevIsShooting = false;
let isShooting = false;
let shotLines = []
const geometry = new THREE.SphereGeometry( 0.1 );
const material = new THREE.MeshBasicMaterial( { color: 0x00fff0 } );
let cubes = []

// Utility function that draws
export function update(controller, gamepad1, cursor, scene, lines) {
  // BUTTONS:
  // 0: Front
  // 1: Back
  // 4: Touchscreen
  if (gamepad1) {
    prevIsShooting = isShooting;
    isShooting = gamepad1.buttons[0].value > 0;

    if (isShooting && !prevIsShooting) {
      let cube = new THREE.Mesh( geometry, material );
      cube.position.set(cursor.x, cursor.y, cursor.z)

      cubes.push(cube)
      //scene.add(cube);

      shotLines = [...lines]
    }

    cubes.forEach((c) => c.position.z -= 0.1)
    shotLines.forEach((l) => l.position.z -= 0.1)
  }
}

