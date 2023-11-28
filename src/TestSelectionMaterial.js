
import * as THREE from 'three';
// 扩展库OrbitControls.js
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// 扩展库GLTFLoader.js
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
// Stat.js
import Stats from 'three/addons/libs/stats.module.js';
import { GenerateTestData } from './GenerateTestData.js';
import { GLTFLoaderTest } from './GLTFLoaderTest.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';


class TestSelectionMaterial {
    constructor() {
        console.log("TestSelectionMaterial executed!");
        var scope = this;
        const width = window.innerWidth;
        const height = window.innerHeight;
    
        this.scene = new THREE.Scene();
        const boxGeometry = new THREE.BoxGeometry(30, 30, 30);
        const sphereGeometry = new THREE.SphereGeometry(20,30,30);
        const circleGeometry = new THREE.CircleGeometry(10);
    
        circleGeometry.translate(20, 40, 0);
        sphereGeometry.translate(0, -40, 30);

        const phongMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            side: THREE.DoubleSide,
            shininess: 20,
            specular: 0x444444, 
        });

        const mergedGeometry = 
        mergeGeometries([boxGeometry, sphereGeometry, circleGeometry], false);

        console.log(mergedGeometry);

        this.mesh = new THREE.Mesh(boxGeometry, phongMaterial);
        this.mesh.position.set(0, 0, 0);

        const axesHelper = new THREE.AxesHelper(150);

        // Light source
        const directionalLight = new THREE.DirectionalLight(0xffffffff, 3.0);
        directionalLight.position.set(0.0, 60, 40);
        directionalLight.target = this.mesh;
        const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 1.0, 0xff0000);
        // directionalLight.rotateOnAxis(new THREE.Vector3(1.0, 0.0, 0.0), THREE.MathUtils.degToRad(45));

        const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);

        this.scene.add(axesHelper);
        this.scene.add(this.mesh);
        this.scene.add(ambientLight);
        this.scene.add(directionalLight);
        this.scene.add(directionalLightHelper);

        this.camera = new THREE.PerspectiveCamera(30, width / height, 1, 3000);
        this.camera.position.set(200, 200, 200);
        this.camera.lookAt(this.mesh.position);

        console.log('查看当前屏幕设备像素比',window.devicePixelRatio);
        this.renderer = new THREE.WebGLRenderer( {antialias: true,} );
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setClearColor(0x444444, 1.0);

        const controls = new OrbitControls(this.camera, this.renderer.domElement);

        document.getElementById("webgl").appendChild(this.renderer.domElement);

        // Performance monitor
        this.stats = new Stats();
        document.body.appendChild(this.stats.domElement);
        // 0 - FPS
        // 1 - ms per frame
        this.stats.setMode(0);

        window.addEventListener(
            'resize', function() {
                // Resize
                scope.renderer.setSize(window.innerWidth, window.innerHeight);
    
                scope.camera.aspect = window.innerWidth / window.innerHeight;
                // By default, renderer will cache the camera's Projection matrix for rendering.
                // Once it's changed, we need to update the projection matrix.
                scope.camera.updateProjectionMatrix();
            }
        );

        this.AddSixFaceEnvMap();
    }

    /**
     * One way to add environment background to the scene.
     */
    AddSixFaceEnvMap() {
        const loader = new THREE.CubeTextureLoader();
        const texture = loader.load([
            './resources/0.jpeg',
            './resources/1.jpeg',
            './resources/2.jpeg',
            './resources/3.jpeg',
            './resources/4.jpeg',
            './resources/5.jpeg',
        ]);
        this.scene.background = texture;
    }

    getRenderer() {
        return this.renderer;
    }
    
    render() {
        this.stats.update();
        this.renderer.render(this.scene, this.camera); //Render
        this.mesh.rotateY(0.01);
    }

}

export {TestSelectionMaterial}
