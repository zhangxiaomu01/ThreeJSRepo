/**
 * Three.js r155 完整示例
 * 包含：2个球体、3个立方体，三点布光系统，以及完整的相机控制
 */

// 导入 Three.js 核心库和 OrbitControls
import * as THREE from '../threejs_r155/build/three.module.js';
import { OrbitControls } from '../threejs_r155/examples/jsm/controls/OrbitControls.js';
import ClipManager from './ClipManager.js';
import { ClippingPhongMaterial } from './ClippingPhongMaterial.js';

// 全局变量
let scene, camera, renderer, controls;
let objects = [];
let clipManager = null;
let sharedMaterial = null;

/**
 * 初始化场景
 */
function initScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
}

/**
 * 初始化相机
 */
function initCamera() {
    const aspect = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
    camera.position.set(15, 12, 15);
    camera.lookAt(0, 0, 0);
}

/**
 * 初始化渲染器
 */
function initRenderer() {
    renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    document.body.appendChild(renderer.domElement);
}

/**
 * 初始化 OrbitControls 相机控制器
 * - 左键拖动：旋转场景
 * - 右键拖动：平移场景
 * - 鼠标滚轮：缩放场景
 */
function initControls() {
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.screenSpacePanning = true;
    controls.minDistance = 5;
    controls.maxDistance = 50;
    controls.maxPolarAngle = Math.PI / 2 + 0.3;
}

/**
 * 创建三点布光系统
 * - 主光(Key Light)：主要照明
 * - 补光(Fill Light)：填充阴影
 * - 轮廓光(Back Light)：分离物体与背景
 */
function initLights() {
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(10, 15, 10);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 50;
    keyLight.shadow.camera.left = -20;
    keyLight.shadow.camera.right = 20;
    keyLight.shadow.camera.top = 20;
    keyLight.shadow.camera.bottom = -20;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x8899aa, 0.6);
    fillLight.position.set(-8, 8, -5);
    scene.add(fillLight);

    const backLight = new THREE.DirectionalLight(0xffffee, 0.5);
    backLight.position.set(0, 5, -15);
    scene.add(backLight);
}

/**
 * 检查两个物体是否重叠
 * @param {THREE.Vector3} pos1 - 物体1的位置
 * @param {number} size1 - 物体1的大小（半径或边长的一半）
 * @param {THREE.Vector3} pos2 - 物体2的位置
 * @param {number} size2 - 物体2的大小
 * @returns {boolean} - 是否重叠
 */
function checkOverlap(pos1, size1, pos2, size2) {
    const distance = pos1.distanceTo(pos2);
    const minDistance = size1 + size2 + 1;
    return distance < minDistance;
}

/**
 * 检查位置是否与现有物体重叠
 * @param {THREE.Vector3} position - 待检查的位置
 * @param {number} size - 物体大小
 * @returns {boolean} - 是否有重叠
 */
function isPositionValid(position, size) {
    for (const obj of objects) {
        const objSize = obj.userData.size || 1;
        if (checkOverlap(position, size, obj.position, objSize)) {
            return false;
        }
    }
    return true;
}

/**
 * 生成随机位置
 * @param {number} size - 物体大小
 * @returns {THREE.Vector3} - 有效位置
 */
function getRandomPosition(size) {
    let position;
    let attempts = 0;
    const maxAttempts = 100;
    
    do {
        position = new THREE.Vector3(
            (Math.random() - 0.5) * 14,
            size + 0.5,
            (Math.random() - 0.5) * 14
        );
        attempts++;
    } while (!isPositionValid(position, size) && attempts < maxAttempts);
    
    return position;
}

/**
 * 创建几何体
 * 2个球体 + 3个立方体，随机分布且互不重叠
 * 所有物体共享同一个材质实例
 */
