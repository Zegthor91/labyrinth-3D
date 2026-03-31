import * as THREE from 'three'

// Scène
export const scene = new THREE.Scene()
scene.background = new THREE.Color(0x1a1a2e)
// Brouillard exponentiel — s'épaissit naturellement dans les couloirs (perspective atmosphérique)
scene.fog = new THREE.FogExp2(0x1a1a2e, 0.045)

// Caméra
export const camera = new THREE.PerspectiveCamera(
  75, window.innerWidth / window.innerHeight, 0.1, 100
)
