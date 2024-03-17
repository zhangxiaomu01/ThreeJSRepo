// Stat.js
import Stats from '../../../threejs_r155/examples/jsm/libs/stats.module.js';
import { THREE, OrbitControls, GUI, mergeGeometries } from '../../CommonImports.js'


const gridSize = 1;
const gridNumber = 32;
const offSet = gridSize / 2;

class IntersectionTest {

    constructor() {
        console.log("IntersectionTest executed!");
        var scope = this;
        this._this = this;
        const width = window.innerWidth;
        const height = window.innerHeight;
    
        this.scene = new THREE.Scene();
        const boxGeometry = new THREE.BoxGeometry(gridSize, gridSize, gridSize);

        const phongMaterial = new THREE.MeshBasicMaterial({
            color: 0x0000ff,
            wireframe: true,
        });

        this.mesh = new THREE.Mesh(boxGeometry, phongMaterial);
        this.mesh.position.set(offSet, offSet, offSet);

        const axesHelper = new THREE.AxesHelper(150);

        // Light source
        const pointLight = new THREE.PointLight(0xffffff, 100.0, 300, 1);
        pointLight.position.set(40, 40, 0);
        const pointLightHelper = new THREE.PointLightHelper(pointLight, 1.0, 0xff0000ff);

        const directionalLight = new THREE.DirectionalLight(0xffffffff, 3.0);
        directionalLight.position.set(0.0, 60, 40);
        directionalLight.target = this.mesh;
        const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 1.0, 0xff0000);

