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

/**
 * Gets the particle configs for the bottom particle emitters. 
 * Update this parameter then call {@linkcode initParticles} to initialize the particle system.
 * @returns {Object} bottom particle configs.
 */
function getBottomParticleParameter() {
    return genoPrototype.particleSystem.bottomParticleParamter;
}

/**
 * Gets the particle configs for the up particle emitters. 
 * Update this parameter then call {@linkcode initParticles} to initialize the particle system.
 * @returns {Object} up particle configs.
 */
function getUpParticleParameter() {
    return genoPrototype.particleSystem.upParticleParamter;
}

/**
 * Initialize the particle system based on the input particle configs.
 */
function initParticles() {
    genoPrototype.initParticles();
}

window.getGenoPrototype = getGenoPrototype;
window.showFPSPanel = showFPSPanel;
window.getCamera = getCamera;
window.setUpperSphereRotateSpeed = setUpperSphereRotateSpeed;
window.updateBloomEffect = updateBloomEffect;
window.getBottomParticleParameter = getBottomParticleParameter;
window.getUpParticleParameter = getUpParticleParameter;
window.initParticles = initParticles;
