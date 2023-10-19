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
import { interleaveAttributes } from 'three/addons/utils/BufferGeometryUtils.js';

class MergeBufferTest {

    constructor() {
        console.log("MergeBufferTest executed!");
        var scope = this;
        this._this = this;
        const width = window.innerWidth;
        const height = window.innerHeight;

        const directionLightPos = new THREE.Vector3(0.0, 60, 40);
        var meshPos = new THREE.Vector3(0, 0, 0);
        var translation1 = new THREE.Vector3(0, 0, 0);
    
        this.scene = new THREE.Scene();
        const boxGeometry = new THREE.BoxGeometry(30, 30, 30);
        const boxGeometry1 = new THREE.BoxGeometry(20, 20, 10, 2);
        const sphereGeometry = new THREE.SphereGeometry(20,5,5);
        const circleGeometry = new THREE.CircleGeometry(10);
    
        circleGeometry.translate(0, 40, 0);
        sphereGeometry.translate(0, -40, 0);

        // MeshLambertMaterial受光照影响
        const lambertMaterial = new THREE.MeshLambertMaterial({
            color: 0xffffff,
        });

        const phongMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            side: THREE.DoubleSide,
            shininess: 20,
            specular: 0x444444, 
        });

        var customMaterial = new THREE.ShaderMaterial({
            uniforms: {
                customMat1: {
                  value: new THREE.Matrix4()
                },
                customMat2: {
                    value: new THREE.Matrix4()
                },
                lightDir: {
                    value: new THREE.Vector3()
                },
            },
            vertexShader:`
            uniform mat4 customMat1;
            uniform mat4 customMat2;

            varying vec3 vNormal;

            void main()	{
                mat4 usedMatrix = mat4(1.0);

                if (gl_VertexID > 55) {
                    usedMatrix = customMat2;
                } else if (gl_VertexID > 23) {
                    usedMatrix = customMat1;
                }

                vNormal = vec3(usedMatrix * vec4(normal, 0));
                gl_Position = projectionMatrix * viewMatrix * usedMatrix * vec4( position, 1.0 );
            }
          `,
            fragmentShader: `
            uniform vec3 lightDir;

            varying vec3 vNormal;

            void main()	{

                float lightCoeff = max(dot(vNormal, normalize(lightDir)), 0.0);
                vec3 color = vec3( 1.0, 1.0, 1.0 );
              
                gl_FragColor = vec4( lightCoeff * color + vec3(0.5) , 1.0 );
      
            }
          `,
            side: THREE.FrontSide,
            wireframe: true
          });

        customMaterial.uniforms.customMat1.value.makeTranslation( 0.5, 30, 20 );
        customMaterial.uniforms.customMat2.value.makeTranslation( 0.5, 30, -40 );
        customMaterial.uniforms.lightDir.value.copy( directionLightPos );

        /**
         * Box draw range [0, 36] Sphere [37, ]
         */
        const mergedGeometry = 
            mergeGeometries([boxGeometry, boxGeometry1, sphereGeometry], false);
        
        let res = this.interleaveGeometryAttributes(mergedGeometry);
        // res = this.interleaveGeometryAttributes(boxGeometry);

        console.log(boxGeometry);
        console.log(boxGeometry1);
        console.log(sphereGeometry);
        console.log(mergedGeometry);

        mergedGeometry.drawRange.start = 0;
        // mergedGeometry.drawRange.count = 36;

        this.mesh = new THREE.Mesh(mergedGeometry, customMaterial);
        this.mesh.position.copy(meshPos);


        /// Util
        const axesHelper = new THREE.AxesHelper(150);


        /// Lights
        const directionalLight = new THREE.DirectionalLight(0xffffffff, 3.0);
        directionalLight.position.copy(directionLightPos);
        directionalLight.target = this.mesh;

        const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);

        this.scene.add(axesHelper);
        this.scene.add(this.mesh);
        this.scene.add(ambientLight);
        this.scene.add(directionalLight);


        /// Camera
        this.camera = new THREE.PerspectiveCamera(30, width / height, 1, 3000);
        this.camera.position.set(160, 160, 160);
        this.camera.lookAt(this.mesh.position);


        /// Renderer
        this.renderer = new THREE.WebGLRenderer( {antialias: true,} );
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setClearColor(0x444444, 1.0);
        document.getElementById("webgl").appendChild(this.renderer.domElement);

        const controls = new OrbitControls(this.camera, this.renderer.domElement);


        /// Performance monitor
        this.stats = new Stats();
        document.body.appendChild(this.stats.domElement);
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


        /// GUI
        const myGui = new GUI();
        myGui.domElement.style.right = '0px';
        myGui.domElement.style.width = '300px';
        const geometryGUI = myGui.addFolder('Geometry');
        geometryGUI.close();
        geometryGUI.add(this.mesh.position, 'x', -100, 100).name('main object position X');
        geometryGUI.add(this.mesh.position, 'y', -100, 100).name('main object position Y');
        geometryGUI.add(this.mesh.position, 'z', -100, 100).name('main object position Z');
    }

    interleaveGeometryAttributes(geometry) {
        let res = interleaveAttributes([geometry.attributes.position,
            geometry.attributes.normal,
            geometry.attributes.uv]);

        geometry.attributes.position = res[0];
        geometry.attributes.normal = res[1];
        geometry.attributes.uv = res[2];
        return geometry
    }
    
    render() {
        this.stats.update();
        this.renderer.render(this.scene, this.camera); //Render
        this.mesh.rotateY(0.01);
    }

};

export {MergeBufferTest}


