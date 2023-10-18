import * as THREE from 'three';
import {RenderTestScene} from './RenderTestScene.js'

const renderTestScene = new RenderTestScene();

function render() {
    renderTestScene.render();
    requestAnimationFrame(render);
}

render();
