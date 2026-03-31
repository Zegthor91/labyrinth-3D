import * as THREE from 'three'

// Textures
const loader = new THREE.TextureLoader()

const wallTex = loader.load('/dist/textures/Sci-fi_Metal_Walkway_001_roughness.png')
wallTex.wrapS = wallTex.wrapT = THREE.RepeatWrapping
wallTex.repeat.set(1, 1)

const floorTex = loader.load('/dist/textures/Sci_fi_Metal_Panel_008_roughness.png')
floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping

// Matériaux PBR (Physically Based Rendering)
export const wallMaterial  = new THREE.MeshStandardMaterial({ map: wallTex,  roughness: 0.85, metalness: 0.1 })
export const floorMaterial = new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.9,  metalness: 0.0 })
