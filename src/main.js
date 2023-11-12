import * as THREE from 'three';
import {MergeBufferTest} from './MergeBufferTest.js'
import {TestPhysicalMaterial} from './TestPhysicalMaterial.js'

console.log('查看当前屏幕设备像素比',window.devicePixelRatio);

const testPhysicalMat = new TestPhysicalMaterial();

function render() {
    testPhysicalMat.render();
    requestAnimationFrame(render);
}

render();