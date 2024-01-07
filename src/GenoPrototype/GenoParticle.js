// import "reset-css";
import { THREE } from '../CommonImports.js';
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
    Force,
    Spring,
    Vector3D,
    RandomDrift,
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

    const directionalLight = new THREE.DirectionalLight(0xffffffff, 1.0);
    directionalLight.position.set(0.0, 60, 40);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);

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
            new Life(4, 8),
            new Body(body),
            new Position(new BoxZone(0.2)),
            new RadialVelocity(100, new Vector3D(0, 1, 0), 5),
        ])
        .addBehaviours([
            new Rotate('random', 'random'),
            new Scale(1, 0.1),
            new Force(0, 0.1, 0),
            new RandomDrift(1, 5, 1, 1),
            // new Spring(1, 5, 0, 0.01, 1),
        ])
        .setPosition(position)
        .emit();
};

async function getMeshParticleSystem (scene, camera) {

  const system = new ParticleSystem();
  const sphereEmitter = createEmitter({
    position: {
      x: -100,
      y: -200,
    },
    body: createMesh({
      geometry: new THREE.SphereGeometry(5, 12, 12),
      material: new THREE.MeshStandardMaterial({ color: '#ff0000' }),
    }),
  });

  camera.position.z = 400;
  camera.position.y = -100;

  return system
    .addEmitter(sphereEmitter)
    .addRenderer(new MeshRenderer(scene, THREE));
}

function initScene() {
    const app = getThreeApp();
    getMeshParticleSystem(app.scene, app.camera).then(system => {
        console.log(system);
        animate(system, app);
    });
}

export {initScene};
