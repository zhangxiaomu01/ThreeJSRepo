import * as THREE from 'three';
// 扩展库OrbitControls.js
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// 扩展库GLTFLoader.js
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
// Stat.js
import Stats from 'three/addons/libs/stats.module.js';
import { GenerateTestData } from './GenerateTestData.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

const width = window.innerWidth;
const height = window.innerHeight;

const scene = new THREE.Scene();
const boxGeometry = new THREE.BoxGeometry(30, 30, 30);
const sphereGeometry = new THREE.SphereGeometry(20,30,30);
const circleGeometry = new THREE.CircleGeometry(10);

// MeshBasicMaterial不受光照影响
const material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
});

const transparentMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff, //设置材质颜色
    transparent:true,//开启透明
    opacity:0.5,//设置透明度
});

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

const mesh = new THREE.Mesh(boxGeometry, phongMaterial);
mesh.position.set(0, 0, 0);

const axesHelper = new THREE.AxesHelper(150);

// Light source
const pointLight = new THREE.PointLight(0xffffff, 100.0, 300, 1);
pointLight.position.set(40, 40, 0);
const pointLightHelper = new THREE.PointLightHelper(pointLight, 1.0, 0xff0000ff);

const directionalLight = new THREE.DirectionalLight(0xffffffff, 3.0);
directionalLight.position.set(0.0, 60, 40);
directionalLight.target = mesh;
const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 1.0, 0xff0000);
// directionalLight.rotateOnAxis(new THREE.Vector3(1.0, 0.0, 0.0), THREE.MathUtils.degToRad(45));

const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);

scene.add(axesHelper);
scene.add(mesh);
scene.add(pointLight);
scene.add(pointLightHelper);
scene.add(ambientLight);
scene.add(directionalLight);
scene.add(directionalLightHelper);

GenerateTestData.GenerateBox(2, scene);

const camera = new THREE.PerspectiveCamera(30, width / height, 1, 3000);
camera.position.set(200, 200, 200);
camera.lookAt(mesh.position);

console.log('查看当前屏幕设备像素比',window.devicePixelRatio);
const renderer = new THREE.WebGLRenderer( {antialias: true,} );
renderer.setSize(width, height);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0x444444, 1.0);

const controls = new OrbitControls(camera, renderer.domElement);
// We have a render loop -> no need a event listener.
// controls.addEventListener(
//     'change', function() {
//         renderer.render(scene,camera);
//     }
// );

document.getElementById("webgl").appendChild(renderer.domElement);

// Performance monitor
const stats = new Stats();
document.body.appendChild(stats.domElement);
// 0 - FPS
// 1 - ms per frame
stats.setMode(1);

const clock = new THREE.Clock();
function render() {
    // const spt = clock.getDelta() * 1000; // ms
    // console.log("Time between two frames: ", spt);
    // console.log("FPS: ", 1000 / spt);

    stats.update();
    renderer.render(scene, camera); //Render
    mesh.rotateY(0.01);
    requestAnimationFrame(render);
}

window.addEventListener(
    'resize', function() {
        // Resize
        renderer.setSize(window.innerWidth, window.innerHeight);

        camera.aspect = window.innerWidth / window.innerHeight;
        // By default, renderer will cache the camera's Projection matrix for rendering.
        // Once it's changed, we need to update the projection matrix.
        camera.updateProjectionMatrix();
    }
);

// window.onresize = function () {
//     // Resize
//     render.setSize(window.innerWidth, window.innerHeight);

//     camera.aspect = window.innerWidth / window.innerHeight;
//     // By default, renderer will cache the camera's Projection matrix for rendering.
//     // Once it's changed, we need to update the projection matrix.
//     camera.updateProjectionMatrix();
// };

// GUI
const myGui = new GUI();
myGui.domElement.style.right = '0px';
myGui.domElement.style.width = '300px';
// console.log(mesh);
const geometryGUI = myGui.addFolder('Geometry');
geometryGUI.close();
geometryGUI.add(mesh.position, 'x', -100, 100).name('main object position X');
geometryGUI.add(mesh.position, 'y', -100, 100).name('main object position Y');
geometryGUI.add(mesh.position, 'z', -100, 100).name('main object position Z');

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

render();
