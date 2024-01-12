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

class GenoParticle {
  constructor(scene, camera, renderer) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.nebulaSystem = null;

    // Particle parameters
    this.particleSphereSize = 1.0;
    this.bottomParticleParamter = {
      numPan: {start: 5, end : 10},
      timePan: {start: 0.1, end: 0.25},
      mass: 1,
      radius: 0.1,
      life: {start: 0.85, end: 1.5},
      position: new BoxZone(0.1),
      radialVelocity: {
        radius: 50,
        direction: new THREE.Vector3(0, 1, 0),
        theta: 3
      }
    };

    // Bottom emitter parameters
    this.randomBottomEmitterNumber = 15;
    this.bottomParEndPosition  = new THREE.Vector3(0, 50, 0);
  }

  static getThreeApp() {
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

  render() {
    if (this.nebulaSystem) {
      this.nebulaSystem.update();
    }
  }

  createMesh() {
    return new THREE.Mesh(
      new THREE.SphereGeometry(this.particleSphereSize, 12, 12), 
      new THREE.MeshStandardMaterial({ color: '#e30200' }));
  }

  createEmitter({ position, direction, body }) {
      const emitter = new Emitter();
      let param = this.bottomParticleParamter;
      param.radialVelocity.direction = direction;

      return emitter
          .setRate(new Rate(
            new Span(param.numPan.start, param.numPan.end), 
            new Span(param.timePan.start, param.timePan.end)))
          .addInitializers([
              new Mass(param.mass),
              new Radius(param.radius),
              new Life(param.life.start, param.life.end),
              new Body(body),
              new Position(param.position),
              new RadialVelocity(param.radialVelocity.radius,
                param.radialVelocity.direction,
                param.radialVelocity.theta),
          ])
          .addBehaviours([
              new Rotate('random', 'random'),
              new Scale(1, 0.1),
              // new Force(0, 0.1, 0),
              new RandomDrift(0.1, 5, .1, 1),
              // new Spring(1, 5, 0, 0.01, 1),
          ])
          .setPosition(position)
          .emit();
  }

  async getMeshParticleSystem () {
    const gap = 30;
    const targetPos = this.bottomParEndPosition;
    const system = new ParticleSystem();
    for (let ii = 0; ii < 3; ++ii) {
      for (let jj = 0; jj < 3; ++jj) {
        let newPosition = {
            x: (ii - 1) * gap,
            y: 0,
            z: (jj - 1) * gap
        };
        let sphereEmitter = this.createEmitter({
          position: newPosition,
          direction: new THREE.Vector3(targetPos.x - newPosition.x,
                                        targetPos.y - newPosition.y,
                                        targetPos.z - newPosition.z).normalize(),
          body: this.createMesh(),
        });
        system.addEmitter(sphereEmitter)
      }
    }

    const randomInterval = 90;
    for (let ii = 0; ii < this.randomBottomEmitterNumber; ++ii) {
        let newPosition = {
            x: randomInterval * Math.random() - randomInterval / 2,
            y: 0,
            z: randomInterval * Math.random() - randomInterval / 2
        };
        let sphereEmitter = this.createEmitter({
          position: newPosition,
          direction: new THREE.Vector3(targetPos.x - newPosition.x,
                                        targetPos.y - newPosition.y,
                                        targetPos.z - newPosition.z).normalize(),
          body: this.createMesh(),
        });
        system.addEmitter(sphereEmitter)
    }
    

    return system
      .addRenderer(new MeshRenderer(this.scene, THREE));
  }

  initScene() {
    let scope = this;
    this.getMeshParticleSystem(this.scene, this.camera).then(system => {
        console.log(system);
        scope.nebulaSystem = system;
    });
  }
}

export {GenoParticle};
