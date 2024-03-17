import { IntersectionTest } from './algorithm/geometry/IntersectionTest.js';

const intersectionTest = new IntersectionTest();

function render() {
    intersectionTest.render();
    requestAnimationFrame(render);
}

render();
