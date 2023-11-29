
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
        const torusKnotGeometry = new THREE.TorusKnotGeometry( 10, 3, 100, 16 );
    
        this.defaultMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            side: THREE.DoubleSide,
            shininess: 20,
            specular: 0x444444, 
        });
        
        this.darkMaterial = new THREE.MeshPhongMaterial({
            color: 0x252525,
            side: THREE.DoubleSide,
            shininess: 20,
            specular: 0x444444, 
        });

        this.redMaterial = new THREE.MeshPhongMaterial({
            color: 0xff0000,
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
        this.mesh1 = new THREE.Mesh(sphereGeometry, this.darkMaterial);
        this.mesh2 = new THREE.Mesh(boxGeometry, this.darkMaterial);
        this.mesh3 = new THREE.Mesh(torusKnotGeometry, this.redMaterial);
        this.mesh.position.set(0, 0, 0);
        this.mesh1.position.set(30, 0, -30);
        this.mesh2.position.set(-60, 45, -60);
        this.mesh2.scale.set(2, 2, 2);
        this.mesh3.position.set(-65, 0, 40);
        this.mesh3.scale.set(2, 2, 2);

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
        this.scene.add(this.mesh3);
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

        this.onLeftMouseClick = this.onLeftMouseClick.bind(this);
        window.addEventListener( 'click', this.onLeftMouseClick );

        this.selectedMesh = null;
        this.selectedMeshMat = null;

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

    onLeftMouseClick(event) {
        if (event.button !== 0) {
            return;
        }
        let scope = this;
        SelectionManager.onMouseClick(event, this.scene, this.camera, function (object) {
            if (scope.selectedMesh && scope.selectedMeshMat) {
                scope.selectedMesh.material = scope.selectedMeshMat;
                scope.selectedMesh = null;
                scope.selectedMeshMat = null;
            }
            
            if (object && object instanceof THREE.Mesh) {
                scope.selectedMeshMat = object.material;
                object.material = scope.selectedMaterial;
                scope.selectedMesh = object;
            }
        });
    }

}

export {TestSelectionMaterial}
