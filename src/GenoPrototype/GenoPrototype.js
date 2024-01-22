import { PlaneGeometry } from '../../threejs_r155/build/three.module.js';
import Stats from '../../threejs_r155/examples/jsm/libs/stats.module.js';
import { THREE, OrbitControls, GUI, RGBELoader, OBJLoader } from '../CommonImports.js';
import { GenoParticle } from './GenoParticle.js'

/**
 * A class which provides the entry for the geno proto type demo.
 */
class GenoPrototype {
    constructor() {
        console.log("GenoPrototype executed!");
        var scope = this;
        this._this = this;
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.baseObjectGroup = new THREE.Group();
        this.filteredClusterGroup = new THREE.Group();

        // instantiate a loader
        this.objLoader = new OBJLoader();

        const hdrEquirect = new RGBELoader().load(
            "./resources/GenoPrototype/Warehouse-with-lights_BlackGround.hdr",  
            () => { 
              hdrEquirect.mapping = THREE.EquirectangularReflectionMapping; 
            }
          );

        const hdrMap02 = new RGBELoader().load(
            "./resources/GenoPrototype/remmac_HDR_nightReflection.hdr",  
            () => { 
                hdrMap02.mapping = THREE.EquirectangularReflectionMapping; 
            }
        );
    
    
        this.scene = new THREE.Scene();
        this.scene.environment = hdrMap02;

        this.transparentMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.7,
            depthTest: true,
            metalness: 0.0,  
            roughness: 0,
            reflectivity: 1.0,
            transmission: 1, // Add transparency
            thickness: 0.0, // Add refraction!
            envMap: hdrEquirect,
            envMapIntensity: 6.0,
        }); 

        this.clusteredSphereMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xe2d200,
            transparent: false,
            opacity: 1.0,
            depthTest: true,
            metalness: 0.0,  
            roughness: 0.5,
            // sheen: 0.4,
            // sheenColor: 0xffffff,
            clearcoat: 0.8,
            clearcoatRoughness: 0.75,
            reflectivity: 0.6,
            envMap: hdrMap02,
            envMapIntensity: 0.02,
        }); 

        this.filteredLayerMaterial = new THREE.MeshBasicMaterial({
            color: 0x2596be,
            wireframe: true,
        });

        const filterLayerPosition = new THREE.Vector3(0.0, 50, 0.0);
        const orangeGeoSphereBlobPosition = new THREE.Vector3(0.0, 115.0, 10.0);
        const purpleGeoSphereBlobPosition = new THREE.Vector3(10.0, 110.0, -10.0);
        const redGeoSphereBlobPosition = new THREE.Vector3(-10.0, 110.0, -10.0);
        const orangeColor = new THREE.Color(1, 0.592, 0.259);
        const purpleColor = new THREE.Color(112 / 255.0, 11 / 255.0, 156 / 255.0);
        const redColor = new THREE.Color(0.969, 0.0, 0.176);

        // load a resource
        this.addBaseObjects();
        this.addFilterLayer(filterLayerPosition);
        this.addGenoSphereBlob(
            orangeGeoSphereBlobPosition, 
            this.clusteredSphereMaterial.clone(),
            orangeColor);
        this.addGenoSphereBlob(
            purpleGeoSphereBlobPosition, 
            this.clusteredSphereMaterial.clone(),
            purpleColor);
        this.addGenoSphereBlob(
            redGeoSphereBlobPosition, 
            this.clusteredSphereMaterial.clone(),
            redColor);

        this.scene.add(this.baseObjectGroup);
        this.scene.add(this.filteredClusterGroup);

        const texLoader = new THREE.TextureLoader();
        const testImage = texLoader.load('../resources/checker.jpg');
        
        const axesHelper = new THREE.AxesHelper(150);

        // Light source 
        const pointLight = new THREE.PointLight(0xffffff, 200.0, 300, 1);
        pointLight.position.set(0, 50, 0);
        const pointLightHelper = new THREE.PointLightHelper(pointLight, 1.0, 0xff0000ff);

        const directionalLight = new THREE.DirectionalLight(0xffffffff, 3.0);
        directionalLight.position.set(0.0, 60, 40);
        directionalLight.target = this.baseObjectGroup;
        const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 1.0, 0xff0000);
        // directionalLight.rotateOnAxis(new THREE.Vector3(1.0, 0.0, 0.0), THREE.MathUtils.degToRad(45));

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);


        let particleMesh = new THREE.Mesh(
            new THREE.SphereGeometry(10, 12, 12), 
            new THREE.MeshStandardMaterial({ color: new THREE.Color(0.5, 0.6, 0.3),
                  depthTest: true,
                  metalness: 0.1,  
                  roughness: 0.1,
                  reflectivity: 0.5}));

        particleMesh.position.y = 50;

        // this.scene.add(particleMesh);


        this.scene.add(axesHelper);
        this.scene.add(pointLight);
        this.scene.add(pointLightHelper);
        this.scene.add(ambientLight);
        // this.scene.add(directionalLight);
        // this.scene.add(directionalLightHelper);

        this.camera = new THREE.PerspectiveCamera(30, width / height, 1, 3000);
        this.camera.position.set(20, 20, 20);
        this.camera.lookAt(this.baseObjectGroup.position);

        this.renderer = new THREE.WebGLRenderer( {antialias: true,} );
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setClearColor(0x000000, 1.0);

        const controls = new OrbitControls(this.camera, this.renderer.domElement);
        document.getElementById("webgl").appendChild(this.renderer.domElement);

        // Particles
        this.particleSystem = new GenoParticle(
            this.scene, 
            this.camera, 
            this.renderer,
            {
                upParticleConfigs: {
                    upParticlePos: filterLayerPosition,
                    upParticleColors: [
                        orangeColor,
                        purpleColor,
                        redColor
                    ],
                    upParticleDirections: [
                        orangeGeoSphereBlobPosition.clone(),
                        purpleGeoSphereBlobPosition.clone(),
                        redGeoSphereBlobPosition.clone()
                    ]
                },
                
            });
        this.particleSystem.initScene();

        // Performance monitor
        this.stats = new Stats();
        document.body.appendChild(this.stats.domElement);
        // 0 - FPS
        // 1 - ms per frame
        this.stats.setMode(1);

        const clock = new THREE.Clock();

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
        // GUI
        const myGui = new GUI();
        myGui.domElement.style.right = '0px';
        myGui.domElement.style.width = '300px';
        const geometryGUI = myGui.addFolder('Geometry');
        geometryGUI.close();

        const lightGUI = myGui.addFolder('Light');
        lightGUI.add(pointLight, 'intensity', 0, 100)
            .name('point light intensity')
            .step(0.1).onChange(
                function (value) {
                    // Callback goes here
                    console.log('point light intensity is: ' + value);
                }
            );
        const pointLightColor = {
            color:0x00ffff,
        };
        // when color changes, the point light color will change!
        lightGUI.addColor(pointLightColor, 'color').onChange(function(value){
            pointLight.color.set(value);
        });
        lightGUI.add(pointLight.position, 'x', [-20, -10, 0, 10, 20])
        .name('point light position Z').onChange(
            function(value) {
                pointLight.position.x = value;
            }
        );
        lightGUI.add(pointLight.position, 'z', 
            {
                'first': -20,
                'second': 0,
                'third': 20,
            }).name('point light position Z').onChange(
            function(value) {
                pointLight.position.z = value;
            }
        );
    }

    render() {
        // Update shader uniform;
        if (this.filteredLayerMaterial.userData.shader 
            && this.filteredLayerMaterial.userData.shader.uniforms.uTime) {
            let previousTime = this.filteredLayerMaterial.userData.shader.uniforms.uTime.value;
            
            if (previousTime > 99999999.0) previousTime = 0.0;

            this.filteredLayerMaterial.userData.shader.uniforms.uTime.value = previousTime + 0.1;
        }

        // Update fps
        this.stats.update();
        this.particleSystem.render();
        this.renderer.render(this.scene, this.camera); // Render
    }

    addBaseObjects() {
        const baseMeshPath = './resources/GenoPrototype/BaseMesh.obj';
        const baseCupMeshPath = './resources/GenoPrototype/BaseCupsMesh.obj';
        const gap = 30;
        for(let ii = 0; ii < 3; ++ii) {
            for (let jj = 0; jj < 3; ++jj) {
                this.loadObj(
                    baseMeshPath, 
                    this.baseObjectGroup, 
                    new THREE.Vector3(gap * (ii - 1), 0, gap * (jj - 1)));
                this.loadObj(
                    baseCupMeshPath, 
                    this.baseObjectGroup, 
                    new THREE.Vector3(gap * (ii - 1), 0, gap * (jj - 1)));
            }
        }
    }

    addGenoSphereBlob(newCenter, material, newColor) {
        var scope = this;
        const baseMeshPath = './resources/GenoPrototype/GenoSphereTopMesh.obj';
        this.objLoader.load(
            // resource URL
            baseMeshPath,
            // called when resource is loaded
            function ( object ) {
                
                material.color = newColor;
                const instancedMesh = new THREE.InstancedMesh(
                    object.children[0].geometry,
                    material,
                    1000);
                
                const originalColor = newColor;
                
                for (let ii = 0; ii < 1000; ++ii) {
                    const dummy = new THREE.Object3D();
                    while (dummy.position.length() < 9 || dummy.position.length() > 12) {
                        dummy.position.x = Math.random() * 24 - 12;
                        dummy.position.y = Math.random() * 24 - 12;
                        dummy.position.z = Math.random() * 24 - 12;

                        dummy.scale.x = dummy.scale.y = dummy.scale.z = Math.random() * 0.7;
                    }
                    const newPos = new THREE.Vector3().copy(dummy.position);

                    const newQuaternion = new THREE.Quaternion().setFromUnitVectors(
                                            new THREE.Vector3(0, 1, 0),
                                            newPos.normalize());
                    dummy.applyQuaternion(newQuaternion);
                    dummy.position.set(dummy.position.x + newCenter.x, 
                        dummy.position.y + newCenter.y, 
                        dummy.position.z + newCenter.z);
                    
                    dummy.updateMatrix();
                    instancedMesh.setMatrixAt(ii, dummy.matrix);
                    
                    const randomColorShreshold = 0.75;
                    let randomColorR = Math.random();
                    let randomColorG = Math.random();
                    let randomColorB = Math.random();
                    if (randomColorR < randomColorShreshold) randomColorR = randomColorShreshold;
                    if (randomColorG < randomColorShreshold) randomColorG = randomColorShreshold;
                    if (randomColorB < randomColorShreshold) randomColorB = randomColorShreshold;
                    instancedMesh.setColorAt(ii, 
                        new THREE.Color( 
                            randomColorR * originalColor.r, 
                            randomColorG * originalColor.g, 
                            randomColorB * originalColor.b ));
                }

                console.log(instancedMesh);
                scope.filteredClusterGroup.children.push(instancedMesh);
            },
            // called when loading is in progresses
            function ( xhr ) {
                console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
            },
            // called when loading has errors
            function ( error ) {
                console.log( 'An error happened' );
                console.log(error);
            }
        );
    }

    addFilterLayer(newCenter) {

        const fileterLayerMat = new THREE.MeshBasicMaterial({
            color: 0x2596be,
            wireframe: true,
        });

        fileterLayerMat.onBeforeCompile = function ( shader ) {
            shader.uniforms.uTime = { value: 0.0 };

            console.log(shader.attributes);

            shader.vertexShader = `
            uniform float uTime;
            `
            + shader.vertexShader;

            shader.vertexShader = shader.vertexShader.replace(
                '#include <begin_vertex>',
                [
                    `
                    float dx = position.x;
                    float dy = position.y;
                    float freq = sqrt(dx*dx + dy*dy);
                    float currentPositionY = 2.8 * sin(0.25 * (uTime - freq));

                    vec3 transformed = vec3(position.x, position.y, position.z + currentPositionY);
                    `,
                ].join( '\n' )
            );

            shader.fragmentShader = shader.fragmentShader;
            fileterLayerMat.userData.shader = shader;
        };

        this.filteredLayerMaterial = fileterLayerMat;

        let middleMesh = new THREE.Mesh(
            new PlaneGeometry(100, 100, 50, 50),
            this.filteredLayerMaterial
        );
        
        middleMesh.position.set(newCenter.x, newCenter.y, newCenter.z);
        middleMesh.rotateX( Math.PI / 2 );
        
        this.scene.add(middleMesh);
    }

    loadObj(path, parentObject, newPosition = new THREE.Vector3(0, 0, 0)) {
        var scope = this;
        this.objLoader.load(
            // resource URL
            path,
            // called when resource is loaded
            function ( object ) {
                console.log(parentObject);
                if (object.children[0]) {
                    object.children[0].material = scope.transparentMaterial;
                    object.children[0].position.set(newPosition.x, newPosition.y, newPosition.z);
                }
                parentObject.children.push(object.children[0]);
            },
            // called when loading is in progresses
            function ( xhr ) {
                console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
            },
            // called when loading has errors
            function ( error ) {
                console.log( 'An error happened' );
                console.log(error);
            }
        );
    }

}

export {GenoPrototype}