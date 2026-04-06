/**
 * 自定义剖切 Phong 材质
 * 基于 THREE.MeshPhongMaterial 扩展，支持物体与剖面的关联映射
 */

import * as THREE from '../threejs_r155/build/three.module.js';

const vertexShader = `
    varying vec3 vViewPosition;
    varying vec3 vNormal;
    
    #include <common>
    #include <uv_pars_vertex>
    #include <displacementmap_pars_vertex>
    #include <envmap_pars_vertex>
    #include <color_pars_vertex>
    #include <morphtarget_pars_vertex>
    #include <skinning_pars_vertex>
    #include <shadowmap_pars_vertex>
    #include <logdepthbuf_pars_vertex>
    
    void main() {
        #include <uv_vertex>
        #include <color_vertex>
        #include <morphcolor_vertex>
        
        #include <beginnormal_vertex>
        #include <morphnormal_vertex>
        #include <skinbase_vertex>
        #include <skinnormal_vertex>
        #include <defaultnormal_vertex>
        
        vNormal = normalize(transformedNormal);
        
        #include <begin_vertex>
        #include <morphtarget_vertex>
        #include <skinning_vertex>
        #include <displacementmap_vertex>
        #include <project_vertex>
        #include <logdepthbuf_vertex>
        
        vViewPosition = -mvPosition.xyz;
        
        #include <worldpos_vertex>
        #include <envmap_vertex>
        #include <shadowmap_vertex>
    }
`;

const fragmentShader = `
    uniform vec3 diffuse;
    uniform vec3 emissive;
    uniform vec3 specular;
    uniform float shininess;
    uniform float opacity;
    
    uniform vec3 clipPlaneNormals[MAX_CLIP_PLANES];
    uniform float clipPlaneConstants[MAX_CLIP_PLANES];
    uniform int numClipPlanes;
    uniform int objectClipIndices[MAX_CLIP_PLANES_PER_OBJECT];
    uniform int numObjectClipPlanes;
    uniform bool clipEnabled;
    
    varying vec3 vViewPosition;
    varying vec3 vNormal;
    
    #include <common>
    #include <packing>
    #include <dithering_pars_fragment>
    #include <color_pars_fragment>
    #include <uv_pars_fragment>
    #include <uv2_pars_fragment>
    #include <map_pars_fragment>
    #include <alphamap_pars_fragment>
    #include <alphatest_pars_fragment>
    #include <aomap_pars_fragment>
    #include <lightmap_pars_fragment>
    #include <emissivemap_pars_fragment>
    #include <envmap_common_pars_fragment>
    #include <envmap_pars_fragment>
    #include <cube_uv_reflection_fragment>
    #include <fog_pars_fragment>
    #include <bsdfs>
    #include <lights_pars_begin>
    #include <lights_phong_pars_fragment>
    #include <shadowmap_pars_fragment>
    #include <bumpmap_pars_fragment>
    #include <normalmap_pars_fragment>
    #include <specularmap_pars_fragment>
    #include <logdepthbuf_pars_fragment>
    
    bool isClipped(vec3 worldPosition) {
        if (!clipEnabled) return false;
        
        for (int i = 0; i < MAX_CLIP_PLANES_PER_OBJECT; i++) {
            if (i >= numObjectClipPlanes) break;
            
            int planeIndex = objectClipIndices[i];
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
        
        if (isClipped(vWorldPosition)) {
            discard;
        }
        
        #include <logdepthbuf_fragment>
        
        vec4 diffuseColor = vec4(diffuse, opacity);
        ReflectedLight reflectedLight = ReflectedLight(vec3(0.0), vec3(0.0), vec3(0.0), vec3(0.0));
        vec3 totalEmissiveRadiance = emissive;
        
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
        
        vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
        
        #include <envmap_fragment>
        
        gl_FragColor = vec4(outgoingLight, diffuseColor.a);
        
        #include <tonemapping_fragment>
        #include <encodings_fragment>
        #include <fog_fragment>
        #include <premultiplied_alpha_fragment>
        #include <dithering_fragment>
    }
`;

const MAX_CLIP_PLANES = 16;
const MAX_CLIP_PLANES_PER_OBJECT = 6;

class ClippingPhongMaterial extends THREE.ShaderMaterial {
    constructor(parameters = {}) {
        const clipPlaneNormals = [];
        const clipPlaneConstants = [];
        for (let i = 0; i < MAX_CLIP_PLANES; i++) {
            clipPlaneNormals.push(new THREE.Vector3(0, 0, 0));
            clipPlaneConstants.push(0);
        }
        
        const objectClipIndices = [];
        for (let i = 0; i < MAX_CLIP_PLANES_PER_OBJECT; i++) {
            objectClipIndices.push(-1);
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
                objectClipIndices: { value: objectClipIndices },
                numObjectClipPlanes: { value: 0 },
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
    
    setObjectClipIndices(indices) {
        if (!Array.isArray(indices)) {
            console.warn('ClippingPhongMaterial.setObjectClipIndices: indices 必须是数组');
            return;
        }
        
        const numIndices = Math.min(indices.length, MAX_CLIP_PLANES_PER_OBJECT);
        this.uniforms.numObjectClipPlanes.value = numIndices;
        
        for (let i = 0; i < MAX_CLIP_PLANES_PER_OBJECT; i++) {
            if (i < numIndices) {
                this.uniforms.objectClipIndices.value[i] = indices[i];
            } else {
                this.uniforms.objectClipIndices.value[i] = -1;
            }
        }
        
        this.needsUpdate = true;
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
        clonedMaterial.uniforms.numObjectClipPlanes.value = this.uniforms.numObjectClipPlanes.value;
        clonedMaterial.uniforms.clipEnabled.value = this.uniforms.clipEnabled.value;
        
        for (let i = 0; i < this.uniforms.numClipPlanes.value; i++) {
            clonedMaterial.uniforms.clipPlaneNormals.value[i].copy(this.uniforms.clipPlaneNormals.value[i]);
            clonedMaterial.uniforms.clipPlaneConstants.value[i] = this.uniforms.clipPlaneConstants.value[i];
        }
        
        for (let i = 0; i < this.uniforms.numObjectClipPlanes.value; i++) {
            clonedMaterial.uniforms.objectClipIndices.value[i] = this.uniforms.objectClipIndices.value[i];
        }
        
        clonedMaterial.defines = { ...this.defines };
        clonedMaterial.transparent = this.transparent;
        clonedMaterial.side = this.side;
        clonedMaterial.needsUpdate = true;
        
        return clonedMaterial;
    }
}

export { ClippingPhongMaterial, MAX_CLIP_PLANES, MAX_CLIP_PLANES_PER_OBJECT };
export default ClippingPhongMaterial;
