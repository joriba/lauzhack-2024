import * as math from "mathjs"
import * as THREE from "three";

const MAX_POINTS = 5000;

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
    let combined = allPoints();
    const bestPlane = computeBestFitPlane(combined);
    let projected = projectToPlane(combined, bestPlane);

    let projectedMaterial = new THREE.LineBasicMaterial({
      color: 0x00ff00
    });
    let newgeometry = new THREE.BufferGeometry()
    newgeometry.setFromPoints(projected);
    scene.add(new THREE.Line(newgeometry, projectedMaterial));

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
      const positionAttribute = lines[lineIndex].geometry.getAttribute("position");
      positionAttribute.setXYZ(drawCount, cursor.x, cursor.y, cursor.z);
      positionAttribute.needsUpdate = true;
      drawCount++;
      lines[lineIndex].geometry.setDrawRange(0, drawCount);
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

function computeBestFitPlane(points) {
  // Step 1: compute centroid
  const centroid = new THREE.Vector3();
  points.forEach(p => centroid.add(p));
  centroid.divideScalar(points.length);

  // Step 2: compute covariance matrix
  let xx = 0, xy = 0, xz = 0, yy = 0, yz = 0, zz = 0;
  points.forEach(p => {
    const dx = p.x - centroid.x;
    const dy = p.y - centroid.y;
    const dz = p.z - centroid.z;
    xx += dx * dx; xy += dx * dy; xz += dx * dz;
    yy += dy * dy; yz += dy * dz; zz += dz * dz;
  });

  const covarianceMatrix = [
    [xx, xy, xz],
    [xy, yy, yz],
    [xz, yz, zz],
  ];

  const eigen = math.eigs(covarianceMatrix);
  const normal = new THREE.Vector3(...eigen.eigenvectors[0].vector);
  return { normal, centroid };
}

function projectToPlane(points, plane) {
  const {normal, centroid} = plane;
  let normalizedNormal = normal.clone().normalize();
  let result = [...points];
  for (let i = 0; i < points.length; i++) {
    let point = result[i].clone();
    let toPoint = point.sub(centroid);
    const distance = toPoint.dot(normalizedNormal);
    result[i].sub(normalizedNormal.clone().multiplyScalar(distance));
  }
  return result;
}