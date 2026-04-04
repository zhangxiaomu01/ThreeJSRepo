import { THREE } from '../CommonImports.js'

/**
 * BackgroundManager class.
 */
class BackgroundManager {
    /**
     * A default constructor.
     * @constructor
     */
    constructor() {
        console.log("BackgroundManager created!");
    }

    /**
     * One way to add environment background to the scene.
     */
    static AddSixFaceEnvMap(scene) {
        const loader = new THREE.CubeTextureLoader();
        const texture = loader.load([
            './resources/0.jpeg',
            './resources/1.jpeg',
            './resources/2.jpeg',
            './resources/3.jpeg',
            './resources/4.jpeg',
            './resources/5.jpeg',
        ]);
        scene.background = texture;
    }

};

export {BackgroundManager}