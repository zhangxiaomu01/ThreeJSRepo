import * as THREE from 'three';
// 扩展库OrbitControls.js
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// 扩展库GLTFLoader.js
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const width = 800;
const height = 600;

const scene = new THREE.Scene();
const geometry = new THREE.BoxGeometry(30, 30, 30);

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
});

const mesh = new THREE.Mesh(geometry, phongMaterial);
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

const camera = new THREE.PerspectiveCamera(30, width / height, 1, 3000);
camera.position.set(200, 200, 200);
camera.lookAt(mesh.position);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);

const controls = new OrbitControls(camera, renderer.domElement);
controls.addEventListener(
    'change', function() {
        renderer.render(scene,camera);
    }
);

document.getElementById("webgl").appendChild(renderer.domElement);
