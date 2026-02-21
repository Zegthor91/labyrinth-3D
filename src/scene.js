import * as THREE from 'three'

// ── Scène ────────────────────────────────────────────────────────────────────
export const scene = new THREE.Scene()
scene.background = new THREE.Color(0x1a1a2e)
scene.fog = new THREE.Fog(0x1a1a2e, 10, 40)

// ── Caméra ───────────────────────────────────────────────────────────────────
export const camera = new THREE.PerspectiveCamera(
  75, window.innerWidth / window.innerHeight, 0.1, 100
)

// ── Renderer ─────────────────────────────────────────────────────────────────
export const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
document.body.appendChild(renderer.domElement)

// ── Lumières ─────────────────────────────────────────────────────────────────
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
dirLight.shadow.camera.right  =  40
dirLight.shadow.camera.top    =  40
dirLight.shadow.camera.bottom = -40
scene.add(dirLight)

const pointLight = new THREE.PointLight(0x4488ff, 1.5, 25)
pointLight.position.set(0, 4, 0)
pointLight.castShadow = true
scene.add(pointLight)

// ── Matériaux ─────────────────────────────────────────────────────────────────
export const wallMaterial  = new THREE.MeshStandardMaterial({ color: 0x8b8b8b, roughness: 0.85, metalness: 0.1 })
export const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x3d3d3d, roughness: 0.9,  metalness: 0.0 })

// ── Redimensionnement ────────────────────────────────────────────────────────
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})
