/**
 * 剖面管理类 - 用于管理场景中的剖面剖切效果
 * 使用 Three.js 的 clipping planes 功能实现物体剖切
 */

import * as THREE from '../threejs_r155/build/three.module.js';

class ClipManager {
    constructor(renderer, scene) {
        if (!renderer || !(renderer instanceof THREE.WebGLRenderer)) {
            throw new Error('ClipManager: 无效的渲染器参数');
        }
        
        if (!scene || !(scene instanceof THREE.Scene)) {
            throw new Error('ClipManager: 无效的场景参数');
        }

        this.renderer = renderer;
        this.scene = scene;
        this.clippingPlanes = [];
        this.enabled = true;
        
        this.renderer.localClippingEnabled = true;
        
        this.updateAllMaterials();
    }

    /**
     * 添加剖面
     * @param {THREE.Vector3} normal - 平面法线（归一化向量）
     * @param {THREE.Vector3} position - 平面上的任意点
     * @returns {number} - 返回剖面的索引ID
     */
    addPlane(normal, position) {
        if (!normal || !(normal instanceof THREE.Vector3)) {
            throw new Error('ClipManager.addPlane: 无效的法线参数');
        }
        
        if (!position || !(position instanceof THREE.Vector3)) {
            throw new Error('ClipManager.addPlane: 无效的位置参数');
        }

        const normalizedNormal = normal.clone().normalize();
        
        const plane = new THREE.Plane();
        plane.setFromNormalAndCoplanarPoint(normalizedNormal, position);
        
        plane.userData = {
            id: Date.now() + Math.random(),
            normal: normalizedNormal.clone(),
            position: position.clone(),
            createdAt: Date.now()
        };
        
        this.clippingPlanes.push(plane);
        this.updateAllMaterials();
        
        console.log(`剖面已添加 - ID: ${plane.userData.id}, 法线: (${normalizedNormal.x.toFixed(2)}, ${normalizedNormal.y.toFixed(2)}, ${normalizedNormal.z.toFixed(2)}), 位置: (${position.x.toFixed(2)}, ${position.y.toFixed(2)}, ${position.z.toFixed(2)})`);
        
        return plane.userData.id;
    }

    /**
     * 通过法线和常量添加剖面
     * @param {THREE.Vector3} normal - 平面法线
     * @param {number} constant - 平面常量（从原点到平面的有符号距离）
     * @returns {number} - 返回剖面的索引ID
     */
    addPlaneFromNormalAndConstant(normal, constant) {
        if (!normal || !(normal instanceof THREE.Vector3)) {
            throw new Error('ClipManager.addPlaneFromNormalAndConstant: 无效的法线参数');
        }
        
        if (typeof constant !== 'number') {
            throw new Error('ClipManager.addPlaneFromNormalAndConstant: 无效的常量参数');
        }

        const normalizedNormal = normal.clone().normalize();
        
        const plane = new THREE.Plane(normalizedNormal, constant);
        
        plane.userData = {
            id: Date.now() + Math.random(),
            normal: normalizedNormal.clone(),
            constant: constant,
            createdAt: Date.now()
        };
        
        this.clippingPlanes.push(plane);
        this.updateAllMaterials();
        
        console.log(`剖面已添加 - ID: ${plane.userData.id}, 法线: (${normalizedNormal.x.toFixed(2)}, ${normalizedNormal.y.toFixed(2)}, ${normalizedNormal.z.toFixed(2)}), 常量: ${constant.toFixed(2)}`);
        
        return plane.userData.id;
    }

    /**
     * 删除指定ID的剖面
     * @param {number} planeId - 剖面的唯一ID
     * @returns {boolean} - 是否成功删除
     */
    removePlane(planeId) {
        const index = this.clippingPlanes.findIndex(plane => plane.userData && plane.userData.id === planeId);
        
        if (index === -1) {
            console.warn(`ClipManager.removePlane: 未找到ID为 ${planeId} 的剖面`);
            return false;
        }
        
        const removedPlane = this.clippingPlanes.splice(index, 1)[0];
        this.updateAllMaterials();
        
        console.log(`剖面已删除 - ID: ${planeId}`);
        return true;
    }

    /**
     * 删除所有剖面
     */
    clearAllPlanes() {
        this.clippingPlanes = [];
        this.updateAllMaterials();
        console.log('所有剖面已清除');
    }

    /**
     * 获取所有剖面
     * @returns {Array<THREE.Plane>} - 剖面数组
     */
    getAllPlanes() {
        return [...this.clippingPlanes];
    }

    /**
     * 获取剖面数量
     * @returns {number} - 剖面数量
     */
    getPlaneCount() {
        return this.clippingPlanes.length;
    }

    /**
     * 根据ID获取剖面
     * @param {number} planeId - 剖面的唯一ID
     * @returns {THREE.Plane|null} - 剖面对象或null
     */
    getPlaneById(planeId) {
        return this.clippingPlanes.find(plane => plane.userData && plane.userData.id === planeId) || null;
    }

