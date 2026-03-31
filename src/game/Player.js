import * as THREE from 'three'
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js'

/**
 * Classe joueur : gestion des déplacements et de la caméra (à la 1ère personne)
 */
export class Player {
  static SPEED = 8    // unités/seconde
  static RADIUS = 0.6   // rayon collision

  constructor(camera, domElement, labyrinth) {
    this.camera = camera
    this.labyrinth = labyrinth

    // Camera pour la vue FPS
    this.controls = new PointerLockControls(camera, domElement)

    // Touches pressées
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
    }

    // Vecteur de direction de mouvement
    this._direction = new THREE.Vector3()
    this._velocity = new THREE.Vector3()

    this._setupKeyListeners()
  }

  /**
   * Point de départ du joueur
   */
  reset(startPosition) {
    this.camera.position.copy(startPosition)
  }

  /**
   * Active la capture de la souris
   */
  lock() {
    this.controls.lock()
  }

  /**
   * /désactive la capture de la souris
   */

  unlock() {
    this.controls.unlock()
  }

  get isLocked() {
    return this.controls.isLocked
  }

  /**
   * Met à jour la position du joueur en tenant compte des collisions
   * @param {number} delta
   */
  update(delta) {
    if (!this.controls.isLocked) return

    const speed = Player.SPEED * delta

    // Calcul de la direction de mouvement dans le repère de la caméra
    this._direction.set(0, 0, 0)

    if (this.keys.forward)  this._direction.z -= 1
    if (this.keys.backward) this._direction.z += 1
    if (this.keys.left)     this._direction.x -= 1
    if (this.keys.right)    this._direction.x += 1

    this._direction.normalize()

    const pos = this.camera.position

    // Déplacement de l'axe Z (avant & arrière) avec gestion des collisions
    if (this._direction.z !== 0) {
      this.controls.moveForward(this._direction.z * speed)
      if (this.labyrinth.checkCollision(pos, Player.RADIUS)) {
        this.controls.moveForward(-this._direction.z * speed)
      }
    }

    // Déplacement de l'axe X (gauche & droite) avec gestion des collisions
    if (this._direction.x !== 0) {
      this.controls.moveRight(this._direction.x * speed)
      if (this.labyrinth.checkCollision(pos, Player.RADIUS)) {
        this.controls.moveRight(-this._direction.x * speed)
      }
    }

    // Stabilisation du point d'origine, toujours à 0 sur l'axe y
    pos.y = this.labyrinth.startPosition.y
  }

  /**
   * Setup pour les touches au clavier
   */
  _setupKeyListeners() {
    const onKeyDown = (e) => {
      switch (e.code) {
        case 'ArrowUp':
        case 'KeyW':
        case 'KeyZ': this.keys.forward  = true;  break
        case 'ArrowDown':
        case 'KeyS': this.keys.backward = true;  break
        case 'ArrowLeft':
        case 'KeyA':
        case 'KeyQ': this.keys.left     = true;  break
        case 'ArrowRight':
        case 'KeyD': this.keys.right    = true;  break
      }
    }

    const onKeyUp = (e) => {
      switch (e.code) {
        case 'ArrowUp':
        case 'KeyW':
        case 'KeyZ': this.keys.forward  = false; break
        case 'ArrowDown':
        case 'KeyS': this.keys.backward = false; break
        case 'ArrowLeft':
        case 'KeyA':
        case 'KeyQ': this.keys.left     = false; break
        case 'ArrowRight':
        case 'KeyD': this.keys.right    = false; break
      }
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
  }
}
