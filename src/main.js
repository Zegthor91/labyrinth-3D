import * as THREE from 'three'
import { scene, camera, renderer, wallMaterial, floorMaterial } from './scene.js'
import { Labyrinth } from './game/Labyrinth.js'
import { Player }    from './game/Player.js'
import { Timer }     from './game/Timer.js'
import { LEVELS }    from './game/maps.js'
import { ui, getSelectedLevel, showGame, showPause, hidePause, showEnd, showStart } from './ui.js'

// ── Initialisation ────────────────────────────────────────────────────────────
let labyrinth = new Labyrinth(scene, wallMaterial, floorMaterial, LEVELS.normal.map)
const player  = new Player(camera, renderer.domElement, labyrinth)
const timer   = new Timer(document.getElementById('timer'))

// ── État du jeu ───────────────────────────────────────────────────────────────
let state = 'start'   // 'start' | 'playing' | 'paused' | 'end'

// ── Logique de jeu ────────────────────────────────────────────────────────────
function startGame() {
  labyrinth.dispose()
  labyrinth        = new Labyrinth(scene, wallMaterial, floorMaterial, LEVELS[getSelectedLevel()].map)
  player.labyrinth = labyrinth
  player.reset(labyrinth.startPosition)

  timer.reset()
  timer.start()
  showGame()
  state = 'playing'
  player.lock()
}

function pauseGame() {
  state = 'paused'
  timer.pause()
  showPause()
}

function resumeGame() {
  state = 'playing'
  timer.resume()
  hidePause()
  player.lock()
}

function endGame() {
  state = 'end'
  player.unlock()
  showEnd(Timer.format(timer.stop()))
}

// ── Déclenchement de la pause (ESC ou Espace) ────────────────────────────────
player.controls.addEventListener('unlock', () => {
  if (state === 'playing') pauseGame()
})

window.addEventListener('keydown', (e) => {
  if (e.code !== 'Space') return
  e.preventDefault()
  if (state === 'playing') player.unlock()       // déclenche l'event 'unlock' → pauseGame()
  else if (state === 'paused') resumeGame()
})

// ── Écouteurs UI ──────────────────────────────────────────────────────────────
ui.btnStart.addEventListener('click', startGame)

ui.btnResume.addEventListener('click', resumeGame)
ui.btnRestartPause.addEventListener('click', startGame)
ui.btnMenu.addEventListener('click', () => {
  timer.reset()
  showStart()
  state = 'start'
})

ui.btnRestart.addEventListener('click', () => {
  showStart()
  state = 'start'
})

// ── Boucle de rendu ───────────────────────────────────────────────────────────
const clock = new THREE.Clock()

function animate() {
  requestAnimationFrame(animate)
  const delta = clock.getDelta()

  if (state === 'playing') {
    player.update(delta)
    timer.update()
    if (labyrinth.isAtExit(camera.position)) endGame()
  }

  renderer.render(scene, camera)
}

animate()