    /**
     * 更新指定剖面的属性
     * @param {number} planeId - 剖面的唯一ID
     * @param {THREE.Vector3} normal - 新的法线（可选）
     * @param {THREE.Vector3} position - 新的位置（可选）
     * @returns {boolean} - 是否成功更新
     */
    updatePlane(planeId, normal = null, position = null) {
        const plane = this.getPlaneById(planeId);
        
        if (!plane) {
            console.warn(`ClipManager.updatePlane: 未找到ID为 ${planeId} 的剖面`);
            return false;
        }
        
        if (normal && normal instanceof THREE.Vector3) {
            const normalizedNormal = normal.clone().normalize();
            if (position && position instanceof THREE.Vector3) {
                plane.setFromNormalAndCoplanarPoint(normalizedNormal, position);
                plane.userData.position = position.clone();
            } else {
                plane.normal.copy(normalizedNormal);
            }
            plane.userData.normal = normalizedNormal.clone();
        } else if (position && position instanceof THREE.Vector3) {
            const currentNormal = plane.normal.clone();
            plane.setFromNormalAndCoplanarPoint(currentNormal, position);
            plane.userData.position = position.clone();
        }
        
        this.updateAllMaterials();
        console.log(`剖面已更新 - ID: ${planeId}`);
        return true;
    }

    /**
     * 启用/禁用剖切效果
     * @param {boolean} enabled - 是否启用
     */
    setEnabled(enabled) {
        this.enabled = enabled;
        this.renderer.localClippingEnabled = enabled;
        this.updateAllMaterials();
        console.log(`剖切效果已${enabled ? '启用' : '禁用'}`);
    }

    /**
     * 检查剖切效果是否启用
     * @returns {boolean} - 是否启用
     */
    isEnabled() {
        return this.enabled;
    }

    /**
     * 更新场景中所有物体的材质以应用剖面
     */
    updateAllMaterials() {
        const planes = this.enabled ? this.clippingPlanes : [];
        
        this.scene.traverse((object) => {
            if (object.isMesh || object.isLine || object.isPoints) {
                if (object.material) {
                    this.applyClippingPlanesToMaterial(object.material, planes);
                }
            }
        });
    }

    /**
     * 将剖面应用到材质
     * @param {THREE.Material} material - 材质对象
     * @param {Array<THREE.Plane>} planes - 剖面数组
     */
    applyClippingPlanesToMaterial(material, planes) {
        if (Array.isArray(material)) {
            material.forEach(mat => {
                this.applyClippingPlanesToMaterial(mat, planes);
            });
            return;
        }
        
        if (material.isMaterial) {
            material.clippingPlanes = planes.length > 0 ? planes : null;
            material.clipShadows = true;
            material.side = THREE.DoubleSide;
            material.needsUpdate = true;
        }
    }

    /**
     * 创建可视化辅助对象（可选）
     * @param {number} planeId - 剖面的唯一ID
     * @param {number} size - 辅助平面的大小
     * @param {number} color - 辅助平面的颜色
     * @returns {THREE.Mesh|null} - 辅助网格对象或null
     */
    createPlaneHelper(planeId, size = 10, color = 0xffff00) {
        const plane = this.getPlaneById(planeId);
        
        if (!plane) {
            console.warn(`ClipManager.createPlaneHelper: 未找到ID为 ${planeId} 的剖面`);
            return null;
        }
        
        const geometry = new THREE.PlaneGeometry(size, size);
        const material = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide,
            depthWrite: false
        });
        
        const helper = new THREE.Mesh(geometry, material);
        
        const normal = plane.normal.clone();
        const position = plane.userData.position || new THREE.Vector3();
        
        helper.position.copy(position);
        helper.lookAt(position.clone().add(normal));
        helper.userData.planeId = planeId;
        
        return helper;
    }

    /**
     * 创建预设剖面
     * @param {string} type - 预设类型: 'x', 'y', 'z', 'xy', 'xz', 'yz'
     * @param {number} offset - 偏移量
     * @returns {number} - 剖面ID
     */
    createPresetPlane(type, offset = 0) {
        let normal, position;
        
        switch (type.toLowerCase()) {
            case 'x':
                normal = new THREE.Vector3(1, 0, 0);
                position = new THREE.Vector3(offset, 0, 0);
                break;
            case 'y':
                normal = new THREE.Vector3(0, 1, 0);
                position = new THREE.Vector3(0, offset, 0);
                break;
            case 'z':
                normal = new THREE.Vector3(0, 0, 1);
                position = new THREE.Vector3(0, 0, offset);
                break;
            case 'xy':
                normal = new THREE.Vector3(0, 0, 1);
                position = new THREE.Vector3(0, 0, offset);
                break;
            case 'xz':
                normal = new THREE.Vector3(0, 1, 0);
                position = new THREE.Vector3(0, offset, 0);
                break;
            case 'yz':
                normal = new THREE.Vector3(1, 0, 0);
                position = new THREE.Vector3(offset, 0, 0);
                break;
            default:
                throw new Error(`ClipManager.createPresetPlane: 未知的预设类型 "${type}"`);
        }
        
        return this.addPlane(normal, position);
    }

    /**
     * 获取剖面信息摘要
     * @returns {Object} - 剖面信息对象
     */
    getSummary() {
        return {
            enabled: this.enabled,
            planeCount: this.clippingPlanes.length,
            planes: this.clippingPlanes.map(plane => ({
                id: plane.userData?.id,
                normal: plane.normal.clone(),
                constant: plane.constant,
                position: plane.userData?.position?.clone()
            }))
        };
    }

    /**
     * 销毁管理器并清理资源
     */
    dispose() {
        this.clearAllPlanes();
        this.renderer.localClippingEnabled = false;
        this.clippingPlanes = null;
        console.log('ClipManager 已销毁');
    }
}

export default ClipManager;
export { ClipManager };
