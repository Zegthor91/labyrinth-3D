import * as THREE from 'three'
import { Labyrinth } from './Labyrinth.js'
import { Player }    from './Player.js'
import { Timer }     from './Timer.js'
import { LEVELS }    from './maps.js'

// ─────────────────────────────────────────────
// ÉTAT DU JEU
// ─────────────────────────────────────────────
const GameState = { START: 'start', PLAYING: 'playing', END: 'end' }
let currentState   = GameState.START
let selectedLevel  = 'normal'   // niveau sélectionné par défaut

// ─────────────────────────────────────────────
// SCÈNE THREE.JS
// ─────────────────────────────────────────────
const scene = new THREE.Scene()
scene.background = new THREE.Color(0x1a1a2e)
scene.fog = new THREE.Fog(0x1a1a2e, 10, 40)

// ─────────────────────────────────────────────
// CAMÉRA
// ─────────────────────────────────────────────
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100)

// ─────────────────────────────────────────────
// RENDERER
// ─────────────────────────────────────────────
const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
document.body.appendChild(renderer.domElement)

// ─────────────────────────────────────────────
// LUMIÈRES
// ─────────────────────────────────────────────
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3)
scene.add(ambientLight)

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

// ─────────────────────────────────────────────
// MATÉRIAUX
// ─────────────────────────────────────────────
const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x8b8b8b, roughness: 0.85, metalness: 0.1 })
const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x3d3d3d, roughness: 0.9,  metalness: 0.0 })

// ─────────────────────────────────────────────
// LABYRINTHE (reconstruit à chaque partie)
// ─────────────────────────────────────────────
let labyrinth = null

function buildLabyrinth() {
  if (labyrinth) labyrinth.dispose()
  labyrinth = new Labyrinth(scene, wallMaterial, floorMaterial, LEVELS[selectedLevel].map)
}

// ─────────────────────────────────────────────
// JOUEUR (créé une seule fois)
// ─────────────────────────────────────────────
// On construit le labyrinthe initial pour avoir startPosition
buildLabyrinth()
const player = new Player(camera, renderer.domElement, labyrinth)

// ─────────────────────────────────────────────
// CHRONOMÈTRE
// ─────────────────────────────────────────────
const timerEl = document.getElementById('timer')
const timer   = new Timer(timerEl)

// ─────────────────────────────────────────────
// ÉLÉMENTS UI
// ─────────────────────────────────────────────
const startScreen  = document.getElementById('start-screen')
const endScreen    = document.getElementById('end-screen')
const finalTimeEl  = document.getElementById('final-time')
const crosshairEl  = document.getElementById('crosshair')
const btnStart     = document.getElementById('btn-start')
const btnRestart   = document.getElementById('btn-restart')
const levelBtns    = document.querySelectorAll('.level-btn')

// ─────────────────────────────────────────────
// SÉLECTION DU NIVEAU
// ─────────────────────────────────────────────
levelBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    levelBtns.forEach(b => b.classList.remove('active'))
    btn.classList.add('active')
    selectedLevel = btn.dataset.level
  })
})

// Activer le bouton "normal" par défaut
document.querySelector('[data-level="normal"]').classList.add('active')

// ─────────────────────────────────────────────
// LOGIQUE DE JEU
// ─────────────────────────────────────────────

function startGame() {
  startScreen.style.display = 'none'
  endScreen.style.display   = 'none'
  currentState = GameState.PLAYING

  // Reconstruction du labyrinthe selon le niveau choisi
  buildLabyrinth()
  player.labyrinth = labyrinth
  player.reset(labyrinth.startPosition)

  crosshairEl.style.display = 'block'
  timer.reset()
  timer.start()
  player.lock()
}

function endGame() {
  currentState = GameState.END
  player.unlock()

  const elapsed = timer.stop()
  finalTimeEl.textContent = Timer.format(elapsed)

  crosshairEl.style.display = 'none'
  endScreen.style.display   = 'flex'
}

btnStart.addEventListener('click', startGame)
btnRestart.addEventListener('click', () => {
  // Retour à l'écran de démarrage pour choisir le niveau
  endScreen.style.display   = 'none'
  startScreen.style.display = 'flex'
  currentState = GameState.START
})

// ─────────────────────────────────────────────
// RESIZE
// ─────────────────────────────────────────────
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

// ─────────────────────────────────────────────
// BOUCLE DE RENDU
// ─────────────────────────────────────────────
const clock = new THREE.Clock()

function animate() {
  requestAnimationFrame(animate)
  const delta = clock.getDelta()

  if (currentState === GameState.PLAYING) {
    player.update(delta)
    timer.update()
    if (labyrinth.isAtExit(camera.position)) endGame()
  }

  renderer.render(scene, camera)
}

animate()
