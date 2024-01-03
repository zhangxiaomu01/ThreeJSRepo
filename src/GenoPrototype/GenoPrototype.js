import Stats from '../../threejs_r155/examples/jsm/libs/stats.module.js';
import { THREE, OrbitControls, GUI, RGBELoader, OBJLoader } from '../CommonImports.js';

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
    
        this.scene = new THREE.Scene();
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
            envMapIntensity: 2.0,
        }); 

        this.clusteredSphereMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xe2d200,
            transparent: false,
            opacity: 1.0,
            depthTest: true,
            metalness: 0.0,  
            roughness: 1.0,
            reflectivity: 0.0,
        }); 

        // load a resource
        this.addBaseObjects();
        this.addGenoSphereBlob(new THREE.Vector3(0.0, 90.0, 0.0));

        this.scene.add(this.baseObjectGroup);
        this.scene.add(this.filteredClusterGroup);

        const texLoader = new THREE.TextureLoader();
        const testImage = texLoader.load('../resources/checker.jpg');
        
        const axesHelper = new THREE.AxesHelper(150);

        // Light source
        const pointLight = new THREE.PointLight(0xffffff, 100.0, 300, 1);
        pointLight.position.set(40, 40, 0);
        const pointLightHelper = new THREE.PointLightHelper(pointLight, 1.0, 0xff0000ff);

        const directionalLight = new THREE.DirectionalLight(0xffffffff, 30.0);
        directionalLight.position.set(0.0, 60, 40);
        directionalLight.target = this.baseObjectGroup;
        const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 1.0, 0xff0000);
        // directionalLight.rotateOnAxis(new THREE.Vector3(1.0, 0.0, 0.0), THREE.MathUtils.degToRad(45));

        const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);

        this.scene.add(axesHelper);
        this.scene.add(pointLight);
        this.scene.add(pointLightHelper);
        this.scene.add(ambientLight);
        this.scene.add(directionalLight);
        this.scene.add(directionalLightHelper);

        this.camera = new THREE.PerspectiveCamera(30, width / height, 1, 3000);
        this.camera.position.set(20, 20, 20);
        this.camera.lookAt(this.baseObjectGroup.position);

        this.renderer = new THREE.WebGLRenderer( {antialias: true,} );
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setClearColor(0x000000, 1.0);

        const controls = new OrbitControls(this.camera, this.renderer.domElement);
        document.getElementById("webgl").appendChild(this.renderer.domElement);

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
        this.stats.update();
        this.renderer.render(this.scene, this.camera); //Render
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

    addGenoSphereBlob(newCenter) {
        var scope = this;
        const baseMeshPath = './resources/GenoPrototype/GenoSphereTopMesh.obj';
        this.objLoader.load(
            // resource URL
            baseMeshPath,
            // called when resource is loaded
            function ( object ) {
                
                const instancedMesh = new THREE.InstancedMesh(
                    object.children[0].geometry,
                    scope.clusteredSphereMaterial,
                    1000);

                
                for (let ii = 0; ii < 1000; ++ii) {
                    const dummy = new THREE.Object3D();
                    while (dummy.position.length() < 15 || dummy.position.length() > 21) {
                        dummy.position.x = Math.random() * 44 - 22;
                        dummy.position.y = Math.random() * 44 - 22;
                        dummy.position.z = Math.random() * 44 - 22;

                        dummy.scale.x = dummy.scale.y = dummy.scale.z = Math.random();
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