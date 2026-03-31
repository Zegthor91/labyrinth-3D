import * as THREE from 'three'
import { TAILLE_CASE } from './constants.js'

// Vérifie si le joueur touche un mur
export function verifCollision(listeMurs, position, rayon) {
  const boiteJoueur = new THREE.Box3(
    new THREE.Vector3(position.x - rayon, position.y - 1.5, position.z - rayon),
    new THREE.Vector3(position.x + rayon, position.y + 0.5, position.z + rayon)
  )
  for (const boiteMur of listeMurs) {
    if (boiteJoueur.intersectsBox(boiteMur)) return true
  }
  return false
}

// Vérifie si le joueur est arrivé à la sortie
export function estArriveSortie(posSortie, position) {
  const distX = Math.abs(position.x - posSortie.x)
  const distZ = Math.abs(position.z - posSortie.z)
  return distX < TAILLE_CASE * 0.6 && distZ < TAILLE_CASE * 0.6
}
