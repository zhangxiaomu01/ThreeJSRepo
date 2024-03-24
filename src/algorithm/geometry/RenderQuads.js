import { THREE } from '../../CommonImports.js'

// Reference: https://discourse.threejs.org/t/wireframe-of-quads/17924

setGeom(new THREE.PlaneBufferGeometry(5, 5, 11, 12), 0x00ffff, -10, 0, 0);
setGeom(new THREE.CylinderBufferGeometry(1, 2, 5, 11, 12), 0xffff00, -5, 0, 0);
setGeom(new THREE.RingBufferGeometry(1, 2.5, 11, 6), 0x888888, 0, 0, 0);
setGeom(new THREE.TorusBufferGeometry(2, 0.5, 11, 12, Math.PI * 1.5), 0xff00ff, 5, 0, 0);
setGeom(new THREE.TorusKnotBufferGeometry(1.5, 0.5, 36, 11), 0xffffff, 10, 0, 0);
setGeom(new THREE.TubeBufferGeometry(new THREE.CatmullRomCurve3([
  new THREE.Vector3(0, 5, -5),
  new THREE.Vector3(-10, -5, 0),
  new THREE.Vector3(10, -5, 5)
], false), 36, 0.5, 11), "orange", 0, 0, 0);
setGeom(new THREE.LatheBufferGeometry(new THREE.CatmullRomCurve3([
	new THREE.Vector3(2.5, 10, 0),
  new THREE.Vector3(5, 7.5, 0),
  new THREE.Vector3(12, 5, 0),
  new THREE.Vector3(13, -5, 0)
]).getSpacedPoints(12), 11, Math.PI * 0.5, Math.PI), 0x444444, 0, 0, 0);

function setGeom(g, color, x, y, z, scene = new THREE.Scene()) {
  ToQuads(g);
  let m = new THREE.LineBasicMaterial({
    color: color
  });
  let o = new THREE.LineSegments(g, m);
  o.position.set(x, y, z);
  scene.add(o);
}

function ToQuads(g) {
  let p = g.parameters;
  let segmentsX = (g.type == "TorusBufferGeometry" ? p.tubularSegments : p.radialSegments) || p.widthSegments || p.thetaSegments || (p.points.length - 1) || 1;
  let segmentsY = (g.type == "TorusBufferGeometry" ? p.radialSegments : p.tubularSegments) || p.heightSegments || p.phiSegments || p.segments || 1;
  let indices = [];
  for (let i = 0; i < segmentsY + 1; i++) {
    let index11 = 0;
    let index12 = 0;
    for (let j = 0; j < segmentsX; j++) {
      index11 = (segmentsX + 1) * i + j;
      index12 = index11 + 1;
      let index21 = index11;
      let index22 = index11 + (segmentsX + 1);
      indices.push(index11, index12);
      if (index22 < ((segmentsX + 1) * (segmentsY + 1) - 1)) {
        indices.push(index21, index22);
      }
    }
    if ((index12 + segmentsX + 1) <= ((segmentsX + 1) * (segmentsY + 1) - 1)) {
      indices.push(index12, index12 + segmentsX + 1);
    }
  }
  g.setIndex(indices);
}
