import { PhysXOverlapTest } from './physX/PhysXOverlapTest.js';

const physXOverlapTest = new PhysXOverlapTest();

function render() {
    physXOverlapTest.render();
    requestAnimationFrame(render);
}

render();
