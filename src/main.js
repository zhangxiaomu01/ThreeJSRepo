import * as THREE from 'three';
import {MergeBufferTest} from './MergeBufferTest.js'
import {TestEnvMap} from './TestEnvMap.js'

console.log('查看当前屏幕设备像素比',window.devicePixelRatio);

const testEnvMap = new TestEnvMap();

function render() {
    testEnvMap.render();
    requestAnimationFrame(render);
}

render();