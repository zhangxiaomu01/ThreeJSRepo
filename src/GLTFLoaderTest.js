import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js'

/**
 * GLTFLoaderTest class.
 */
class GLTFLoaderTest {
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
     */
    static LoadGLTFModel(currentScene) {
        const loader = new GLTFLoader();
        loader.load('./threejs_r155/examples/models/gltf/RobotExpressive/RobotExpressive.glb', function (model) {
            console.log('gltf model!', model);
            console.log(model.scene);
            currentScene.add(model.scene);
        });
    }
};

export {GLTFLoaderTest}