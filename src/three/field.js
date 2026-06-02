import * as THREE from 'three';

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function geometryFor(form) {
  switch (form) {
    case 'shard':   return new THREE.TetrahedronGeometry(0.13);
    case 'petal':   return new THREE.SphereGeometry(0.11, 8, 6);
    case 'orb':     return new THREE.IcosahedronGeometry(0.12, 1);
    case 'lantern': return new THREE.BoxGeometry(0.16, 0.22, 0.16);
    case 'mote':    return new THREE.SphereGeometry(0.06, 6, 5);
    case 'fish':    return new THREE.ConeGeometry(0.07, 0.3, 6);
    default:        return new THREE.IcosahedronGeometry(0.12, 1);
  }
}
