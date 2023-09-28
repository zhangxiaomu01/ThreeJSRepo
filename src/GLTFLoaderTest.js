import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js'

class GLTFLoaderTest {
    constructor() {
        console.log("GenerateTestData executed!");
    }
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