function createGeometries() {
    sharedMaterial = new ClippingPhongMaterial({
        color: 0x808080,
        shininess: 60,
        specular: 0x444444,
        transparent: false
    });
    
    console.log('共享 ClippingPhongMaterial 已创建');

    for (let i = 0; i < 2; i++) {
        const radius = 1.2 + Math.random() * 0.5;
        const geometry = new THREE.SphereGeometry(radius, 32, 32);
        const sphere = new THREE.Mesh(geometry, sharedMaterial);
        
        const position = getRandomPosition(radius);
        sphere.position.copy(position);
        sphere.castShadow = true;
        sphere.receiveShadow = true;
        sphere.userData.size = radius;
        sphere.userData.type = 'sphere';
        sphere.userData.objectIndex = objects.length;
        
        objects.push(sphere);
        scene.add(sphere);
        
        console.log(`物体${objects.length} (球体) 创建于位置: (${position.x.toFixed(2)}, ${position.y.toFixed(2)}, ${position.z.toFixed(2)})`);
    }

    for (let i = 0; i < 3; i++) {
        const size = 1.5 + Math.random() * 0.5;
        const geometry = new THREE.BoxGeometry(size, size, size);
        const cube = new THREE.Mesh(geometry, sharedMaterial);
        
        const halfSize = size / 2;
        const position = getRandomPosition(halfSize);
        cube.position.copy(position);
        cube.rotation.y = Math.random() * Math.PI * 2;
        cube.castShadow = true;
        cube.receiveShadow = true;
        cube.userData.size = halfSize * 1.2;
        cube.userData.type = 'cube';
        cube.userData.objectIndex = objects.length;
        
        objects.push(cube);
        scene.add(cube);
        
        console.log(`物体${objects.length} (立方体) 创建于位置: (${position.x.toFixed(2)}, ${position.y.toFixed(2)}, ${position.z.toFixed(2)})`);
    }
    
    console.log(`场景中共有 ${objects.length} 个物体，全部使用共享材质`);
}

/**
 * 检查平面是否与物体相交
 * @param {THREE.Plane} plane - 平面
 * @param {THREE.Object3D} object - 物体
 * @returns {boolean} - 是否相交
 */
function checkPlaneObjectIntersection(plane, object) {
    if (!object.geometry || !object.geometry.boundingBox) {
        object.geometry.computeBoundingBox();
    }
    
    const boundingBox = object.geometry.boundingBox.clone();
    boundingBox.translate(object.position);
    
    const min = boundingBox.min;
    const max = boundingBox.max;
    
    const corners = [
        new THREE.Vector3(min.x, min.y, min.z),
        new THREE.Vector3(min.x, min.y, max.z),
        new THREE.Vector3(min.x, max.y, min.z),
        new THREE.Vector3(min.x, max.y, max.z),
        new THREE.Vector3(max.x, min.y, min.z),
        new THREE.Vector3(max.x, min.y, max.z),
        new THREE.Vector3(max.x, max.y, min.z),
        new THREE.Vector3(max.x, max.y, max.z)
    ];
    
    let hasPositive = false;
    let hasNegative = false;
    
    for (const corner of corners) {
        const distance = plane.distanceToPoint(corner);
        if (distance > 0.01) hasPositive = true;
        if (distance < -0.01) hasNegative = true;
        
        if (hasPositive && hasNegative) {
            return true;
        }
    }
    
    return false;
}

/**
 * 初始化随机剖面
 * 创建3个剖面，按照要求精确控制影响范围：
 * - Plane0：仅对物体1产生影响
 * - Plane1：同时对物体2和物体3产生影响
 * - Plane2：对所有物体产生影响
 */
