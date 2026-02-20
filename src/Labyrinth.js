import * as THREE from 'three'

/**
 * Labyrinth - Construit et gère le labyrinthe 3D.
 *
 * Convention de la map :
 *   1   = mur
 *   0   = couloir
 *  'S'  = départ du joueur
 *  'E'  = sortie
 */
export class Labyrinth {
  static CELL_SIZE    = 4
  static WALL_HEIGHT  = 3

  /**
   * @param {THREE.Scene} scene
   * @param {THREE.Material} wallMaterial
   * @param {THREE.Material} floorMaterial
   * @param {Array}  mapData  - grille 2D définissant le labyrinthe
   */
  constructor(scene, wallMaterial, floorMaterial, mapData) {
    this.scene         = scene
    this.wallMaterial  = wallMaterial
    this.floorMaterial = floorMaterial
    this.map           = mapData

    this.wallBoxes     = []          // Box3 pour les collisions
    this.startPosition = new THREE.Vector3()
    this.exitPosition  = new THREE.Vector3()
    this._meshes       = []          // tous les meshes créés, pour dispose()

    this._build()
  }

  // ─── Conversion grille → monde ───────────────────────────────────────────

  _gridToWorld(col, row) {
    const C    = Labyrinth.CELL_SIZE
    const cols = this.map[0].length
    const rows = this.map.length
    return new THREE.Vector3(
      (col - cols / 2) * C,
      0,
      (row - rows / 2) * C
    )
  }

  // ─── Construction ────────────────────────────────────────────────────────

  _build() {
    const map  = this.map
    const rows = map.length
    const cols = map[0].length
    const C    = Labyrinth.CELL_SIZE
    const H    = Labyrinth.WALL_HEIGHT

    // Sol
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(cols * C, rows * C),
      this.floorMaterial
    )
    floor.rotation.x = -Math.PI / 2
    floor.receiveShadow = true
    this.scene.add(floor)
    this._meshes.push(floor)

    // Plafond
    const ceilMat = new THREE.MeshStandardMaterial({ color: 0x222222, side: THREE.BackSide })
    const ceil = new THREE.Mesh(
      new THREE.PlaneGeometry(cols * C, rows * C),
      ceilMat
    )
    ceil.rotation.x = Math.PI / 2
    ceil.position.y = H
    this.scene.add(ceil)
    this._meshes.push(ceil)

    // Murs, départ, sortie
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const cell = map[row][col]
        if      (cell === 1)   this._createWall(col, row)
        else if (cell === 'S') this._initStart(col, row)
        else if (cell === 'E') this._createExit(col, row)
      }
    }
  }

  _createWall(col, row) {
    const C = Labyrinth.CELL_SIZE
    const H = Labyrinth.WALL_HEIGHT
    const wall = new THREE.Mesh(
      new THREE.BoxGeometry(C, H, C),
      this.wallMaterial
    )
    const pos = this._gridToWorld(col, row)
    wall.position.set(pos.x, H / 2, pos.z)
    wall.castShadow    = true
    wall.receiveShadow = true
    this.scene.add(wall)
    this._meshes.push(wall)
    this.wallBoxes.push(new THREE.Box3().setFromObject(wall))
  }

  _initStart(col, row) {
    const pos = this._gridToWorld(col, row)
    this.startPosition.set(pos.x, 1.7, pos.z) // hauteur des yeux
  }

  _createExit(col, row) {
    const C   = Labyrinth.CELL_SIZE
    const mat = new THREE.MeshStandardMaterial({
      color: 0x00ff88,
      emissive: 0x00ff88,
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0.85,
    })
    const exit = new THREE.Mesh(new THREE.PlaneGeometry(C * 0.9, C * 0.9), mat)
    exit.rotation.x = -Math.PI / 2
    const pos = this._gridToWorld(col, row)
    exit.position.set(pos.x, 0.05, pos.z)
    this.scene.add(exit)
    this._meshes.push(exit)
    this.exitPosition.copy(pos)
  }

  // ─── Collision ───────────────────────────────────────────────────────────

  checkCollision(position, radius) {
    const playerBox = new THREE.Box3(
      new THREE.Vector3(position.x - radius, position.y - 1.5, position.z - radius),
      new THREE.Vector3(position.x + radius, position.y + 0.5, position.z + radius)
    )
    for (const wallBox of this.wallBoxes) {
      if (playerBox.intersectsBox(wallBox)) return true
    }
    return false
  }

  // ─── Détection sortie ────────────────────────────────────────────────────

  isAtExit(position) {
    const C  = Labyrinth.CELL_SIZE
    const dx = Math.abs(position.x - this.exitPosition.x)
    const dz = Math.abs(position.z - this.exitPosition.z)
    return dx < C * 0.6 && dz < C * 0.6
  }

  // ─── Nettoyage scène ─────────────────────────────────────────────────────

  dispose() {
    for (const mesh of this._meshes) {
      this.scene.remove(mesh)
      mesh.geometry.dispose()
    }
    this._meshes   = []
    this.wallBoxes = []
  }
}
