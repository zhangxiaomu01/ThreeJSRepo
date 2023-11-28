
import * as THREE from 'three';

class GenerateTestData {
    constructor() {
        console.log("GenerateTestData executed!");
    }
    static GenerateBox(number, scene) {
        for (let i = 0; i < number; i++) {
            const geometry = new THREE.BoxGeometry(5, 5, 5);
            const material = new THREE.MeshLambertMaterial({
                color: 0x00ffff
            });
            const mesh = new THREE.Mesh(geometry, material);
            // 随机生成长方体xyz坐标
            const x = (Math.random() - 0.5) * 200
            const y = (Math.random() - 0.5) * 200
            const z = (Math.random() - 0.5) * 200
            mesh.position.set(x, y, z)
            scene.add(mesh); // 模型对象插入场景中
        }
    }
};

export {GenerateTestData}