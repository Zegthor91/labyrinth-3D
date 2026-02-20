import * as THREE from 'three'
import { Labyrinth } from './Labyrinth.js'
import { Player } from './Player.js'
import { Timer } from './Timer.js'

// ─────────────────────────────────────────────
// ÉTAT DU JEU
// ─────────────────────────────────────────────
const GameState = {
  START: 'start',
  PLAYING: 'playing',
  END: 'end',
}
let currentState = GameState.START

// ─────────────────────────────────────────────
// SCÈNE THREE.JS (comme dans le cours)
// ─────────────────────────────────────────────
const scene = new THREE.Scene()
scene.background = new THREE.Color(0x1a1a2e)
scene.fog = new THREE.Fog(0x1a1a2e, 10, 40) // brouillard pour l'ambiance

// ─────────────────────────────────────────────
// CAMÉRAS
// ─────────────────────────────────────────────

// Caméra principale — vue 1ère personne
const fpCamera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  100
)

// Caméra vue du dessus (top-down)
const topCamera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  200
)
topCamera.position.set(0, 60, 0)
topCamera.lookAt(0, 0, 0)

// Caméra active (on commence en 1ère personne)
let activeCamera = fpCamera
let isFPView = true

// ─────────────────────────────────────────────
// RENDERER
// ─────────────────────────────────────────────
const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap // depuis le cours
document.body.appendChild(renderer.domElement)

// ─────────────────────────────────────────────
// LUMIÈRES (depuis le cours)
// ─────────────────────────────────────────────

// Lumière ambiante — éclairage de base
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3)
scene.add(ambientLight)

// Lumière directionnelle principale (avec ombres)
const dirLight = new THREE.DirectionalLight(0xfff5e0, 1.2)
dirLight.position.set(10, 20, 10)
dirLight.castShadow = true
dirLight.shadow.mapSize.width  = 2048
dirLight.shadow.mapSize.height = 2048
dirLight.shadow.camera.near = 0.5
dirLight.shadow.camera.far  = 80
dirLight.shadow.camera.left   = -30
dirLight.shadow.camera.right  =  30
dirLight.shadow.camera.top    =  30
dirLight.shadow.camera.bottom = -30
scene.add(dirLight)

// Lumière ponctuelle pour ambiance
const pointLight = new THREE.PointLight(0x4488ff, 1.5, 25)
pointLight.position.set(0, 4, 0)
pointLight.castShadow = true
scene.add(pointLight)

// ─────────────────────────────────────────────
// MATÉRIAUX (depuis le cours — MeshStandardMaterial PBR)
// ─────────────────────────────────────────────
const textureLoader = new THREE.TextureLoader()

// Matériau des murs — couleur pierre avec paramètres PBR
const wallMaterial = new THREE.MeshStandardMaterial({
  color: 0x8b8b8b,
  roughness: 0.85,
  metalness: 0.1,
})

// Matériau du sol — couleur sombre
const floorMaterial = new THREE.MeshStandardMaterial({
  color: 0x3d3d3d,
  roughness: 0.9,
  metalness: 0.0,
})

// ─────────────────────────────────────────────
// LABYRINTHE
// ─────────────────────────────────────────────
const labyrinth = new Labyrinth(scene, wallMaterial, floorMaterial)

// ─────────────────────────────────────────────
// JOUEUR
// ─────────────────────────────────────────────
const player = new Player(fpCamera, renderer.domElement, labyrinth)

// ─────────────────────────────────────────────
// CHRONOMÈTRE
// ─────────────────────────────────────────────
const timerEl = document.getElementById('timer')
const timer = new Timer(timerEl)

// ─────────────────────────────────────────────
// ÉLÉMENTS UI
// ─────────────────────────────────────────────
const startScreen  = document.getElementById('start-screen')
const endScreen    = document.getElementById('end-screen')
const finalTimeEl  = document.getElementById('final-time')
const cameraModeEl = document.getElementById('camera-mode')
const crosshairEl  = document.getElementById('crosshair')
const btnStart     = document.getElementById('btn-start')
const btnRestart   = document.getElementById('btn-restart')