function initRandomClips() {
    try {
        if (!renderer || !scene) {
            throw new Error('渲染器或场景未初始化');
        }
        
        if (objects.length === 0) {
            throw new Error('场景中没有物体可供剖切');
        }
        
        if (!sharedMaterial) {
            throw new Error('共享材质未创建');
        }
        
        clipManager = new ClipManager(renderer, scene);
        console.log('ClipManager 已创建');
        
        const allPlanes = clipManager.getAllPlanes();
        sharedMaterial.setClipPlanes(allPlanes);
        sharedMaterial.setClipEnabled(true);
        
        console.log('共享材质已设置全局剖面');
        
        const planeConfigs = [
            {
                name: 'Plane0',
                targetObjects: [0],
                description: '仅影响物体1'
            },
            {
                name: 'Plane1',
                targetObjects: [1, 2],
                description: '影响物体2和物体3'
            },
            {
                name: 'Plane2',
                targetObjects: [0, 1, 2, 3, 4],
                description: '影响所有物体'
            }
        ];
        
        const planeIds = [];
        
        for (let i = 0; i < planeConfigs.length; i++) {
            const config = planeConfigs[i];
            const targetObjects = config.targetObjects
                .map(idx => objects[idx])
                .filter(obj => obj !== undefined);
            
            if (targetObjects.length === 0) {
                console.warn(`${config.name}: 没有找到目标物体，跳过`);
                continue;
            }
            
            const primaryObject = targetObjects[0];
            const objPos = primaryObject.position;
            const objSize = primaryObject.userData.size || 1;
            
            const axes = ['x', 'y', 'z'];
            const axis = axes[i % 3];
            
            let normal, position;
            const offset = (Math.random() - 0.5) * objSize * 0.6;
            
            switch (axis) {
                case 'x':
                    normal = new THREE.Vector3(1, 0, 0);
                    position = new THREE.Vector3(objPos.x + offset, objPos.y, objPos.z);
                    break;
                case 'y':
                    normal = new THREE.Vector3(0, 1, 0);
                    position = new THREE.Vector3(objPos.x, objPos.y + offset, objPos.z);
                    break;
                case 'z':
                    normal = new THREE.Vector3(0, 0, 1);
                    position = new THREE.Vector3(objPos.x, objPos.y, objPos.z + offset);
                    break;
            }
            
            if (Math.random() > 0.5) {
                normal.negate();
            }
            
            const planeId = clipManager.addPlane(normal, position);
            planeIds.push(planeId);
            
            console.log(`${config.name} 创建成功:`);
            console.log(`  - 目标: ${config.description}`);
            console.log(`  - 方向: ${axis.toUpperCase()}轴`);
            console.log(`  - 位置: (${position.x.toFixed(2)}, ${position.y.toFixed(2)}, ${position.z.toFixed(2)})`);
            console.log(`  - 剖面ID: ${planeId}`);
        }
        
        const updatedPlanes = clipManager.getAllPlanes();
        sharedMaterial.setClipPlanes(updatedPlanes);
        
        const objectPlaneMapTexture = sharedMaterial.createObjectPlaneMap(objects, planeConfigs);
        sharedMaterial.setObjectPlaneMap(objectPlaneMapTexture);
        
        console.log(`\n=== 物体-剖面映射关系 ===`);
        planeConfigs.forEach((config, idx) => {
            const affectedObjects = config.targetObjects.map(i => `物体${i+1}`).join(', ');
            console.log(`${config.name}: ${affectedObjects}`);
        });
        
        const summary = clipManager.getSummary();
        console.log(`\n=== 剖面初始化完成 ===`);
        console.log(`共创建 ${summary.planeCount} 个剖面`);
        
        if (summary.planeCount < 3) {
            console.warn(`警告: 仅成功创建 ${summary.planeCount}/3 个剖面`);
        }
        
        return clipManager;
        
    } catch (error) {
        console.error('初始化随机剖面失败:', error.message);
        console.error(error.stack);
        return null;
    }
}

/**
 * 创建地面
 */
function createGround() {
    const groundGeometry = new THREE.PlaneGeometry(40, 40);
    const groundMaterial = new THREE.MeshPhongMaterial({
        color: 0x2d3436,
        side: THREE.DoubleSide
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    scene.add(ground);

    const gridHelper = new THREE.GridHelper(40, 40, 0x4a4a4a, 0x333333);
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);
}

/**
 * 处理窗口大小变化
 */
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

/**
 * 动画渲染循环
 */
function animate() {
    requestAnimationFrame(animate);
    
    controls.update();
    
    objects.forEach((obj, index) => {
        if (obj.userData.type === 'sphere') {
            obj.position.y += Math.sin(Date.now() * 0.002 + index) * 0.003;
        } else {
            obj.rotation.y += 0.003;
        }
    });
    
    renderer.render(scene, camera);
}

/**
 * 主函数 - 初始化并启动应用
 */
function main() {
    initScene();
    initCamera();
    initRenderer();
    initControls();
    initLights();
    createGround();
    createGeometries();
    
    initRandomClips();
    
    window.addEventListener('resize', onWindowResize);
    
    animate();
    
    console.log('Three.js 场景初始化完成');
    console.log('控制说明:');
    console.log('  - 左键拖动: 旋转场景');
    console.log('  - 右键拖动: 平移场景');
    console.log('  - 鼠标滚轮: 缩放场景');
}

main();
