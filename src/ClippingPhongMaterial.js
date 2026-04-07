/**
 * 自定义剖切 Phong 材质
 * 基于 THREE.MeshPhongMaterial 扩展，支持物体与剖面的关联映射
 * 使用纹理作为UBO替代方案实现物体-剖面映射
 */

import * as THREE from '../threejs_r155/build/three.module.js';

const vertexShader = `
    #define PHONG
    
    varying vec3 vViewPosition;
    varying vec3 vWorldPosition;
    varying float vObjectIndex;
    
    #include <common>
    #include <uv_pars_vertex>
    #include <displacementmap_pars_vertex>
    #include <envmap_pars_vertex>
    #include <color_pars_vertex>
    #include <fog_pars_vertex>
    #include <normal_pars_vertex>
    #include <morphtarget_pars_vertex>
    #include <skinning_pars_vertex>
    #include <shadowmap_pars_vertex>
    #include <logdepthbuf_pars_vertex>
    #include <clipping_planes_pars_vertex>
    
    void main() {
        #include <uv_vertex>
        #include <color_vertex>
        #include <morphcolor_vertex>
        
        #include <beginnormal_vertex>
        #include <morphnormal_vertex>
        #include <skinbase_vertex>
        #include <skinnormal_vertex>
        #include <defaultnormal_vertex>
        #include <normal_vertex>
        
        #include <begin_vertex>
        #include <morphtarget_vertex>
        #include <skinning_vertex>
        #include <displacementmap_vertex>
        #include <project_vertex>
        #include <logdepthbuf_vertex>
        #include <clipping_planes_vertex>
        
        vViewPosition = -mvPosition.xyz;
        
        #include <worldpos_vertex>
        
        vWorldPosition = (modelMatrix * vec4(transformed, 1.0)).xyz;
        
        vObjectIndex = float(gl_VertexID);
        
        #include <envmap_vertex>
        #include <shadowmap_vertex>
        #include <fog_vertex>
    }
`;

const fragmentShader = `
    #define PHONG
    
    uniform vec3 diffuse;
    uniform vec3 emissive;
    uniform vec3 specular;
    uniform float shininess;
    uniform float opacity;
    
    uniform vec3 clipPlaneNormals[MAX_CLIP_PLANES];
    uniform float clipPlaneConstants[MAX_CLIP_PLANES];
    uniform int numClipPlanes;
    uniform sampler2D objectPlaneMap;
    uniform int maxPlanesPerObject;
    uniform bool clipEnabled;
    
    varying vec3 vWorldPosition;
    varying float vObjectIndex;
    
    #include <common>
    #include <packing>
    #include <dithering_pars_fragment>
    #include <color_pars_fragment>
    #include <uv_pars_fragment>
    #include <map_pars_fragment>
    #include <alphamap_pars_fragment>
    #include <alphatest_pars_fragment>
    #include <aomap_pars_fragment>
    #include <lightmap_pars_fragment>
    #include <emissivemap_pars_fragment>
    #include <envmap_common_pars_fragment>
    #include <envmap_pars_fragment>
    #include <fog_pars_fragment>
    #include <bsdfs>
    #include <lights_pars_begin>
    #include <normal_pars_fragment>
    #include <lights_phong_pars_fragment>
    #include <shadowmap_pars_fragment>
    #include <bumpmap_pars_fragment>
    #include <normalmap_pars_fragment>
    #include <specularmap_pars_fragment>
    #include <logdepthbuf_pars_fragment>
    #include <clipping_planes_pars_fragment>
    
    bool isClipped(vec3 worldPosition, float objectIdx) {
        if (!clipEnabled) return false;
        
        int objIndex = int(objectIdx + 0.5);
        float texCoord = (float(objIndex) + 0.5) / 256.0;
        vec4 mapData = texture2D(objectPlaneMap, vec2(texCoord, 0.5));
        
        int numPlanes = int(mapData.r * 255.0 + 0.5);
        
        for (int i = 0; i < MAX_CLIP_PLANES_PER_OBJECT; i++) {
            if (i >= numPlanes) break;
            
            float planeIndexF;
            if (i == 0) planeIndexF = mapData.g;
            else if (i == 1) planeIndexF = mapData.b;
            else if (i == 2) planeIndexF = mapData.a;
            
            int planeIndex = int(planeIndexF * 255.0 + 0.5);
            
            if (planeIndex < 0 || planeIndex >= numClipPlanes) continue;
            
            vec3 normal = clipPlaneNormals[planeIndex];
            float constant = clipPlaneConstants[planeIndex];
            
            float distance = dot(worldPosition, normal) + constant;
            if (distance < 0.0) {
                return true;
            }
        }
        
        return false;
    }
    
    void main() {
        #include <clipping_planes_fragment>
        
        if (isClipped(vWorldPosition, vObjectIndex)) {
            discard;
        }
        
        vec4 diffuseColor = vec4(diffuse, opacity);
        ReflectedLight reflectedLight = ReflectedLight(vec3(0.0), vec3(0.0), vec3(0.0), vec3(0.0));
        vec3 totalEmissiveRadiance = emissive;
        
        #include <logdepthbuf_fragment>
        #include <map_fragment>
        #include <color_fragment>
        #include <alphamap_fragment>
        #include <alphatest_fragment>
        #include <specularmap_fragment>
        #include <normal_fragment_begin>
        #include <normal_fragment_maps>
        #include <emissivemap_fragment>
        
        #include <lights_phong_fragment>
        #include <lights_fragment_begin>
        #include <lights_fragment_maps>
        #include <lights_fragment_end>
        
        #include <aomap_fragment>
        
        vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
        
        #include <envmap_fragment>
        #include <opaque_fragment>
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
        #include <fog_fragment>
        #include <premultiplied_alpha_fragment>
        #include <dithering_fragment>
    }
`;

