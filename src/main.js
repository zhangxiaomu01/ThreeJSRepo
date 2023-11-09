import * as THREE from 'three';
import {MergeBufferTest} from './MergeBufferTest.js'

console.log('查看当前屏幕设备像素比',window.devicePixelRatio);

const renderTestScene = new MergeBufferTest();

var testDIVElement = function () {
    console.log("Test div");
    var div = document.createElement("div");
    div.style.width = "100px";
    div.style.height = "100px";
    div.style.background = "red";
    div.style.color = "Black";
    div.innerHTML = "Hello";

    div.addEventListener('click', function(e) {
        console.log('hello world');
        this.style.background = "green";
    });

    document.getElementById("main").appendChild(div);
}

testDIVElement();

// function render() {
//     renderTestScene.render();
//     requestAnimationFrame(render);
// }

// render();
