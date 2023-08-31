import * as THREE from 'three';
// 扩展库OrbitControls.js
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// 扩展库GLTFLoader.js
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const width = 800;
const height = 600;

const scene = new THREE.Scene();
const geometry = new THREE.BoxGeometry(100, 100, 100);

const material = new THREE.MeshBasicMaterial({
    color: 0xff0000,
});

const transparentMaterial = new THREE.MeshBasicMaterial({
    color: 0x0000ff, //设置材质颜色
    transparent:true,//开启透明
    opacity:0.5,//设置透明度
});

const mesh = new THREE.Mesh(geometry, material);
mesh.position.set(0, 10, 0);

const axesHelper = new THREE.AxesHelper(150);

scene.add(axesHelper);
scene.add(mesh);

const camera = new THREE.PerspectiveCamera(30, width / height, 1, 3000);
camera.position.set(200, 200, 200);
camera.lookAt(mesh.position);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);

renderer.render(scene,camera);

document.getElementById("webgl").appendChild(renderer.domElement);

// 浏览器控制台测试，是否引入成功
// console.log(THREE.Scene);
// console.log(OrbitControls);
// console.log(GLTFLoader);