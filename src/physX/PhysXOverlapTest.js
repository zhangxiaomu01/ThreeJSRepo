
import { THREE, OrbitControls, GUI, FullScreenQuad } from '../CommonImports.js'
// Stat.js
import Stats from '../../threejs_r155/examples/jsm/libs/stats.module.js';

import PhysX from './physx-js-webidl.js';

import { BackgroundManager } from '../Utils/BackgroundManager.js'

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

        // document.getElementById("webgl").appendChild(this.renderer.domElement);

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

    testPhysX() {
        PhysX().then(function(PhysX) {
            var version = PhysX.PHYSICS_VERSION;
            console.log('PhysX loaded! Version: ' + ((version >> 24) & 0xff) + '.' + ((version >> 16) & 0xff) + '.' + ((version >> 8) & 0xff));

            var allocator = new PhysX.PxDefaultAllocator();
            var errorCb = new PhysX.PxDefaultErrorCallback();
            var foundation = PhysX.CreateFoundation(version, allocator, errorCb);
            console.log('Created PxFoundation');

            var tolerances = new PhysX.PxTolerancesScale();
            var physics = PhysX.CreatePhysics(version, foundation, tolerances);
            console.log('Created PxPhysics');

            // create scene
            var tmpVec = new PhysX.PxVec3(0, -9.81, 0);
            var sceneDesc = new PhysX.PxSceneDesc(tolerances);
            sceneDesc.set_gravity(tmpVec);
            sceneDesc.set_cpuDispatcher(PhysX.DefaultCpuDispatcherCreate(0));
            sceneDesc.set_filterShader(PhysX.DefaultFilterShader());
            var scene = physics.createScene(sceneDesc);
            console.log('Created scene');

            // create a default material
            var material = physics.createMaterial(0.5, 0.5, 0.5);
            // create default simulation shape flags
            var shapeFlags = new PhysX.PxShapeFlags(PhysX.PxShapeFlagEnum.eSCENE_QUERY_SHAPE | PhysX.PxShapeFlagEnum.eSIMULATION_SHAPE |  PhysX.PxShapeFlagEnum.eVISUALIZATION);

            // create a few temporary objects used during setup
            var tmpPose = new PhysX.PxTransform(PhysX.PxIDENTITYEnum.PxIdentity);
            var tmpFilterData = new PhysX.PxFilterData(1, 1, 0, 0);

            // create a large static box with size 20x1x20 as ground
            var groundGeometry = new PhysX.PxBoxGeometry(10, 0.5, 10);   // PxBoxGeometry uses half-sizes
            var groundShape = physics.createShape(groundGeometry, material, true, shapeFlags);
            var ground = physics.createRigidStatic(tmpPose);
            groundShape.setSimulationFilterData(tmpFilterData);
            ground.attachShape(groundShape);
            scene.addActor(ground);

            // create a few dynamic boxes with size 1x1x1, which will fall on the ground
            var boxGeometry = new PhysX.PxBoxGeometry(0.5, 0.5, 0.5);   // PxBoxGeometry uses half-sizes
            var lastBox = null;
            for (var y = 0; y < 10; y++) {
                tmpVec.set_x(0); tmpVec.set_y(y*2 + 5); tmpVec.set_z(0);
                tmpPose.set_p(tmpVec);
                var boxShape = physics.createShape(boxGeometry, material, true, shapeFlags);
                var box = physics.createRigidDynamic(tmpPose);
                boxShape.setSimulationFilterData(tmpFilterData);
                box.attachShape(boxShape);
                scene.addActor(box);
                lastBox = box;
            }

            // clean up temp objects
            PhysX.destroy(groundGeometry);
            PhysX.destroy(boxGeometry);
            PhysX.destroy(tmpFilterData);
            PhysX.destroy(tmpPose);
            PhysX.destroy(tmpVec);
            PhysX.destroy(shapeFlags);
            PhysX.destroy(sceneDesc);
            PhysX.destroy(tolerances);
            console.log('Created scene objects');

            // setup debug drawing stuff
            const { mat4, vec4, vec3 } = glMatrix;
            const viewMatrix = mat4.create();
            const projectionMatrix = mat4.create();
            const viewProjectionMatrix = mat4.create();
            const tmpVec4 = vec4.create();

            const canvas = document.querySelector('canvas');
            // console.log(canvas);
            const context = canvas.getContext('2d');
            console.log(context);
            setupDebugDrawer(PhysX, scene);

            // simulate forever!
            simulationLoop();

            function setupDebugDrawer() {
                canvas.width = canvas.clientWidth;
                canvas.height = canvas.clientHeight;

                // compute projection matrix
                mat4.lookAt(viewMatrix, [12, 15, 20], [0, 0, 0], [0, 1, 0])
                mat4.perspective(projectionMatrix, 45 * (Math.PI / 180), canvas.width / canvas.height, 0.01, 75);
                mat4.multiply(viewProjectionMatrix, projectionMatrix, viewMatrix);

                // setup debug drawer
                const context = canvas.getContext('2d');
                scene.setVisualizationParameter(PhysX.eSCALE, 1);
                scene.setVisualizationParameter(PhysX.eWORLD_AXES, 1);
                scene.setVisualizationParameter(PhysX.eACTOR_AXES, 1);
                scene.setVisualizationParameter(PhysX.eCOLLISION_SHAPES, 1);
            }

            function simulationLoop() {
                let lastFrame = 0;
                requestAnimationFrame(function loop(hrTime) {
                    var timeStep = Math.min(0.03, (hrTime - lastFrame) / 1000);
                    scene.simulate(timeStep);
                    scene.fetchResults(true);

                    // use debug drawer interface to draw boxes on a canvas.
                    // in a real world application you would query the box poses and update your graphics boxes accordingly
                    debugDraw(scene);
                    
                    var lastBoxPos = lastBox.getGlobalPose().get_p();
                    console.log('Last box position: ' + lastBoxPos.get_x() + ", " + lastBoxPos.get_y() + ", " + lastBoxPos.get_z());

                    lastFrame = hrTime;
                    requestAnimationFrame(loop);
                });
            }

            function project(x, y, z) {
                const result = vec4.transformMat4(tmpVec4, [x, y, z, 1], viewProjectionMatrix);
                const clipX = (result[0] / result[3]);
                const clipY = (result[1] / result[3]);
                return [(canvas.width / 2) * (1 + clipX), (canvas.height / 2) * (1 - clipY)];
            }

            function drawLine(from, to, color) {
                const [r, g, b] = color;

                // const context = canvas.getContext('2d');
                // console.log(canvas);
                // console.log(context);

                context.beginPath();
                context.strokeStyle = `rgb(${255 * r}, ${255 * g}, ${255 * b})`;
                context.moveTo(...from);
                context.lineTo(...to);
                context.stroke();
            }

            function debugDraw() {
                canvas.width = canvas.width;    // clears the canvas

                const rb = scene.getRenderBuffer();
                for(let i = 0; i < rb.getNbLines(); i++) {
                    const line = PhysX.NativeArrayHelpers.prototype.getDebugLineAt(rb.getLines(), i);
                    const from = project(line.pos0.get_x(), line.pos0.get_y(), line.pos0.get_z());
                    const to   = project(line.pos1.get_x(), line.pos1.get_y(), line.pos1.get_z());
                    drawLine(from, to, colors[line.get_color0()]);
                }
            }

            const colors = {
                [PhysX.PxDebugColorEnum.eARGB_BLACK]:     [  0,   0,   0],
                [PhysX.PxDebugColorEnum.eARGB_RED]:       [  1,   0,   0],
                [PhysX.PxDebugColorEnum.eARGB_GREEN]:     [  0,   1,   0],
                [PhysX.PxDebugColorEnum.eARGB_BLUE]:      [  0,   0,   1],
                [PhysX.PxDebugColorEnum.eARGB_YELLOW]:    [  1,   1,   0],
                [PhysX.PxDebugColorEnum.eARGB_MAGENTA]:   [  1,   0,   1],
                [PhysX.PxDebugColorEnum.eARGB_CYAN]:      [  0,   1,   1],
                [PhysX.PxDebugColorEnum.eARGB_WHITE]:     [  1,   1,   1],
                [PhysX.PxDebugColorEnum.eARGB_GREY]:      [0.5, 0.5, 0.5],
                [PhysX.PxDebugColorEnum.eARGB_DARKRED]:   [0.5,   0,   0],
                [PhysX.PxDebugColorEnum.eARGB_DARKGREEN]: [  0, 0.5,   0],
                [PhysX.PxDebugColorEnum.eARGB_DARKBLUE]:  [  0,   0, 0.5],
            };
        });
    }

}

export {PhysXOverlapTest}
