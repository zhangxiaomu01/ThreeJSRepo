import {TestSelectionMaterial} from './TestSelectionMaterial.js'

console.log('查看当前屏幕设备像素比',window.devicePixelRatio);

const testSelectionMat = new TestSelectionMaterial();

function render() {
    testSelectionMat.render();
    requestAnimationFrame(render);
}

render();