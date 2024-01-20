// import "reset-css";
import { THREE } from '../CommonImports.js';
import ParticleSystem, {
    Body,
    BoxZone,
    Color,
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
    Attraction,
  } from 'three-nebula';

class GenoParticle {
  constructor(scene, camera, renderer, config = {}) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.config = config;
    this.nebulaSystem = null;

    // Particle parameters
    let particleColors = [
      new THREE.Color(1, 0.592, 0.259),
      new THREE.Color(112 / 255.0, 11 / 255.0, 156 / 255.0),
      new THREE.Color(0.969, 0.0, 0.176)
    ];
    if (this.config && this.config.upParticleConfigs.upParticleColors) {
      particleColors = this.config.upParticleConfigs.upParticleColors;
    }
    this.particleSphereSize = 1.0;
    let particleGeometry = new THREE.SphereGeometry(this.particleSphereSize, 12, 12);
    let orangeMesh = new THREE.Mesh(
      particleGeometry, 
      new THREE.MeshStandardMaterial({ color: particleColors[0] }));
    let purpleMesh = new THREE.Mesh(
      particleGeometry, 
      new THREE.MeshStandardMaterial({ color: particleColors[1] }));
    let redMesh = new THREE.Mesh(
      particleGeometry, 
      new THREE.MeshStandardMaterial({ color: particleColors[2] }));
    this.particleMeshes = [orangeMesh, purpleMesh, redMesh];

    this.bottomParticleParamter = {
      numPan: {start: 2, end : 5},
      timePan: {start: 0.1, end: 0.25},
      mass: 1,
      radius: 0.1,
      life: {start: 0.85, end: 1.5},
      position: new BoxZone(0.1),
      radialVelocity: {
        radius: 50,
        direction: new THREE.Vector3(0, 1, 0), 
        theta: 3
      },
      scale: {
        start: 1.0,
        end: 0.1
      },
      randomDrift: {
        driftX: 0.1,
        driftY: 5,
        delay: 0.1,
        life: 1.0
      }
    };
    this.upParticleParamter = {
      numPan: {start: 15, end : 25},
      timePan: {start: 0.1, end: 0.25},
      mass: 1,
      radius: 0.1,
      life: {start: 1.25, end: 1.5},
      position: new BoxZone(0.3),
      radialVelocity: {
        radius: 50,
        direction: new THREE.Vector3(0, 1, 0),
        theta: 10
      },
      scale: {
        start: 1.0,
        end: 0.1
      },
      randomDrift: {
        driftX: 0.1,
        driftY: 5,
        delay: 0.1,
        life: 1.0
      }
    };

    this.upParticleStartingPosition = 
      (config.upParticleConfigs && config.upParticleConfigs.upParticlePos)
      ? config.upParticleConfigs.upParticlePos 
      : new THREE.Vector3(0.0, 50, 0.0);

