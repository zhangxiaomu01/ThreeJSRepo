import * as THREE from 'three';
import {MergeBufferTest} from './MergeBufferTest.js'

console.log('查看当前屏幕设备像素比',window.devicePixelRatio);

const renderTestScene = new MergeBufferTest();

function render() {
    renderTestScene.render();
    requestAnimationFrame(render);
}

render();
