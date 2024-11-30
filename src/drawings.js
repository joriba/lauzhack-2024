import * as THREE from "three";

const MAX_POINTS = 5000;

let geometry;
let drawCount = 0;
let drawnPoints = [];
export let line;
let isDrawing = false;

let lineMaterial = new THREE.LineBasicMaterial({
  color: 0x0000ff
});

export function init() {
  for(let i = 0; i < MAX_POINTS; i++) {
    drawnPoints.push(new THREE.Vector3(0, 0, i));
  }
  geometry = new THREE.BufferGeometry().setFromPoints(drawnPoints);
  geometry.setDrawRange(0, drawCount);
  line = new THREE.Line(geometry, lineMaterial);
}

// utility function that draws (who would've thunk)
export function update(controller, gamepad1, cursor) {
  const userData = controller.userData;

  // BUTTONS:
  // 0: Front
  // 1: Back
  // 4: Touchscreen
  if (gamepad1) {
    isDrawing = gamepad1.buttons[4].value > 0;
    // debugGamepad(gamepad1);

    if (isDrawing) {
      if (drawCount < MAX_POINTS) {
        const positionAttribute = geometry.getAttribute('position');
        positionAttribute.setXYZ(drawCount, cursor.x, cursor.y, cursor.z);
        geometry.getAttribute('position').needsUpdate = true;
        drawCount++;
        geometry.setDrawRange(0, drawCount);
      }
    }
    else {
      drawCount = 0;
      geometry.setDrawRange(0, drawCount);
    }
  }
}