    // Bottom emitter parameters
    this.randomBottomEmitterNumber = 15;
    this.bottomParEndPosition  = new THREE.Vector3(0, 50, 0);
  }

  render() {
    if (this.nebulaSystem) {
      this.nebulaSystem.update();
    }
  }

  createMesh(meshId) {
    if (meshId < 0 || meshId > 2) return null;
    return this.particleMeshes[meshId];
  }

  createEmitter({ position, direction, body, type }) {
      const emitter = new Emitter();
      let param = 
        type === 'bottom' 
        ? this.bottomParticleParamter
        : this.upParticleParamter;
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
              new Scale(param.scale.start, param.scale.end),
              // new Force(0, 0.1, 0),
              new RandomDrift(
                param.randomDrift.driftX, 
                param.randomDrift.driftY, 
                param.randomDrift.delay, 
                param.randomDrift.life),
              // new Attraction(new Vector3D(0.0, 45.0, 0.0), 2.0, 3.0),
              // new Spring(1, 5, 0, 0.01, 1),
              // new Color(new THREE.Color(), new THREE.Color(1.0, 0.0, 0.0)),
          ])
          .setPosition(position)
          .emit();
  }

  async getMeshParticleSystem () {
    // Create bottom particles
    const gap = 30;
    const targetPos = this.bottomParEndPosition;
    const system = new ParticleSystem();
    let colors = [
      new THREE.Color(1, 0.592, 0.259),
      new THREE.Color(112 / 255.0, 11 / 255.0, 156 / 255.0),
      new THREE.Color(0.969, 0.0, 0.176)
    ];
    if (this.config && this.config.upParticleConfigs.upParticleColors) {
      colors = this.config.upParticleConfigs.upParticleColors;
    }

    let orangeMesh = this.createMesh(/* meshId = */ 0);
    let purpleMesh = this.createMesh(/* meshId = */ 1);
    let redMesh = this.createMesh(/* meshId = */ 2);

    for (let ii = 0; ii < 3; ++ii) {
      for (let jj = 0; jj < 3; ++jj) {
        let randomOffsetX = Math.random() * 2 - 1;
        let randomOffsetZ = Math.random() * 2 - 1;
        let newPosition = {
            x: (ii - 1) * gap + randomOffsetX,
            y: 0,
            z: (jj - 1) * gap + randomOffsetZ
        };
        let sphereEmitter0 = this.createEmitter({
          position: newPosition,
          direction: new THREE.Vector3(targetPos.x - newPosition.x,
                                        targetPos.y - newPosition.y,
                                        targetPos.z - newPosition.z).normalize(),
          body: orangeMesh,
          type: 'bottom'
        });
        let sphereEmitter1 = this.createEmitter({
          position: newPosition,
          direction: new THREE.Vector3(targetPos.x - newPosition.x,
                                        targetPos.y - newPosition.y,
                                        targetPos.z - newPosition.z).normalize(),
          body: purpleMesh,
          type: 'bottom'
        });
        let sphereEmitter2 = this.createEmitter({
          position: newPosition,
          direction: new THREE.Vector3(targetPos.x - newPosition.x,
                                        targetPos.y - newPosition.y,
                                        targetPos.z - newPosition.z).normalize(),
          body: redMesh,
          type: 'bottom'
        });
        system.addEmitter(sphereEmitter0);
        system.addEmitter(sphereEmitter1);
        system.addEmitter(sphereEmitter2);
      }
    }

    const randomInterval = 90;
    for (let ii = 0; ii < this.randomBottomEmitterNumber; ++ii) {
        let randomOffsetX = Math.random() * 6 - 3;
        let randomOffsetZ = Math.random() * 6 - 3;
        let newPosition = {
            x: randomInterval * Math.random() - randomInterval / 2 + randomOffsetX,
            y: 0,
            z: randomInterval * Math.random() - randomInterval / 2 + randomOffsetZ
        };
        let sphereEmitter0 = this.createEmitter({
          position: newPosition,
          direction: new THREE.Vector3(targetPos.x - newPosition.x,
                                        targetPos.y - newPosition.y,
                                        targetPos.z - newPosition.z).normalize(),
          body: orangeMesh,
          type: 'bottom'
        });
        let sphereEmitter1 = this.createEmitter({
          position: newPosition,
          direction: new THREE.Vector3(targetPos.x - newPosition.x,
                                        targetPos.y - newPosition.y,
                                        targetPos.z - newPosition.z).normalize(),
          body: purpleMesh,
          type: 'bottom'
        });
        let sphereEmitter2 = this.createEmitter({
          position: newPosition,
          direction: new THREE.Vector3(targetPos.x - newPosition.x,
                                        targetPos.y - newPosition.y,
                                        targetPos.z - newPosition.z).normalize(),
          body: redMesh,
          type: 'bottom'
        });
        system.addEmitter(sphereEmitter0);
        system.addEmitter(sphereEmitter1);
        system.addEmitter(sphereEmitter2);
    }
    
    // Create up particles
    const maxUpEmitterNumber = 3;
    let upParticleConfigs = this.config.upParticleConfigs;
    if (upParticleConfigs 
        && upParticleConfigs.upParticleColors 
        && upParticleConfigs.upParticleDirections) {
      let upEmitterColors = upParticleConfigs.upParticleColors;
      let upEmitterDirections = upParticleConfigs.upParticleDirections;
      for (let ii = 0; ii < maxUpEmitterNumber; ++ii) {
        let direction = upEmitterDirections[ii];
        direction.x = direction.x * 2;
        direction.z = direction.z * 2;
        let upEmitter = this.createEmitter({
          position: this.upParticleStartingPosition,
          direction: direction.normalize(),
          body: this.createMesh(/* meshId = */ ii),
          type: 'up'
        });
        system.addEmitter(upEmitter);
      }
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
