import { SPEED, RADIUS } from './constants.js'

export function updateMovement(player, delta) {
  if (!player.controls.isLocked) return

  const speed = SPEED * delta

  player._direction.set(0, 0, 0)

  if (player.keys.forward) player._direction.z -= 1
  if (player.keys.backward) player._direction.z += 1
  if (player.keys.left) player._direction.x -= 1
  if (player.keys.right) player._direction.x += 1

  player._direction.normalize()

  const pos = player.camera.position

  // Déplacement avant/arrière avec gestion des collisions
  if (player._direction.z !== 0) {
    player.controls.moveForward(player._direction.z * speed)
    if (player.labyrinth.verifCollision(pos, RADIUS)) {
      player.controls.moveForward(-player._direction.z * speed)
    }
  }

  // Déplacement gauche/droite avec gestion des collisions
  if (player._direction.x !== 0) {
    player.controls.moveRight(player._direction.x * speed)
    if (player.labyrinth.verifCollision(pos, RADIUS)) {
      player.controls.moveRight(-player._direction.x * speed)
    }
  }

  // Stabilisation sur l'axe y
  pos.y = player.labyrinth.posDepart.y
}
