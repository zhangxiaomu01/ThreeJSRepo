
import * as THREE from 'three';
// 扩展库OrbitControls.js
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';;
// Stat.js
import Stats from 'three/addons/libs/stats.module.js';
import { BackgroundManager } from './Utils/BackgroundManager.js'
import { SelectionManager } from './Utils/SelectionManager.js'


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

        this.defaultMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            side: THREE.DoubleSide,
            shininess: 20,
            specular: 0x444444, 
        });

        this.selectedMaterial = new THREE.MeshPhongMaterial({
            color: 0xffff00,
            side: THREE.DoubleSide,
            shininess: 20,
            specular: 0x444444, 
        });

        this.mesh = new THREE.Mesh(boxGeometry, this.defaultMaterial);
        this.mesh1 = new THREE.Mesh(sphereGeometry, this.defaultMaterial);
        this.mesh2 = new THREE.Mesh(circleGeometry, this.defaultMaterial);
        this.mesh.position.set(0, 0, 0);
        this.mesh1.position.set(30, 0, -30);
        this.mesh2.position.set(-30, 25, -30);

        const axesHelper = new THREE.AxesHelper(150);

        // Light source
        const directionalLight = new THREE.DirectionalLight(0xffffffff, 3.0);
        directionalLight.position.set(0.0, 60, 40);
        directionalLight.target = this.mesh;
        const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 1.0, 0xff0000);
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);

        this.scene.add(axesHelper);
        this.scene.add(this.mesh);
        this.scene.add(this.mesh1);
        this.scene.add(this.mesh2);
        this.scene.add(ambientLight);
        this.scene.add(directionalLight);
        this.scene.add(directionalLightHelper);

        this.camera = new THREE.PerspectiveCamera(30, width / height, 1, 3000);
        this.camera.position.set(200, 200, 200);
        this.camera.lookAt(this.mesh.position);

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

        this.onPointerDown = this.onPointerDown.bind(this);
        window.addEventListener( 'pointerdown', this.onPointerDown );

        this.selectedMesh = null;

        // Another way to register an event while accessing the correct 'this' context!
        // window.addEventListener( 'pointerdown', () => { /* ... */} );

        BackgroundManager.AddSixFaceEnvMap(this.scene);
    }

    getRenderer() {
        return this.renderer;
    }
    
    render() {
        this.stats.update();
        this.renderer.render(this.scene, this.camera); //Render
        this.mesh.rotateY(0.01);
    }

    onPointerDown(event) {
        let scope = this;
        SelectionManager.onPointerDown(event, this.scene, this.camera, function (object) {
            if (object && object instanceof THREE.Mesh) {
                object.material = scope.selectedMaterial;
                scope.selectedMesh = object;
            } else if (scope.selectedMesh) {
                scope.selectedMesh.material = scope.defaultMaterial;
                scope.selectedMesh = null;
            }
        });
    }

}

export {TestSelectionMaterial}
