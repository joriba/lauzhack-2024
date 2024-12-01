import * as THREE from "three"
import * as math from "mathjs"

export class Spell {
    constructor(name, points) {
        this.name = name;
        this.points = points;
    }
}

const NUH_HUH = new Spell(
    "nuh-huh",
    [
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
        [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
        [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
        [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
        [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
        [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
        [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    ]
)

const STUPEFY = new Spell(
    "stupefy",
    [
          [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
          [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
          [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
          [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
          [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
          [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
          [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
          [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
          [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
          [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
          [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
          [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
          [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
          [0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
    ]
)

const SPELLS = [NUH_HUH, STUPEFY]

function alignPoints(points) {
  // Compute the centroid
  const centroid = { x: 0, y: 0 };
  points.forEach(p => {
    centroid.x += p.x;
    centroid.y += p.y;
  });
  centroid.x /= points.length;
  centroid.y /= points.length;

  // Center the points
  const centeredPoints = points.map(p => ({
    x: p.x - centroid.x,
    y: p.y - centroid.y,
  }));

  // Compute covariance matrix
  let xx = 0, xy = 0, yy = 0;
  centeredPoints.forEach(p => {
    xx += p.x * p.x;
    xy += p.x * p.y;
    yy += p.y * p.y;
  });
  const covarianceMatrix = [
    [xx, xy],
    [xy, yy],
  ];

  // Perform eigen decomposition (use numeric.js or similar)
  let eigen = math.eigs(covarianceMatrix);
  let eigenvectors = eigen.eigenvectors;

  // Primary axis (largest eigenvector)
  const u = eigenvectors[0].vector;

  // Secondary axis (smallest eigenvector)
  const v = eigenvectors[1].vector;

  // Construct rotation matrix
  const rotationMatrix = [
    [u[0], v[0]],
    [u[1], v[1]],
  ];

  // Rotate points to align with the axes
  const alignedPoints = centeredPoints.map(p => {
    const xNew = rotationMatrix[0][0] * p.x + rotationMatrix[0][1] * p.y;
    const yNew = rotationMatrix[1][0] * p.x + rotationMatrix[1][1] * p.y;
    return { x: xNew, y: yNew };
  });

  return alignedPoints;
}

function compare_points(drawn, reference) {
  const IMG_SIZE = drawn.length;
  //first, compute the points from the matrices
  let drawnPoints = []
  for (let x = 0; x < IMG_SIZE; x++) {
    for (let y = 0; y < IMG_SIZE; y++) {
      if (drawn[x][y] == 1) {
        drawnPoints.push(new THREE.Vector2(
          x / IMG_SIZE - 0.5,
          y / IMG_SIZE - 0.5
        ))
      }
    }
  }
  let referencePoints = []
  for (let x = 0; x < IMG_SIZE; x++) {
    for (let y = 0; y < IMG_SIZE; y++) {
      if (reference[x][y] == 1) {
        referencePoints.push(new THREE.Vector2(
          x / IMG_SIZE - 0.5,
          y / IMG_SIZE - 0.5
        ))
      }
    }
  }
  
  let alignedDraw = alignPoints(drawnPoints);
  let alignedReference = alignPoints(referencePoints);

  let finalDraw = [...Array(IMG_SIZE)].map(e => Array(IMG_SIZE).fill(0));
  for(let point of alignedDraw) {
    let x = Math.floor((point.x + 0.5) * IMG_SIZE);
    x = Math.max(Math.min(IMG_SIZE - 1, x), 0);
    let y = Math.floor((point.y + 0.5) * IMG_SIZE);
    y = Math.max(Math.min(IMG_SIZE - 1, y), 0);
    finalDraw[x][y] = 1;
  }

  let finalReference = [...Array(IMG_SIZE)].map(e => Array(IMG_SIZE).fill(0));
  for(let point of alignedReference) {
    let x = Math.floor((point.x + 0.5) * IMG_SIZE);
    x = Math.max(Math.min(IMG_SIZE - 1, x), 0);
    let y = Math.floor((point.y + 0.5) * IMG_SIZE);
    y = Math.max(Math.min(IMG_SIZE - 1, y), 0);
    finalReference[x][y] = 1;
  }

  // now, FINALLY, do image comparison to get a similarity value
  let similarity = 0
  for (let x = 0; x < IMG_SIZE; x++) {
    for (let y = 0; y < IMG_SIZE; y++) {
      if (finalDraw[x][y] == finalReference[x][y]) {
        similarity++;
      }
    }
  }
  return similarity / (IMG_SIZE * IMG_SIZE);
}

export function bestFittingSpell(drawn) {
  let best = null;
  let best_score = 0;
  for (let spell of SPELLS) {
    let score = compare_points([...drawn], spell.points);
    console.log("Score for %s: %f\n", spell.name, score);
    if (score > best_score) {
      best = spell.name;
      best_score = score;
    }
  }
  return best;
}