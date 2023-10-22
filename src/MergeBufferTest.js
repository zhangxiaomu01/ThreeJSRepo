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
        const planeGeometry = new THREE.PlaneGeometry(10, 10);
    
        sphereGeometry.translate(0, -40, 0);

        let currentTexture = this.prepareRenderMatrices();
        let currentMatTexture = this.prepareRenderMaterialProperties();

        // MeshLambertMaterial受光照影响
        const lambertMaterial = new THREE.MeshLambertMaterial({
            color: 0xffffff,
            // map: currentTexture,
        });

        lambertMaterial.onBeforeCompile = function ( shader ) {

            shader.uniforms.newMatrix = { value: new THREE.Matrix4().makeTranslation(0.5, 30, 120) };
            shader.uniforms.uSpatialTexture = {type: 't', value: currentTexture};
            shader.uniforms.uTextureSize = {value: new THREE.Vector2(4, 3)},
            shader.uniforms.uMatTexture = {type: 't', value: currentMatTexture};

            console.log(shader.attributes);

            shader.vertexShader = `
            attribute float objectId;
            uniform mat4 newMatrix;
            uniform sampler2D uSpatialTexture;
            uniform vec2 uTextureSize;

            flat varying float vObjectId;
            `
            + shader.vertexShader;

            shader.vertexShader = shader.vertexShader.replace(
                '#include <begin_vertex>',
                [
                    `
                    vObjectId = objectId;

                    float vStep = 1.0 / uTextureSize.y;
                    float halfVStep = vStep * 0.5;

                    float textureSampleV = halfVStep + vStep * float(objectId);
                    float uStep = 1.0 / uTextureSize.x;
                    float halfUStep = uStep / 2.0;

                    vec4 col0   = texture2D(uSpatialTexture, vec2(uStep * 0. + halfUStep, textureSampleV));
                    vec4 col1   = texture2D(uSpatialTexture, vec2(uStep * 1. + halfUStep, textureSampleV));
                    vec4 col2   = texture2D(uSpatialTexture, vec2(uStep * 2. + halfUStep, textureSampleV));
                    vec4 col3   = texture2D(uSpatialTexture, vec2(uStep * 3. + halfUStep, textureSampleV));
                    mat4 usedMatrix = mat4(col0, col1, col2, col3);
                    vec3 transformed = vec3( usedMatrix * vec4(position, 1.0) );
                    `,
                ].join( '\n' )
            );

            shader.fragmentShader = `
            flat varying float vObjectId;

            uniform sampler2D uMatTexture;
            uniform vec2 uTextureSize;
            `
            + shader.fragmentShader;

            shader.fragmentShader = shader.fragmentShader.replace(
                'vec4 diffuseColor = vec4( diffuse, opacity );',
                [
                    `
                    float vStep = 1.0 / uTextureSize.y;
                    float halfVStep = vStep * 0.5;

                    float textureSampleV = halfVStep + vStep * float(vObjectId);
                    vec4 colorExtra   = texture2D(uMatTexture, vec2(0.5, textureSampleV));
                    vec4 diffuseColor = vec4( diffuse, opacity ) * colorExtra;
                    `,
                ].join( '\n' )
            );

            lambertMaterial.userData.shader = shader;

        };

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
                uSpatialTexture: {type: 't', value: currentTexture},
                uTextureSize: {value: new THREE.Vector2(4, 3)},
            },
            vertexShader:`
            attribute float objectId;

            uniform sampler2D uSpatialTexture;
            uniform vec2 uTextureSize;

            varying vec3 vNormal;

            void main()	{
                float vStep = 1.0 / uTextureSize.y;
                float halfVStep = vStep * 0.5;

                float textureSampleV = halfVStep + vStep * float(objectId);
                // if (gl_VertexID > 55) {
                //     textureSampleV = halfVStep + vStep;
                // } else if (gl_VertexID > 23) {
                //     textureSampleV = halfVStep + vStep * 2.0;
                // }

                float uStep = 1.0 / uTextureSize.x;
                float halfUStep = uStep / 2.0;

                vec4 col0    = texture2D(uSpatialTexture, vec2(uStep * 0. + halfUStep, textureSampleV));
                vec4 col1 = texture2D(uSpatialTexture, vec2(uStep * 1. + halfUStep, textureSampleV));
                vec4 col2   = texture2D(uSpatialTexture, vec2(uStep * 2. + halfUStep, textureSampleV));
                vec4 col3   = texture2D(uSpatialTexture, vec2(uStep * 3. + halfUStep, textureSampleV));
                mat4 usedMatrix = mat4(col0, col1, col2, col3);

                vNormal = vec3(usedMatrix * vec4(normal, 0));
                gl_Position = projectionMatrix * viewMatrix * usedMatrix * vec4( position, 1.0 );
            }
          `,
            fragmentShader: `
            uniform vec3 lightDir;
            uniform sampler2D uSpatialTexture;

            varying vec3 vNormal;

            void main()	{

                float lightCoeff = max(dot(vNormal, normalize(lightDir)), 0.0);
                vec3 color = vec3( 1.0, 1.0, 1.0 );
              
                gl_FragColor = vec4( lightCoeff * color + vec3(0.5) , 1.0 );      
            }
          `,
            side: THREE.DoubleSide,
            wireframe: false
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
        this.createObjectInfoAttribute(mergedGeometry, [36, 96, Infinity]);
        
        console.log(boxGeometry);
        console.log(boxGeometry1);
        console.log(sphereGeometry);
        console.log(mergedGeometry);

        mergedGeometry.drawRange.start = 0;
        // mergedGeometry.drawRange.count = 36;

        this.mesh = new THREE.Mesh(mergedGeometry, lambertMaterial);
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

    prepareRenderMatrices() {
        let data = [
            1,
            0,
            0,
            0,
            0,
            1,
            0,
            0,
            0,
            0,
            1,
            0,
            0.5,
            30,
            20,
            1,
            1,
            0,
            0,
            0,
            0,
            1,
            0,
            0,
            0,
            0,
            1,
            0,
            0.5,
            30,
            -40,
            1,
            1,
            0,
            0,
            0,
            0,
            1,
            0,
            0,
            0,
            0,
            1,
            0,
            0,
            -10,
            0,
            1,
        ];
        let dataArray = new Float32Array(data);
        let tex = new THREE.DataTexture(dataArray, 4, 3, THREE.RGBAFormat, THREE.FloatType);
        tex.magFilter = THREE.NearestFilter;
        tex.needsUpdate = true;
        return tex;
    }

    prepareRenderMaterialProperties() {
        let data = [
            0.5,
            0.5,
            0,
            1.0,
            0.0,
            0.1,
            1,
            1.0,
            0,
            1,
            0,
            1
        ];
        let dataArray = new Float32Array(data);
        let tex = new THREE.DataTexture(dataArray, 1, 3, THREE.RGBAFormat, THREE.FloatType);
        tex.magFilter = THREE.NearestFilter;
        tex.needsUpdate = true;
        return tex;
    }

    createObjectInfoAttribute(geometry, level) {
        if (!geometry.index || !geometry.index.array) return;
        let data = new Map();
        let levelIndex = 0;
        for (let ii = 0, count = geometry.index.array.length; ii < count; ++ii) {
            if (ii >= level[levelIndex]) {
                levelIndex++;
            }
            data.set(geometry.index.array[ii], levelIndex);
        }
        let dataArray = new Array(data.length);
        data.forEach(function(value, key) {
            dataArray[key] = value;
        });

        geometry.setAttribute("objectId", new THREE.BufferAttribute(new Float32Array(dataArray), 1));
        return geometry;
    }
    
    render() {
        this.stats.update();
        this.renderer.render(this.scene, this.camera); //Render
        // this.mesh.rotateY(0.01);
    }

};

export {MergeBufferTest}


