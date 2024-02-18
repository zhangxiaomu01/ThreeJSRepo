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

/**
 * Updates the strength of the bloom effect. 
 * See {@linkcode UnrealBloomPass} for more detail.
 * 
 * @param {number} threshold 
 * @param {number} strength 
 * @param {number} radius 
 */
function updateBloomEffect(threshold, strength, radius) {
    genoPrototype.bloomPass.threshold = threshold;
    genoPrototype.bloomPass.strength = strength;
    genoPrototype.bloomPass.radius = radius;
}

window.getGenoPrototype = getGenoPrototype;
window.showFPSPanel = showFPSPanel;
window.getCamera = getCamera;
window.setUpperSphereRotateSpeed = setUpperSphereRotateSpeed;
window.updateBloomEffect = updateBloomEffect;
