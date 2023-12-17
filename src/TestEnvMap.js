// Stat.js
import Stats from '../threejs_r155/examples/jsm/libs/stats.module.js';
import { THREE, OrbitControls, GUI, mergeGeometries } from '../CommonImports.js'


class TestEnvMap {
    constructor() {
        console.log("TestEnvMap executed!");
        var scope = this;
        const width = window.innerWidth;
        const height = window.innerHeight;
    
        this.scene = new THREE.Scene();
        const boxGeometry = new THREE.BoxGeometry(30, 30, 30);
        const sphereGeometry = new THREE.SphereGeometry(20,30,30);
        const circleGeometry = new THREE.CircleGeometry(10);
    
        circleGeometry.translate(0, 20, 0);
        sphereGeometry.translate(0, -40, 0);

        const texLoader = new THREE.TextureLoader();
        const testImage = texLoader.load('../resources/checker.jpg');

        const phongMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            side: THREE.DoubleSide,
            shininess: 20,
            specular: 0x444444, 
        });

        
        // Occulusion query
        // https://raw.githack.com/simon-paris/three.js/occlusion-queries-with-build/examples/webgl_occlusionqueries.html

        const mergedGeometry = 
        mergeGeometries([boxGeometry, sphereGeometry, circleGeometry], false);

        console.log(mergedGeometry);

        this.mesh = new THREE.Mesh(mergedGeometry, phongMaterial);
        this.mesh.position.set(0, 0, 0);
        this.bgMesh = new THREE.Mesh(mergedGeometry, phongMaterial);

        const axesHelper = new THREE.AxesHelper(150);

        // Light source
        const pointLight = new THREE.PointLight(0xffffff, 100.0, 300, 1);
        pointLight.position.set(40, 40, 0);
        const pointLightHelper = new THREE.PointLightHelper(pointLight, 1.0, 0xff0000ff);

        const directionalLight = new THREE.DirectionalLight(0xffffffff, 3.0);
        directionalLight.position.set(0.0, 60, 40);
        directionalLight.target = this.mesh;
        const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 1.0, 0xff0000);
        // directionalLight.rotateOnAxis(new THREE.Vector3(1.0, 0.0, 0.0), THREE.MathUtils.degToRad(45));

        const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);

        this.scene.add(axesHelper);
        this.scene.add(this.mesh);
        this.scene.add(pointLight);
        this.scene.add(pointLightHelper);
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
        // We have a render loop -> no need a event listener.
        // controls.addEventListener(
        //     'change', function() {
        //         renderer.render(scene,camera);
        //     }
        // );

        document.getElementById("webgl").appendChild(this.renderer.domElement);

        // Performance monitor
        this.stats = new Stats();
        document.body.appendChild(this.stats.domElement);
        // 0 - FPS
        // 1 - ms per frame
        this.stats.setMode(0);

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
        geometryGUI.add(this.mesh.position, 'x', -100, 100).name('main object position X');
        geometryGUI.add(this.mesh.position, 'y', -100, 100).name('main object position Y');
        geometryGUI.add(this.mesh.position, 'z', -100, 100).name('main object position Z');

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

        this.AddBoxBackground(1000);
    }

    /**
     * Using a cube as a background geometry.
     * @param {number} size the size of the background mesh.
     */
    AddBoxBackground(size) {
        const boxGeometry = new THREE.BoxGeometry(size, size, size);
        const texLoader = new THREE.TextureLoader();
        const testbackGroundImage = texLoader.load('../resources/checker.jpg');


        const backgroundMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            side: THREE.BackSide,
            map: testbackGroundImage,
        });


        this.bgMesh = new THREE.Mesh(boxGeometry, backgroundMaterial);
        this.bgMesh.position.set(0, 0, 0);

        this.scene.add(this.bgMesh);
    }

    getRenderer() {
        return this.renderer;
    }
    
    render() {
        this.stats.update();
        this.bgMesh.position.copy(this.camera.position);
        this.renderer.render(this.scene, this.camera); //Render
        this.mesh.rotateY(0.01);
    }

}

export {TestEnvMap}