const MAX_CLIP_PLANES = 16;
const MAX_CLIP_PLANES_PER_OBJECT = 6;
const OBJECT_PLANE_MAP_SIZE = 256;

class ClippingPhongMaterial extends THREE.ShaderMaterial {
    constructor(parameters = {}) {
        const clipPlaneNormals = [];
        const clipPlaneConstants = [];
        for (let i = 0; i < MAX_CLIP_PLANES; i++) {
            clipPlaneNormals.push(new THREE.Vector3(0, 0, 0));
            clipPlaneConstants.push(0);
        }
        
        const uniforms = THREE.UniformsUtils.merge([
            THREE.UniformsLib.common,
            THREE.UniformsLib.specularmap,
            THREE.UniformsLib.envmap,
            THREE.UniformsLib.aomap,
            THREE.UniformsLib.lightmap,
            THREE.UniformsLib.emissivemap,
            THREE.UniformsLib.bumpmap,
            THREE.UniformsLib.normalmap,
            THREE.UniformsLib.displacementmap,
            THREE.UniformsLib.fog,
            THREE.UniformsLib.lights,
            {
                diffuse: { value: new THREE.Color(0x808080) },
                emissive: { value: new THREE.Color(0x000000) },
                specular: { value: new THREE.Color(0x111111) },
                shininess: { value: 30 },
                opacity: { value: 1.0 },
                clipPlaneNormals: { value: clipPlaneNormals },
                clipPlaneConstants: { value: clipPlaneConstants },
                numClipPlanes: { value: 0 },
                objectPlaneMap: { value: null },
                maxPlanesPerObject: { value: MAX_CLIP_PLANES_PER_OBJECT },
                clipEnabled: { value: true }
            }
        ]);
        
        const defines = {
            'MAX_CLIP_PLANES': MAX_CLIP_PLANES,
            'MAX_CLIP_PLANES_PER_OBJECT': MAX_CLIP_PLANES_PER_OBJECT
        };
        
        if (parameters.map) defines['USE_MAP'] = '';
        if (parameters.normalMap) defines['USE_NORMALMAP'] = '';
        if (parameters.specularMap) defines['USE_SPECULARMAP'] = '';
        if (parameters.emissiveMap) defines['USE_EMISSIVEMAP'] = '';
        if (parameters.envMap) defines['USE_ENVMAP'] = '';
        if (parameters.aoMap) defines['USE_AOMAP'] = '';
        if (parameters.lightMap) defines['USE_LIGHTMAP'] = '';
        if (parameters.bumpMap) defines['USE_BUMPMAP'] = '';
        
        super({
            uniforms: uniforms,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            defines: defines,
            lights: true,
            fog: true,
            side: THREE.DoubleSide,
            transparent: parameters.transparent || false
        });
        
        this.isClippingPhongMaterial = true;
        
        this.setValues(parameters);
    }
    
