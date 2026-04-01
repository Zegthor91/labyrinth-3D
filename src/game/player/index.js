import * as THREE from 'three'
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js'
import { SPEED, RADIUS } from './constants.js'
import { setupKeyListeners } from './controls.js'
import { updateMovement } from './movement.js'
import { updateTopDown } from './topdown.js'

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
    this._groundPos = new THREE.Vector3()
    this._savedYaw = 0
    this.topDown = false

    this._setupKeyListeners()
  }

  reset(startPosition) {
    this.camera.position.copy(startPosition)
    this.topDown = false
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

  toggleView() {
    if (!this.topDown) {
      // Sauvegarde la position au sol et l'orientation avant de passer en vue du dessus
      this._groundPos.set(this.camera.position.x, 0, this.camera.position.z)
      this._savedYaw = this.camera.rotation.y
      this.topDown = true  // doit être true AVANT unlock pour ne pas déclencher la pause
      this.controls.unlock()
    } else {
      // Retour en vue FPS : repositionne la caméra au sol avec l'orientation d'avant
      this.topDown = false
      this.camera.position.set(this._groundPos.x, 1.7, this._groundPos.z)
      this.camera.rotation.set(0, this._savedYaw, 0)
      this.controls.lock()
    }
  }

  update(delta) {
    if (this.topDown) {
      updateTopDown(this, delta)
    } else {
      updateMovement(this, delta)
    }
  }

  _setupKeyListeners() {
    setupKeyListeners(this.keys)
  }
}
