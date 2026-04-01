import * as THREE from 'three'
import { SPEED, RADIUS } from './constants.js'

const _testPos = new THREE.Vector3()

export function updateTopDown(player, delta) {
  const speed = SPEED * delta
  const gp = player._groundPos

  if (player.keys.forward || player.keys.backward) {
    const dz = (player.keys.forward ? -1 : 0) + (player.keys.backward ? 1 : 0)
    _testPos.set(gp.x, 1.7, gp.z + dz * speed)
    if (!player.labyrinth.verifCollision(_testPos, RADIUS)) gp.z += dz * speed
  }

  if (player.keys.left || player.keys.right) {
    const dx = (player.keys.left ? -1 : 0) + (player.keys.right ? 1 : 0)
    _testPos.set(gp.x + dx * speed, 1.7, gp.z)
    if (!player.labyrinth.verifCollision(_testPos, RADIUS)) gp.x += dx * speed
  }

  player.camera.position.set(gp.x, 30, gp.z)
  player.camera.lookAt(gp.x, 0, gp.z)
}
