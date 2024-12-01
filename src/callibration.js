
export class Callibration {
    constructor() {
        this.pointA = null;
        this.pointB = null;
        this.pointC = null;
    }
}

// Utility function that calibrates
export function update(gamepad1, cursor, scene) {
  if (!gamepad1) return;

  // BUTTONS:
  // 0: Front
  // 1: Back
  // 4: Touchscreen
  const clearPressed = gamepad1.buttons[1].value > 0;
  const projectPressed = gamepad1.buttons[0].value > 0;

  let vec1 = null;
  let vec2 = null;
  let vec3 = null;
  while (projectPressed) {
    new THREE.Vector3(cursor.x, cursor.y, cursor.z);
    positionAttribute.setXYZ(drawCount, cursor.x, cursor.y, cursor.z);
    for(let line of lines) {
      scene.remove(line);
    }
    lines = []; // Clear lines array
    lineIndex = 0; // Reset index
    drawCount = 0; // Reset draw count
    return;
  }
}