    setClipPlanes(planes) {
        if (!Array.isArray(planes)) {
            console.warn('ClippingPhongMaterial.setClipPlanes: planes 必须是数组');
            return;
        }
        
        const numPlanes = Math.min(planes.length, MAX_CLIP_PLANES);
        this.uniforms.numClipPlanes.value = numPlanes;
        
        for (let i = 0; i < numPlanes; i++) {
            const plane = planes[i];
            this.uniforms.clipPlaneNormals.value[i].copy(plane.normal);
            this.uniforms.clipPlaneConstants.value[i] = plane.constant;
        }
        
        this.needsUpdate = true;
    }
    
    setObjectPlaneMap(objectPlaneMap) {
        this.uniforms.objectPlaneMap.value = objectPlaneMap;
        this.needsUpdate = true;
    }
    
    createObjectPlaneMap(objects, planeConfigs) {
        const mapSize = Math.min(objects.length, OBJECT_PLANE_MAP_SIZE);
        const mapData = new Uint8Array(mapSize * 4);
        
        for (let objIndex = 0; objIndex < mapSize; objIndex++) {
            const offset = objIndex * 4;
            const config = planeConfigs.find(cfg => cfg.targetObjects.includes(objIndex));
            
            if (config) {
                const affectedPlanes = [];
                planeConfigs.forEach((cfg, planeIndex) => {
                    if (cfg.targetObjects.includes(objIndex)) {
                        affectedPlanes.push(planeIndex);
                    }
                });
                
                const numPlanes = Math.min(affectedPlanes.length, MAX_CLIP_PLANES_PER_OBJECT);
                mapData[offset] = numPlanes;
                
                for (let i = 0; i < MAX_CLIP_PLANES_PER_OBJECT; i++) {
                    if (i < numPlanes) {
                        mapData[offset + 1 + i] = affectedPlanes[i];
                    } else {
                        mapData[offset + 1 + i] = 255;
                    }
                }
            } else {
                mapData[offset] = 0;
                for (let i = 0; i < MAX_CLIP_PLANES_PER_OBJECT; i++) {
                    mapData[offset + 1 + i] = 255;
                }
            }
        }
        
        const texture = new THREE.DataTexture(mapData, mapSize, 1, THREE.RedFormat, THREE.UnsignedByteType);
        texture.needsUpdate = true;
        
        return texture;
    }
    
    setClipEnabled(enabled) {
        this.uniforms.clipEnabled.value = enabled;
        this.needsUpdate = true;
    }
    
    setPhongProperties(options = {}) {
        if (options.color) {
            this.uniforms.diffuse.value.set(options.color);
        }
        if (options.emissive) {
            this.uniforms.emissive.value.set(options.emissive);
        }
        if (options.specular !== undefined) {
            this.uniforms.specular.value.set(options.specular);
        }
        if (options.shininess !== undefined) {
            this.uniforms.shininess.value = options.shininess;
        }
        if (options.opacity !== undefined) {
            this.uniforms.opacity.value = options.opacity;
        }
        
        this.needsUpdate = true;
    }
    
