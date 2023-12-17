import {TestSelectionMaterial} from './TestSelectionMaterial.js'

console.log('查看当前屏幕设备像素比',window.devicePixelRatio);

const testEnvMap = new TestSelectionMaterial();

function render() {
    testEnvMap.render();
    requestAnimationFrame(render);
}

render();