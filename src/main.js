import { GenoPrototype } from './GenoPrototype/GenoPrototype.js';

const genoPrototype = new GenoPrototype();

/**
 * Get the {@linkcode GenoPrototype} object. All the emitters / camera / scene are defined
 * here.
 * @returns {GenoPrototype}
 */
function getGenoPrototype() {
    return genoPrototype;
}

/**
 * Show fps performance panel.
 */
function showFPSPanel() {
    genoPrototype.showFPSPanel();
}

/**
 * Gets the current camera.
 */
function getCamera() {
    return genoPrototype.camera;
}

/**
 * Sets the rotation speed of the upper spheres.
 * @param {number} newSpeed new speed.
 */
function setUpperSphereRotateSpeed(newSpeed) {
    genoPrototype.upperSphereRotateSpeed = newSpeed;
}

window.getGenoPrototype = getGenoPrototype;
window.showFPSPanel = showFPSPanel;
window.getCamera = getCamera;
window.setUpperSphereRotateSpeed = setUpperSphereRotateSpeed;
