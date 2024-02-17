import {AlgorithmTest} from './algorithm/Tree.js'
import {TestSelectionMaterial} from './TestSelectionMaterial.js'
import { GenoPrototype } from './GenoPrototype/GenoPrototype.js';
import { GenoParticle } from './GenoPrototype/GenoParticle.js';

console.log('查看当前屏幕设备像素比',window.devicePixelRatio);

const genoPrototype = new GenoPrototype();

function render() {
    genoPrototype.render();
    requestAnimationFrame(render);
}

function startRender() {
    console.log(" Render starts! ");
    render();
}

startRender();

function getGenoPrototype() {
    return genoPrototype;
}

function showFPSPanel() {
    genoPrototype.showFPSPanel();
}

window.getGenoPrototype = getGenoPrototype;
window.startRender = startRender;
window.showFPSPanel = showFPSPanel;