// ─────────────────────────────────────────────
// LOGIQUE DE JEU
// ─────────────────────────────────────────────

/** Démarre / recommence une partie */
function startGame() {
  startScreen.style.display = 'none'
  endScreen.style.display   = 'none'
  currentState = GameState.PLAYING

  // Réinitialise le joueur à la position de départ
  player.reset(labyrinth.startPosition)

  // Réinitialise la caméra en vue FPS
  isFPView = true
  activeCamera = fpCamera
  cameraModeEl.textContent = 'Vue : 1ère personne'
  cameraModeEl.style.display = 'block'
  crosshairEl.style.display  = 'block'

  // Réinitialise le chronomètre
  timer.reset()
  timer.start()

  // Active le PointerLock
  player.lock()
}

/** Gère la fin de partie */
function endGame() {
  currentState = GameState.END
  player.unlock()

  const elapsed = timer.stop()
  finalTimeEl.textContent = `Temps : ${Timer.format(elapsed)}`

  endScreen.style.display    = 'flex'
  cameraModeEl.style.display = 'none'
  crosshairEl.style.display  = 'none'
}

// Bouton "Jouer"
btnStart.addEventListener('click', startGame)

// Bouton "Rejouer"
btnRestart.addEventListener('click', startGame)

// Basculer entre vue 1ère personne et vue du dessus avec la touche V
window.addEventListener('keydown', (e) => {
  if (e.code !== 'KeyV' || currentState !== GameState.PLAYING) return

  isFPView = !isFPView
  if (isFPView) {
    activeCamera = fpCamera
    cameraModeEl.textContent = 'Vue : 1ère personne'
    crosshairEl.style.display = 'block'
    player.lock()
  } else {
    activeCamera = topCamera
    cameraModeEl.textContent = 'Vue : Du dessus'
    crosshairEl.style.display = 'none'
    player.unlock()
    // Centrer la vue du dessus sur le joueur
    topCamera.position.x = fpCamera.position.x
    topCamera.position.z = fpCamera.position.z
    topCamera.position.y = 60
    topCamera.lookAt(fpCamera.position.x, 0, fpCamera.position.z)
  }
})

// Quand PointerLock est libéré (ESC) pendant le jeu, repasser en vue du dessus
player.controls.addEventListener('unlock', () => {
  if (currentState === GameState.PLAYING && isFPView) {
    isFPView = false
    activeCamera = topCamera
    cameraModeEl.textContent = 'Vue : Du dessus'
    crosshairEl.style.display = 'none'
    topCamera.position.x = fpCamera.position.x
    topCamera.position.z = fpCamera.position.z
    topCamera.position.y = 60
    topCamera.lookAt(fpCamera.position.x, 0, fpCamera.position.z)
  }
})

// ─────────────────────────────────────────────
// RESIZE
// ─────────────────────────────────────────────
window.addEventListener('resize', () => {
  const w = window.innerWidth
  const h = window.innerHeight

  fpCamera.aspect  = w / h
  fpCamera.updateProjectionMatrix()

  topCamera.aspect = w / h
  topCamera.updateProjectionMatrix()

  renderer.setSize(w, h)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

// ─────────────────────────────────────────────
// BOUCLE DE RENDU (requestAnimationFrame via THREE.Clock)
// ─────────────────────────────────────────────
const clock = new THREE.Clock()

function animate() {
  requestAnimationFrame(animate)

  const delta = clock.getDelta()

  if (currentState === GameState.PLAYING) {
    // Mise à jour du joueur
    player.update(delta)

    // Mise à jour du chronomètre
    timer.update()

    // Vérification de la fin de partie
    if (labyrinth.isAtExit(fpCamera.position)) {
      endGame()
    }

    // Suivi de la caméra du dessus sur le joueur
    if (!isFPView) {
      topCamera.position.x = fpCamera.position.x
      topCamera.position.z = fpCamera.position.z
      topCamera.lookAt(fpCamera.position.x, 0, fpCamera.position.z)
    }
  }

  renderer.render(scene, activeCamera)
}

animate()
