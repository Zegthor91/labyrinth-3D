import * as THREE from 'three'
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js'
import { SPEED, RADIUS } from './constants.js'
import { setupKeyListeners } from './controls.js'
import { updateMovement } from './movement.js'

export class Player {
  static SPEED = SPEED
  static RADIUS = RADIUS

  constructor(camera, domElement, labyrinth) {
    this.camera = camera
    this.labyrinth = labyrinth

    this.controls = new PointerLockControls(camera, domElement)

    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
    }

    this._direction = new THREE.Vector3()
    this._velocity = new THREE.Vector3()

    this._setupKeyListeners()
  }

  reset(startPosition) {
    this.camera.position.copy(startPosition)
  }

  lock() {
    this.controls.lock()
  }

  unlock() {
    this.controls.unlock()
  }

  get isLocked() {
    return this.controls.isLocked
  }

  update(delta) {
    updateMovement(this, delta)
  }

  _setupKeyListeners() {
    setupKeyListeners(this.keys)
  }
}
