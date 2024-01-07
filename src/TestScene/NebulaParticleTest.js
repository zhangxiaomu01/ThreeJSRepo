// import "reset-css";
import { THREE } from '../CommonImports.js';
import Nebula, { SpriteRenderer } from "three-nebula";
import json from "./test-particle-system.json";
import ParticleSystem, {
    Body,
    BoxZone,
    Emitter,
    Gravity,
    Life,
    Mass,
    MeshRenderer,
    Position,
    RadialVelocity,
    Radius,
    Rate,
    Rotate,
    Scale,
    Span,
    Vector3D,
  } from 'three-nebula';

function getThreeApp() {
    let camera = new THREE.PerspectiveCamera(
        70,
        window.innerWidth / window.innerHeight,
        1,
        1000
      );
    camera.position.z = 100;

    let scene = new THREE.Scene();

    const boxMesh = new THREE.Mesh(new THREE.SphereGeometry(20, 20, 20),
    new THREE.MeshLambertMaterial({ color: '#ffff00' }));

    const directionalLight = new THREE.DirectionalLight(0xffffffff, 1.0);
    directionalLight.position.set(0.0, 60, 40);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);

    scene.add(boxMesh);
    scene.add(directionalLight);
    scene.add(ambientLight);
    
    let renderer = new THREE.WebGLRenderer();

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    // renderer.setClearColor("black");
    renderer.setClearColor(0x000000, 1.0);

    // document.body.appendChild(renderer.domElement);
    document.getElementById("webgl").appendChild(renderer.domElement);

    return { scene, camera, renderer };
}

function animate(nebula, app) {
    requestAnimationFrame(() => animate(nebula, app));
    nebula.update();
    app.renderer.render(app.scene, app.camera);
}

const createMesh = ({ geometry, material }) =>
  new THREE.Mesh(geometry, material);

const createEmitter = ({ position, body }) => {
    const emitter = new Emitter();

    return emitter
        .setRate(new Rate(new Span(5, 10), new Span(0.1, 0.25)))
        .addInitializers([
        new Mass(1),
        new Radius(10),
        new Life(2, 4),
        new Body(body),
        new Position(new BoxZone(100)),
        new RadialVelocity(200, new Vector3D(0, 1, 1), 30),
        ])
        .addBehaviours([
        new Rotate('random', 'random'),
        new Scale(1, 0.1),
        new Gravity(3),
        ])
        .setPosition(position)
        .emit();
};

async function getMeshParticleSystem (scene, camera) {

  const system = new ParticleSystem();
  const sphereEmitter = createEmitter({
    position: {
      x: -100,
      y: 0,
    },
    body: createMesh({
      geometry: new THREE.SphereGeometry(10, 8, 8),
      material: new THREE.MeshLambertMaterial({ color: '#ff0000' }),
    }),
  });
  const cubeEmitter = createEmitter({
    position: {
      x: 100,
      y: 0,
    },
    body: createMesh({
      geometry: new THREE.BoxGeometry(20, 20, 20),
      material: new THREE.MeshLambertMaterial({ color: '#00ffcc' }),
    }),
  });

  camera.position.z = 400;
  camera.position.y = -100;

  return system
    .addEmitter(sphereEmitter)
    .addEmitter(cubeEmitter)
    .addRenderer(new MeshRenderer(scene, THREE));
}

function initScene() {
    // Example to use json file as input! Json file can be exported via nebula desktop app.
    // Nebula.fromJSONAsync(json, THREE).then(loaded => {
    //     const app = getThreeApp();
    //     const nebulaRenderer = new SpriteRenderer(app.scene, THREE);
    //     const nebula = loaded.addRenderer(nebulaRenderer);
      
    //     animate(nebula, app);
    //   });

    const app = getThreeApp();
    getMeshParticleSystem(app.scene, app.camera).then(system => {
        console.log(system);
        animate(system, app);
    });
}

export {initScene};
