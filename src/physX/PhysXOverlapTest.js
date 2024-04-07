
import { THREE, OrbitControls, GUI, FullScreenQuad } from '../CommonImports.js'
// Stat.js
import Stats from '../../threejs_r155/examples/jsm/libs/stats.module.js';

import { BackgroundManager } from '../Utils/BackgroundManager.js'
import { SelectionManager } from '../Utils/SelectionManager.js'

class PhysXOverlapTest {
    constructor() {
        console.log("PhysXOverlapTest executed!");
        var scope = this;
        const canvasWidth = window.innerWidth;
        const canvasHeight = window.innerHeight;
        const width = canvasWidth * window.devicePixelRatio;
        const height = canvasWidth * window.devicePixelRatio;
        console.log("device pixel ratio: " + window.devicePixelRatio);
    
        this.scene = new THREE.Scene();
        const boxGeometry = new THREE.BoxGeometry(30, 30, 30);
    
        this.defaultMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            side: THREE.DoubleSide,
            shininess: 20,
            specular: 0x444444, 
        });

        this.mesh = new THREE.Mesh(boxGeometry, this.defaultMaterial);
        this.mesh.position.set(0, 0, 0);

        // Light source
        const directionalLight = new THREE.DirectionalLight(0xffffffff, 3.0);
        directionalLight.position.set(0.0, 60, 40);
        directionalLight.target = this.mesh;
        const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 1.0, 0xff0000);
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);

        const axesHelper = new THREE.AxesHelper(150);

        this.scene.add(axesHelper);
        this.scene.add(this.mesh);
        this.scene.add(ambientLight);
        this.scene.add(directionalLight);
        this.scene.add(directionalLightHelper);

        this.camera = new THREE.PerspectiveCamera(30, canvasWidth / canvasHeight, 1, 3000);
        this.camera.position.set(200, 200, 200);
        this.camera.lookAt(this.mesh.position);

        // Sets the first render target for all non-selected meshes!
        let renderTargetParameters = {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat
        };
        this.renderNonSelectMeshesTarget = new THREE.WebGLRenderTarget(width, height, renderTargetParameters);

        this.outputPassMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            map: this.renderNonSelectMeshesTarget.texture,
            side: THREE.DoubleSide,
        });
        this.fsQuad = new FullScreenQuad(this.outputPassMaterial);

        // Renderer
        this.renderer = new THREE.WebGLRenderer( {antialias: true,} );
        this.renderer.setSize(canvasWidth, canvasHeight);
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
                let ratio = window.devicePixelRatio;
                // Resize
                scope.renderer.setSize(window.innerWidth, window.innerHeight);
    
                scope.camera.aspect = window.innerWidth / window.innerHeight;

                // By default, renderer will cache the camera's Projection matrix for rendering.
                // Once it's changed, we need to update the projection matrix.
                scope.camera.updateProjectionMatrix();

            }
        );

        BackgroundManager.AddSixFaceEnvMap(this.scene);
    }

    getRenderer() {
        return this.renderer;
    }
    
    render() {
        this.stats.update();
        this.mesh.rotateY(0.01);


        this.renderer.render(this.scene, this.camera); //Render
    }

}

export {PhysXOverlapTest}
