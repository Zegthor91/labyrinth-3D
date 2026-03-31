import * as THREE from 'three'
import { scene } from './scene.js'

// Lumières
const ambient = new THREE.AmbientLight(0xffffff, 0.3)
scene.add(ambient)

const dirLight = new THREE.DirectionalLight(0xfff5e0, 1.2)
dirLight.position.set(10, 20, 10)
dirLight.castShadow = true
dirLight.shadow.mapSize.width  = 2048
dirLight.shadow.mapSize.height = 2048
dirLight.shadow.camera.near   = 0.5
dirLight.shadow.camera.far    = 80
dirLight.shadow.camera.left   = -40
dirLight.shadow.camera.right  = 40
dirLight.shadow.camera.top    = 40
dirLight.shadow.camera.bottom = -40
scene.add(dirLight)

const pointLight = new THREE.PointLight(0x4488ff, 1.5, 25)
pointLight.position.set(0, 4, 0)
pointLight.castShadow = true
scene.add(pointLight)
