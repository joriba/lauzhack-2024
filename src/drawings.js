import * as math from "mathjs"
import * as THREE from "three";
import * as SPELLS from "./spells.js"

const MAX_POINTS = 5000;

let drawCount = 0;
let drawnPoints = [];
export let lines; // Initialize lines array
let lineIndex = 0;
let isDrawing = false;
let projectPressed = false;
let prevProjectPressed = false;

let lineMaterial = new THREE.LineBasicMaterial({
  color: 0x0000ff
});

export function init() {
  // Initialize the lines array and the first line
  lines = [];
}

function createNewLine() {
  drawnPoints = [];
  for (let i = 0; i < MAX_POINTS; i++) {
    drawnPoints.push(new THREE.Vector3(0, 0, 0));
  }
  let geometry = new THREE.BufferGeometry().setFromPoints(drawnPoints);
  geometry.setDrawRange(0, 0); // Start with no points
  console.log(lines);
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
  prevProjectPressed = projectPressed;
  projectPressed = gamepad1.buttons[0].value > 0;

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

  if (projectPressed && !prevProjectPressed) {
    console.log(clearPressed);
    let combined = allPoints();
    const bestPlane = computeBestFitPlane(combined);
    let projected = projectToPlane(combined, bestPlane);

    getImageForDrawnPoints(projected, bestPlane, scene);

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
  console.log(lines);
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

function getImageForDrawnPoints(points, plane, scene) {
  // Step 1: find 2d basis for the plane
  let planeNormal = plane.normal, planePoint = plane.centroid;
  let arbitraryVec = new THREE.Vector3(1, 0, 0);
  let u = new THREE.Vector3().crossVectors(planeNormal, arbitraryVec).normalize();
  let v = new THREE.Vector3().crossVectors(planeNormal, u).normalize();

  // Step 2: map each point to its coordinates in plane coordinates
  let newPoints = points.map(p => {
    let r = new THREE.Vector3().subVectors(p, planePoint);
    return new THREE.Vector2(r.dot(u), r.dot(v));
  })

  // Step 3: scale and translate it to the unit square
  // Find bounding box of points
  const min = { x: Infinity, y: Infinity };
  const max = { x: -Infinity, y: -Infinity };
  
  newPoints.forEach(point => {
    min.x = Math.min(min.x, point.x);
    min.y = Math.min(min.y, point.y);
    max.x = Math.max(max.x, point.x);
    max.y = Math.max(max.y, point.y);
  });

  let translation = new THREE.Vector2((max.x - min.x) / 2, (max.y - min.y) / 2);
  let translated = newPoints.map(point => new THREE.Vector2().addVectors(point, translation));

  let scaleFactorX = 1 / (max.x - min.x), scaleFactorY = 1 / (max.y - min.y);
  let scaled = translated.map(point => {
    let result = point.clone().multiply(new THREE.Vector2(scaleFactorX, scaleFactorY))
    result.x = Math.min(Math.max(0, result.x), 0.999999);
    result.y = Math.min(Math.max(0, result.y), 0.999999);
    return result;
  })

  // Step 4: Rasterize the points
  const IMG_SIZE = 16;
  let rasterized = [...Array(IMG_SIZE)].map(e => Array(IMG_SIZE).fill(0));
  for(let point of scaled) {
    let x = Math.floor(point.x * IMG_SIZE);
    let y = Math.floor(point.y * IMG_SIZE);
    rasterized[x][y] = 1;
  }
  console.log(rasterized);

  // STEP 5: Compare to the references and display the best fitting
  console.log(SPELLS.bestFittingSpell(rasterized));

  // draw to debug
  let rasterizedPoints = []
  for (let x = 0; x < IMG_SIZE; x++) {
    for (let y = 0; y < IMG_SIZE; y++) {
      if (rasterized[x][y] == 1) {
        rasterizedPoints.push(new THREE.Vector3(
          x / IMG_SIZE - 0.5,
          0,
          y / IMG_SIZE - 0.5
        ))
      }
    }
  }
  
  let projectedMaterial = new THREE.LineBasicMaterial({
    color: 0x00ff00
  });
  let newgeometry = new THREE.BufferGeometry()
  newgeometry.setFromPoints(rasterizedPoints);
  scene.add(new THREE.Points(newgeometry, projectedMaterial));

}