    getPhongProperties() {
        return {
            color: this.uniforms.diffuse.value.getHex(),
            emissive: this.uniforms.emissive.value.getHex(),
            specular: this.uniforms.specular.value.getHex(),
            shininess: this.uniforms.shininess.value,
            opacity: this.uniforms.opacity.value
        };
    }
    
    updateFromMeshPhongMaterial(material) {
        if (!(material instanceof THREE.MeshPhongMaterial)) {
            console.warn('ClippingPhongMaterial.updateFromMeshPhongMaterial: 参数必须是 MeshPhongMaterial');
            return;
        }
        
        this.uniforms.diffuse.value.copy(material.color);
        this.uniforms.emissive.value.copy(material.emissive);
        this.uniforms.specular.value.copy(material.specular);
        this.uniforms.shininess.value = material.shininess;
        this.uniforms.opacity.value = material.opacity;
        
        if (material.map) {
            this.uniforms.map.value = material.map;
            this.defines['USE_MAP'] = '';
        }
        if (material.normalMap) {
            this.uniforms.normalMap.value = material.normalMap;
            this.uniforms.normalScale.value.copy(material.normalScale);
            this.defines['USE_NORMALMAP'] = '';
        }
        if (material.specularMap) {
            this.uniforms.specularMap.value = material.specularMap;
            this.defines['USE_SPECULARMAP'] = '';
        }
        if (material.emissiveMap) {
            this.uniforms.emissiveMap.value = material.emissiveMap;
            this.defines['USE_EMISSIVEMAP'] = '';
        }
        if (material.envMap) {
            this.uniforms.envMap.value = material.envMap;
            this.defines['USE_ENVMAP'] = '';
        }
        if (material.aoMap) {
            this.uniforms.aoMap.value = material.aoMap;
            this.uniforms.aoMapIntensity.value = material.aoMapIntensity;
            this.defines['USE_AOMAP'] = '';
        }
        if (material.bumpMap) {
            this.uniforms.bumpMap.value = material.bumpMap;
            this.uniforms.bumpScale.value = material.bumpScale;
            this.defines['USE_BUMPMAP'] = '';
        }
        
        this.transparent = material.transparent;
        this.side = material.side;
        this.opacity = material.opacity;
        
        this.needsUpdate = true;
    }
    
    clone() {
        const clonedMaterial = new ClippingPhongMaterial();
        
        clonedMaterial.uniforms.diffuse.value.copy(this.uniforms.diffuse.value);
        clonedMaterial.uniforms.emissive.value.copy(this.uniforms.emissive.value);
        clonedMaterial.uniforms.specular.value.copy(this.uniforms.specular.value);
        clonedMaterial.uniforms.shininess.value = this.uniforms.shininess.value;
        clonedMaterial.uniforms.opacity.value = this.uniforms.opacity.value;
        clonedMaterial.uniforms.numClipPlanes.value = this.uniforms.numClipPlanes.value;
        clonedMaterial.uniforms.objectPlaneMap.value = this.uniforms.objectPlaneMap.value;
        clonedMaterial.uniforms.maxPlanesPerObject.value = this.uniforms.maxPlanesPerObject.value;
        clonedMaterial.uniforms.clipEnabled.value = this.uniforms.clipEnabled.value;
        
        for (let i = 0; i < this.uniforms.numClipPlanes.value; i++) {
            clonedMaterial.uniforms.clipPlaneNormals.value[i].copy(this.uniforms.clipPlaneNormals.value[i]);
            clonedMaterial.uniforms.clipPlaneConstants.value[i] = this.uniforms.clipPlaneConstants.value[i];
        }
        
        clonedMaterial.defines = { ...this.defines };
        clonedMaterial.transparent = this.transparent;
        clonedMaterial.side = this.side;
        clonedMaterial.needsUpdate = true;
        
        return clonedMaterial;
    }
}

export { ClippingPhongMaterial, MAX_CLIP_PLANES, MAX_CLIP_PLANES_PER_OBJECT, OBJECT_PLANE_MAP_SIZE };
export default ClippingPhongMaterial;
