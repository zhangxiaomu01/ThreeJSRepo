
import { THREE } from '../../CommonImports.js'

/**
 * Calculate the barycentric coefficient.
 * ref: https://zhuanlan.zhihu.com/p/578110562
 * 
 * @param {THREE.Vector3} p The given points
 * @param {THREE.Vector3} a Triangle point a
 * @param {THREE.Vector3} b Triangle point b
 * @param {THREE.Vector3} c Triangle point c
 */
export function Barycentric(p, a, b, c)
{
    const v0 = b.clone().sub(a);
    const v1 = c.clone().sub(a);
    const v2 = p.clone().sub(a);
    let d00 = v0.dot(v0);
    let d01 = v0.dot(v1);
    let d11 = v1.dot(v1);
    let d20 = v2.dot(v0);
    let d21 = v2.dot(v1);
    let denom = d00 * d11 - d01 * d01;
    if (Math.abs(denom) < 1e-8) {
        console.error("The denom is 0");
        return {};
    }

    let v = (d11 * d20 - d01 * d21) / denom;
    let w = (d00 * d21 - d01 * d20) / denom;
    let u = 1.0 - v - w;
    return {u, v, w};
}