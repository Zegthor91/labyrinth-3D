import * as THREE from 'three'
import { TAILLE_CASE, HAUTEUR_MUR } from './constants.js'
import { construireGeometrie, placerMur, placerDepart, placerSortie } from './builder.js'
import { construireEclairage } from './lighting.js'
import { verifCollision, estArriveSortie } from './physics.js'

export class Labyrinthe {
  static tailleCase = TAILLE_CASE
  static hauteurMur = HAUTEUR_MUR

  constructor(maScene, textureMur, textureSol, grille) {
    this.maScene = maScene
    this.textureMur = textureMur
    this.textureSol = textureSol
    this.grille = grille

    this.listeMurs = []
    this.posDepart = new THREE.Vector3()
    this.posSortie = new THREE.Vector3()
    this.tousLesObjets3D = []
    this.matBande = null
    this.matGrille = null

    this.construire()
  }

  // Convertit une position dans la grille (colonne, ligne)
  // en coordonnées réelles dans la scène 3D
  convertirPosition(colonne, ligne) {
    const taille = Labyrinthe.tailleCase
    const nbColonnes = this.grille[0].length
    const nbLignes = this.grille.length

    return new THREE.Vector3(
      (colonne - nbColonnes / 2) * taille,
      0,
      (ligne - nbLignes / 2) * taille
    )
  }

  construire() {
    construireGeometrie(this)
    construireEclairage(this)
  }

  placerMur(colonne, ligne) { placerMur(this, colonne, ligne) }
  placerDepart(colonne, ligne) { placerDepart(this, colonne, ligne) }
  placerSortie(colonne, ligne) { placerSortie(this, colonne, ligne) }

  verifCollision(position, rayon) { return verifCollision(this.listeMurs, position, rayon) }
  estArriveSortie(position) { return estArriveSortie(this.posSortie, position) }

  // Clignotement synchronisé : bandes + grille néon pulsent ensemble
  update(time) {
    if (!this.matBande) return
    const pulse = 0.75 + 0.25 * Math.sin(time * 2.8) * (0.8 + 0.2 * Math.sin(time * 9.1))
    this.matBande.emissiveIntensity = 1.8 * pulse
    if (this.matGrille) this.matGrille.opacity = 0.55 * pulse
  }

  // Supprime tous les objets 3D de la scène lorsque l'on change de labyrinth
  viderScene() {
    for (const objet of this.tousLesObjets3D) {
      this.maScene.remove(objet)
      if (objet.geometry) objet.geometry.dispose()
    }
    this.tousLesObjets3D = []
    this.listeMurs = []
    this.matBande = null
    this.matGrille = null
  }
}
