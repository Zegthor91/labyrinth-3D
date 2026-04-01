import * as THREE from 'three'
import { scene, camera }        from './core/scene.js'
import { renderer }             from './core/renderer.js'
import { composer }             from './core/postprocessing.js'
import './core/lights.js'
import './core/events.js'
import { wallMaterial, floorMaterial } from './assets/materials.js'
import { Labyrinthe }           from './game/labyrinth/index.js'
import { Player }               from './game/player/index.js'
import { Timer }                from './game/Timer.js'
import { LEVELS }               from './game/maps.js'
import { ui, getSelectedLevel, showGame, showPause, hidePause, showEnd, showStart } from './ui/index.js'

// Initialisation
let labyrinth = new Labyrinthe(scene, wallMaterial, floorMaterial, LEVELS.normal.map)
const player  = new Player(camera, renderer.domElement, labyrinth)
const timer   = new Timer(document.getElementById('timer'))

// État du jeu
let state = 'start'

// Logique de jeu
function startGame() {
  labyrinth.viderScene()
  labyrinth = new Labyrinthe(scene, wallMaterial, floorMaterial, LEVELS[getSelectedLevel()].map)
  player.labyrinth = labyrinth
  player.reset(labyrinth.posDepart)

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

// Déclenchement de la pause — ignoré si c'est un changement de vue
player.controls.addEventListener('unlock', () => {
  if (state === 'playing' && !player.topDown) pauseGame()
})

window.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault()
    if (state === 'playing') player.unlock()
    else if (state === 'paused') resumeGame()
  }
  if (e.code === 'KeyV' && state === 'playing') player.toggleView()
})

// Écouteurs UI
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

// Boucle de rendu
const clock = new THREE.Clock()

function animate() {
  requestAnimationFrame(animate)
  const delta = clock.getDelta()

  if (state === 'playing') {
    player.update(delta)
    timer.update()
    labyrinth.update(clock.elapsedTime)
    if (labyrinth.estArriveSortie(camera.position)) endGame()
  }

  composer.render()
}

animate()
