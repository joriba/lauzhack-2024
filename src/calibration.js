import * as THREE from "three";

export class Calibration {
    constructor() {
        this.addVector = null;
        this.calibrationVector1;
        let calibrationVector2;
    }

    // Utility function that calibrates
    calibrate(gamepad1, cursor, scene) {
      if (!gamepad1) return;

      // BUTTONS:
      // 0: Front
      // 1: Back
      // 4: Touchscreen
      const clearPressed = gamepad1.buttons[1].value > 0;
      const projectPressed = gamepad1.buttons[0].value > 0;

      let vector1Calibrated = false;
      let vector2Calibrated = false;

      const geometry = new THREE.SphereGeometry( 0.02 );
      const material = new THREE.MeshBasicMaterial( { color: 0xfff00 } )
      let cube1 = new THREE.Mesh( geometry, material );
      let cube2 = new THREE.Mesh( geometry, material );

      if (projectPressed && !vector1Calibrated) {
        vector1Calibrated = true;
        calibrationVector1 = new THREE.Vector3(cursor.x, cursor.y, cursor.z);
        cube1.position.set(cursor.x, cursor.y, cursor.z);
        scene.add(cube1);
      }

      if (projectPressed && !vector2Calibrated) {
        vector1Calibrated = false;
        calibrationVector2 = new THREE.Vector3(cursor.x, cursor.y, cursor.z);
        cube2.position.set(cursor.x, cursor.y, cursor.z);
        scene.add(cube2);
      }
      
    }
}
