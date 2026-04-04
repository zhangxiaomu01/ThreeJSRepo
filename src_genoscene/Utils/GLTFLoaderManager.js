import { THREE, GLTFLoader } from '../CommonImports.js'

/**
 * GLTFLoaderManager class.
 */
class GLTFLoaderManager {
    /**
     * A default constructor.
     * @constructor
     */
    constructor() {
        console.log("GenerateTestData executed!");
    }

    /**
     * Loads the current GLTF model.
     * 
     * @param {THREE.scene} currentScene the current Three scene. 
     * @param {THREE.Vector3} position the default model position. 
     */
    static LoadGLTFModel(currentScene, position) {
        const loader = new GLTFLoader();
        loader.load('./threejs_r155/examples/models/gltf/RobotExpressive/RobotExpressive.glb', function (model) {
            console.log('gltf model!', model);
            console.log(model.scene);
            model.scene.position.set(position.x, position.y, position.z);
            currentScene.add(model.scene);
        });
    }
};

export {GLTFLoaderManager}