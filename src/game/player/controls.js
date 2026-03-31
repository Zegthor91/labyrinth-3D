export function setupKeyListeners(keys) {
  const onKeyDown = (e) => {
    switch (e.code) {
      case 'ArrowUp':
      case 'KeyW':
      case 'KeyZ': keys.forward = true; break
      case 'ArrowDown':
      case 'KeyS': keys.backward = true; break
      case 'ArrowLeft':
      case 'KeyA':
      case 'KeyQ': keys.left = true; break
      case 'ArrowRight':
      case 'KeyD': keys.right = true; break
    }
  }

  const onKeyUp = (e) => {
    switch (e.code) {
      case 'ArrowUp':
      case 'KeyW':
      case 'KeyZ': keys.forward = false; break
      case 'ArrowDown':
      case 'KeyS': keys.backward = false; break
      case 'ArrowLeft':
      case 'KeyA':
      case 'KeyQ': keys.left = false; break
      case 'ArrowRight':
      case 'KeyD': keys.right = false; break
    }
  }

  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
}