        const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);

        this.scene.add(axesHelper);
        // this.scene.add(this.mesh);
        this.scene.add(pointLight);
        // this.scene.add(pointLightHelper);
        this.scene.add(ambientLight);
        this.scene.add(directionalLight);
        // this.scene.add(directionalLightHelper);

        this.camera = new THREE.PerspectiveCamera(30, width / height, 1, 3000);
        this.camera.position.set(80, 80, 80);
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
        this.stats.setMode(1);

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

        this.testTriangleVoxel();

        // GUI
        const myGui = new GUI();
        myGui.domElement.style.right = '0px';
        myGui.domElement.style.width = '300px';
        myGui.open();
        const geometryGUI = myGui.addFolder('StartTest');
        geometryGUI.close();
        geometryGUI.add(this.mesh.position, 'x', -100, 100).name('main object position X');
        geometryGUI.add(this.mesh.position, 'y', -100, 100).name('main object position Y');
        geometryGUI.add(this.mesh.position, 'z', -100, 100).name('main object position Z');
    }

    getRenderer() {
        return this.renderer;
    }
    
    render() {
        this.stats.update();
        this.renderer.render(this.scene, this.camera); //Render
    }

    testTriangleVoxel() {
        console.log("This is just a test =============================");
        const triangle = new THREE.Triangle();
        const offSet = 20;

        // X projection - Right
        triangle.a.set(10, 0, 30);
        triangle.b.set(0, 0, 0);
        triangle.c.set(10, 40,  30);

        // triangle.a.set(10, 0, 30);
        // triangle.b.set(0, 0, 0);
        // triangle.c.set(10, 1,  30);

        // Y projection - Top
        // triangle.a.set(20, 20, 40);
        // triangle.b.set(0, 0, 0);
        // triangle.c.set(40, 0,  0);

        // Z projection - Front
        // triangle.a.set(-16 - basePt.x + offSet, 11  - basePt.y + offSet, 17  - basePt.z + offSet);
        // triangle.b.set(-32  - basePt.x + offSet, 32  - basePt.y + offSet, -8 - basePt.z + offSet);
        // triangle.c.set(-34  - basePt.x + offSet, 13  - basePt.y + offSet,  - basePt.z + offSet);

        // Z projection 2 - Front
        // triangle.a.set(20, 40, 20);
        // triangle.b.set(0, 0, 0);
        // triangle.c.set(40, 0,  0);

        //
        let minX = Math.min(triangle.a.x, triangle.b.x, triangle.c.x);
        let minY = Math.min(triangle.a.y, triangle.b.y, triangle.c.y);
        let minZ = Math.min(triangle.a.z, triangle.b.z, triangle.c.z);

        let maxX = Math.max(triangle.a.x, triangle.b.x, triangle.c.x);
        let maxY = Math.max(triangle.a.y, triangle.b.y, triangle.c.y);
        let maxZ = Math.max(triangle.a.z, triangle.b.z, triangle.c.z);

        this.renderProcessedTriangles(triangle);

        this.renderAuxiliaryObjects(true, false, false, gridSize);
    }

    renderProcessedTriangles(triangle) {
        let t = triangle;
        let geometry = new THREE.BufferGeometry();
        const vertices = new Float32Array(
            [
                t.a.x, t.a.y, t.a.z,
                t.b.x, t.b.y, t.b.z,
                t.c.x, t.c.y, t.c.z
            ]
        );
        geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
        let testTriangleMesh = new THREE.Mesh(
            geometry,
            new THREE.MeshBasicMaterial({
                color: 0xff0000,
                wireframe: true,
            })
        );
        // testTriangleMesh.position.set(_sceneBasePoint.x, _sceneBasePoint.y, _sceneBasePoint.z);
        this.scene.add(testTriangleMesh);
    }

    renderAuxiliaryObjects (shouldRenderBasePoint = true,
        shouldRenderBoundary = false,
        shouldRenderGrids = false,
        sceneGridSize,
        gridBoundary = [0, 0, 0, 32, 32, 32]) {
        if (shouldRenderBasePoint) {
            let startingPoint = new THREE.Mesh(
                new THREE.BoxGeometry(0.6, 0.6, 0.6),
                new THREE.MeshBasicMaterial({
                    color: 0xff0000,
                })
            );
            // startingPoint.position.set(_sceneBasePoint.x, _sceneBasePoint.y, _sceneBasePoint.z);
            this.scene.add(startingPoint);
        }

        if (shouldRenderBoundary) {
            // Render grid
            let startGridX = gridBoundary[0];
            let startGridY = gridBoundary[1];
            let startGridZ = gridBoundary[2];
            let endGridX = gridBoundary[3];
            let endGridY = gridBoundary[4];
            let endGridZ = gridBoundary[5];

            let totalNumberOfGridsX = endGridX - startGridX;
            let totalNumberOfGridsY = endGridY - startGridY;
            let totalNumberOfGridsZ = endGridZ - startGridZ;
            
            const boxGeometry = new THREE.BoxGeometry(
                totalNumberOfGridsX * sceneGridSize,
                totalNumberOfGridsY * sceneGridSize,
                totalNumberOfGridsZ * sceneGridSize
            );
            const object = new THREE.Mesh( boxGeometry, new THREE.MeshBasicMaterial( 0xff0000 ) );
            object.position.set(
                totalNumberOfGridsX / 2 * sceneGridSize,
                totalNumberOfGridsY / 2 * sceneGridSize,
                totalNumberOfGridsZ / 2 * sceneGridSize,
            );
            const box = new THREE.BoxHelper( object, 0xff00ff );
            this.scene.add(box);
        }

        if (shouldRenderGrids) {
            let halfGridSize = sceneGridSize / 2.0;
            // Render grid
            let startGridX = gridBoundary[0];
            let startGridY = gridBoundary[1];
            let startGridZ = gridBoundary[2];
            let endGridX = gridBoundary[3];
            let endGridY = gridBoundary[4];
            let endGridZ = gridBoundary[5];

            let totalNumberOfGridsX = endGridX - startGridX;
            let totalNumberOfGrids = totalNumberOfGridsX * (endGridY - startGridY) * (endGridZ - startGridZ);
            let totalNumberOfGrids2DXY = totalNumberOfGridsX * (endGridY - startGridY);
            let gridGeometry = new THREE.BoxGeometry(sceneGridSize, sceneGridSize, sceneGridSize);

            const newMaterial = new THREE.ShaderMaterial( {

                uniforms: { 
                    'thickness': { value: 0.3 }, 
                    'uTime': { value: 0.0 },
                },
                vertexShader: `
                attribute vec3 center;
                varying vec3 vCenter;
    
                flat varying float distanceMask;
    
                uniform float uTime;
    
                void main() {
    
                    vCenter = center;
    
                    float dx = position.x;
                    float dy = position.y;
                    float freq = sqrt(dx*dx + dy*dy);
                    distanceMask = max(1.0 - smoothstep(0.0, 65.0, freq), 0.0);
                    float currentPositionY = 3.0 * sin(0.25 * (uTime - freq)) 
                        + cos(0.9 * (uTime - freq) + position.y - position.x);
    
                    vec3 newPosition = vec3(position.x, position.y, position.z + currentPositionY);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );
    
                }
                `,
                fragmentShader: `
                uniform float thickness;
    
                varying vec3 vCenter;
                flat varying float distanceMask;
    
                void main() {
    
                    vec3 afwidth = fwidth( vCenter.xyz );
    
                    vec3 edge3 = smoothstep( ( thickness - 1.0 ) * afwidth, thickness * afwidth, vCenter.xyz );
    
                    float edge = 1.0 - min( min( edge3.x, edge3.y ), edge3.z );
    
                    gl_FragColor.rgb = gl_FrontFacing ? vec3( 0.145, 0.589, 0.745 ) : vec3( 0.114, 0.278, 0.341 );
                    gl_FragColor.a = edge * distanceMask * 0.4;
    
                }
                `,
                side: THREE.DoubleSide,
                transparent: true,
                wireframe: true,
                alphaToCoverage: true // only works when WebGLRenderer's "antialias" is set to "true"
    
            } );
            newMaterial.extensions.derivatives = true;

            let instancedMesh = new THREE.InstancedMesh(
                gridGeometry,
                new THREE.MeshBasicMaterial(
                    {
                        color: 0x0000ff,
                        wireframe: true
                    }
                ),
                totalNumberOfGrids
            );
            let transformMatrix = new THREE.Matrix4();
            let startPosX = halfGridSize + startGridX * sceneGridSize;
            let startPosY = halfGridSize + startGridY * sceneGridSize;
            let startPosZ = halfGridSize + startGridZ * sceneGridSize;

            let posX = startPosX;
            let posY = startPosY;
            let posZ = startPosZ;
            for (let ii = 0; ii < totalNumberOfGrids; ++ii) {
                transformMatrix = transformMatrix.setPosition(posX, posY, posZ);
                instancedMesh.setMatrixAt(ii, transformMatrix);
                if ((ii + 1) % totalNumberOfGrids2DXY == 0) {
                    posZ += sceneGridSize;
                    posX = startPosX;
                    posY = startPosY;
                } else if ((ii + 1) % totalNumberOfGridsX == 0) {
                    posY += sceneGridSize
                    posX = startPosX;
                } else {
                    posX += sceneGridSize;
                }
            }
            this.scene.add(
                instancedMesh
            );
        }
    }

};

export {IntersectionTest}


