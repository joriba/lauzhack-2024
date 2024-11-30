import * as THREE from "three";

const MAX_POINTS = 5000;

let geometry;
let drawCount = 0;
let drawnPoints = [];
export let lines = []; // Initialize lines array
let lineIndex = 0;
let isDrawing = false;

let lineMaterial = new THREE.LineBasicMaterial({
  color: 0x0000ff
});

export function init() {
  // Initialize the lines array and the first line
  lines[lineIndex] = createNewLine();
}

function createNewLine() {
  drawnPoints = [];
  for (let i = 0; i < MAX_POINTS; i++) {
    drawnPoints.push(new THREE.Vector3(0, 0, i));
  }
  geometry = new THREE.BufferGeometry().setFromPoints(drawnPoints);
  geometry.setDrawRange(0, 0); // Start with no points
  return new THREE.Line(geometry, lineMaterial);
}

// Utility function that draws
export function update(controller, gamepad1, cursor, scene) {
  const userData = controller.userData;

  // BUTTONS:
  // 0: Front
  // 1: Back
  // 4: Touchscreen
  if (gamepad1) {
    isDrawing = gamepad1.buttons[4].value > 0;
    const clearPressed = gamepad1.buttons[1].value > 0;

    // Clear all lines when button 1 is pressed
    if (clearPressed) {
      for(let line of lines) {
        scene.remove(line);
      }
      lines = []; // Clear lines array
      lineIndex = 0; // Reset index
      drawCount = 0; // Reset draw count
      return;
    }

    if (isDrawing) {
      // Start a new line if the draw count is zero
      if (drawCount === 0) {
        let newLine = createNewLine();
        lines.push(newLine);
        if(scene)
          scene.add(newLine);
        lineIndex = lines.length - 1;
      }

      // Draw the current line
      if (drawCount < MAX_POINTS) {
        const positionAttribute = geometry.getAttribute("position");
        positionAttribute.setXYZ(drawCount, cursor.x, cursor.y, cursor.z);
        positionAttribute.needsUpdate = true;
        drawCount++;
        geometry.setDrawRange(0, drawCount);
      }
    } else {
      // Reset draw count when drawing stops
      drawCount = 0;
    }
  }
}

