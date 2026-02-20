import * as THREE from 'three'

/**
 * Labyrinth - Gère la création et le rendu du labyrinthe
 * Chaque cellule = 1 unité. Les murs font 1 unité d'épaisseur et WALL_HEIGHT de hauteur.
 *
 * Carte du labyrinthe :
 *   1 = mur
 *   0 = couloir
 *   S = départ du joueur
 *   E = sortie
 */
export class Labyrinth {
  // Dimensions d'une cellule
  static CELL_SIZE = 4
  static WALL_HEIGHT = 3
  static WALL_THICKNESS = 0.4

  // Carte du labyrinthe (0=couloir, 1=mur, S=start, E=exit)
  static MAP = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 'S',0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1],
    [1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1],
    [1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1],
    [1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0,'E',1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ]

  constructor(scene, wallMaterial, floorMaterial) {
    this.scene = scene
    this.wallMaterial = wallMaterial
    this.floorMaterial = floorMaterial

    // Boîtes de collision des murs (liste de THREE.Box3)
    this.wallBoxes = []

    // Position de départ et de sortie
    this.startPosition = new THREE.Vector3()
    this.exitPosition = new THREE.Vector3()

    // Mesh de la sortie (pour la détecter)
    this.exitMesh = null

    this._build()
  }

  /**
   * Convertit une coordonnée de grille en coordonnée monde
   */
  _gridToWorld(col, row) {
    const C = Labyrinth.CELL_SIZE
    const cols = Labyrinth.MAP[0].length
    const rows = Labyrinth.MAP.length
    return new THREE.Vector3(
      (col - cols / 2) * C,
      0,
      (row - rows / 2) * C
    )
  }

  /**
   * Construit la géométrie du labyrinthe (sol + murs)
   */
  _build() {
    const map = Labyrinth.MAP
    const rows = map.length
    const cols = map[0].length
    const C = Labyrinth.CELL_SIZE
    const H = Labyrinth.WALL_HEIGHT

    // --- Sol global ---
    const floorGeo = new THREE.PlaneGeometry(cols * C, rows * C)
    const floor = new THREE.Mesh(floorGeo, this.floorMaterial)
    floor.rotation.x = -Math.PI / 2
    floor.receiveShadow = true
    this.scene.add(floor)

    // --- Plafond (optionnel, aide à l'immersion) ---
    const ceilGeo = new THREE.PlaneGeometry(cols * C, rows * C)
    const ceilMat = new THREE.MeshStandardMaterial({ color: 0x222222, side: THREE.BackSide })
    const ceil = new THREE.Mesh(ceilGeo, ceilMat)
    ceil.rotation.x = Math.PI / 2
    ceil.position.y = H
    this.scene.add(ceil)

    // --- Murs ---
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const cell = map[row][col]

        if (cell === 1) {
          this._createWall(col, row)
        } else if (cell === 'S') {
          const pos = this._gridToWorld(col, row)
          this.startPosition.set(pos.x, 1.7, pos.z) // hauteur yeux
        } else if (cell === 'E') {
          const pos = this._gridToWorld(col, row)
          this.exitPosition.copy(pos)
          this._createExit(col, row)
        }
      }
    }
  }

  /**
   * Crée un mur à la position grille (col, row)
   */
  _createWall(col, row) {
    const C = Labyrinth.CELL_SIZE
    const H = Labyrinth.WALL_HEIGHT

    const geo = new THREE.BoxGeometry(C, H, C)
    const wall = new THREE.Mesh(geo, this.wallMaterial)

    const pos = this._gridToWorld(col, row)
    wall.position.set(pos.x, H / 2, pos.z)
    wall.castShadow = true
    wall.receiveShadow = true

    this.scene.add(wall)

    // Boîte de collision légèrement réduite
    const box = new THREE.Box3().setFromObject(wall)
    this.wallBoxes.push(box)
  }

  /**
   * Crée le marqueur de sortie (plan vert lumineux au sol)
   */
  _createExit(col, row) {
    const C = Labyrinth.CELL_SIZE
    const geo = new THREE.PlaneGeometry(C * 0.9, C * 0.9)
    const mat = new THREE.MeshStandardMaterial({
      color: 0x00ff88,
      emissive: 0x00ff88,
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0.85,
    })
    const exit = new THREE.Mesh(geo, mat)
    exit.rotation.x = -Math.PI / 2
    const pos = this._gridToWorld(col, row)
    exit.position.set(pos.x, 0.05, pos.z)
    this.scene.add(exit)
    this.exitMesh = exit
  }

  /**
   * Vérifie si une sphère (position + rayon) entre en collision avec un mur.
   * Retourne le vecteur de correction à appliquer, ou null si pas de collision.
   */
  checkCollision(position, radius) {
    const playerBox = new THREE.Box3(
      new THREE.Vector3(position.x - radius, position.y - 1.5, position.z - radius),
      new THREE.Vector3(position.x + radius, position.y + 0.5, position.z + radius)
    )

    for (const wallBox of this.wallBoxes) {
      if (playerBox.intersectsBox(wallBox)) {
        return true
      }
    }
    return false
  }

  /**
   * Vérifie si le joueur a atteint la sortie
   */
  isAtExit(position) {
    const C = Labyrinth.CELL_SIZE
    const dx = Math.abs(position.x - this.exitPosition.x)
    const dz = Math.abs(position.z - this.exitPosition.z)
    return dx < C * 0.6 && dz < C * 0.6
  }
}
