import * as THREE from "three";

const MAX_POINTS = 5000;

let geometry;
let drawCount = 0;
let drawnPoints = [];
export let lines = []; // Initialize lines array
export let newLines = []; 
export let remoteLines = [];
let lineIndex = 0;
let newLineIndex = 0;
let isDrawing = false;

let lineMaterial = new THREE.LineBasicMaterial({
  color: 0x0000ff
});

let lineMaterialOpponent = new THREE.LineBasicMaterial({
  color: 0xff0000
});

export function init() {
  // Initialize the lines array and the first line
  lines[lineIndex] = createNewLine();
}

function createNewLine() {
  drawnPoints = [];
  for (let i = 0; i < MAX_POINTS; i++) {
    drawnPoints.push(new THREE.Vector3(0, 0, 0));
  }
  let geometry = new THREE.BufferGeometry().setFromPoints(drawnPoints);
  geometry.setDrawRange(0, 0); // Start with no points
  return new THREE.Line(geometry, lineMaterial);
}

// Utility function that draws
export function update(gamepad1, cursor, scene) {
  if (!gamepad1) return;

  // BUTTONS:
  // 0: Front
  // 1: Back
  // 4: Touchscreen
  isDrawing = gamepad1.buttons[4].value > 0;
  const clearPressed = gamepad1.buttons[1].value > 0;
  const projectPressed = gamepad1.buttons[0].value > 0;

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

  if (projectPressed) {
    const PROJECTION = new THREE.Matrix4();
    PROJECTION.set(
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 0, 0,
      0, 0, 0, 0
    )

    let combined = allPoints();
    for (let i = 0; i < combined.length; i++) {
      let point = combined[i];
      // point.divideScalar(point.w);
      combined[i] = new THREE.Vector3(point.x, point.y, -5);
    }

    let projectedMaterial = new THREE.LineBasicMaterial({
      color: 0x00ff00
    });
    let newgeometry = new THREE.BufferGeometry()
    newgeometry.setFromPoints(combined);
    scene.add(new THREE.Line(newgeometry, projectedMaterial));

    for(let line of lines) {
      scene.remove(line);
    }
    lines = []; // Clear lines array
    lineIndex = 0; // Reset index
    newLineIndex = 0; // Reset index
    drawCount = 0; // Reset draw count
    return;
  }

  if (isDrawing) {
    // Start a new line if the draw count is zero
    if (drawCount === 0) {
      let newLine = createNewLine();
      lines.push(newLine);
      newLines.push(newLine.clone());
      if(scene)
        scene.add(newLine);
      lineIndex = lines.length - 1;
      newLineIndex = newLines.length - 1;
    }

    // Draw the current line
    if (drawCount < MAX_POINTS) {
      const positionAttribute = lines[lineIndex].geometry.getAttribute("position");
      positionAttribute.setXYZ(drawCount, cursor.x, cursor.y, cursor.z);
      positionAttribute.needsUpdate = true;
      //const positionAttributeNew = newLines[newLineIndex].geometry.getAttribute("position");
      //positionAttributeNew.setXYZ(drawCount, cursor.x, cursor.y, cursor.z);
      //positionAttributeNew.needsUpdate = true;
      drawCount++;
      lines[lineIndex].geometry.setDrawRange(0, drawCount);
      newLines[newLineIndex].geometry.setDrawRange(0, drawCount);
    }
  } else {
    // Reset draw count when drawing stops
    drawCount = 0;
  }
}

export function allPoints() {
  let result = []
  for (let line of lines) {
    const positionAttribute = line.geometry.getAttribute('position');
    let numPoints = line.geometry.drawRange.count;
    for (let i = 0; i < numPoints; i++) {
      const point = new THREE.Vector3();
      point.fromBufferAttribute(positionAttribute, i);
      result.push(point);
    }
  }
  return result;
}

export function exportLinesToJSON() {
  if (isDrawing)
    return "[]";
  let out = [];
  for (let line of newLines) {
    let lineOut = [];
    const positionAttribute = line.geometry.getAttribute('position');
    let numPoints = line.geometry.drawRange.count;
    for (let i = 0; i < numPoints; i++) {
      const point = new THREE.Vector3();
      point.fromBufferAttribute(positionAttribute, i);
      lineOut.push(
        [
          point.x,
          point.y,
          point.z
        ]
      );
    }
    out.push(lineOut);
  }
  newLines = [];
  newLineIndex = 0;
  const newLinesJson = JSON.stringify(out);
  return newLinesJson;
}

export function importLinesFromJSON(jsonLines, scene) {
  const newLinesRemote =  JSON.parse(jsonLines);
  for ( let lineArray of newLinesRemote ) {
    drawnPoints = [];
    for ( let pointArray of lineArray ) {
      drawnPoints.push(
        new THREE.Vector3(pointArray[0], pointArray[1], pointArray[2])
      );
    }
    let geometry = new THREE.BufferGeometry().setFromPoints(drawnPoints);
    geometry.setDrawRange(0, lineArray.length-1); // Start with no points
    const line = new THREE.Line(geometry, lineMaterialOpponent);
    scene.add(line);
    console.log(lineArray)
    console.log(drawnPoints)
    remoteLines.push(line);
  }
}