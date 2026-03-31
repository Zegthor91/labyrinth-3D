import * as THREE from 'three'
import { TAILLE_CASE, HAUTEUR_MUR } from './constants.js'

export function construireGeometrie(lab) {
  const grille = lab.grille
  const nbLignes = grille.length
  const nbColonnes = grille[0].length
  const taille = TAILLE_CASE
  const hauteur = HAUTEUR_MUR

  // Répétition de la texture sur le sol selon la taille de la grille
  if (lab.textureSol.map) {
    lab.textureSol.map.repeat.set(nbColonnes, nbLignes)
    lab.textureSol.map.needsUpdate = true
  }

  // Création du sol
  const sol = new THREE.Mesh(
    new THREE.PlaneGeometry(nbColonnes * taille, nbLignes * taille),
    lab.textureSol
  )
  sol.rotation.x = -Math.PI / 2
  sol.receiveShadow = true
  lab.maScene.add(sol)
  lab.tousLesObjets3D.push(sol)

  // Chargement de la texture du plafond
  const texPlafond = new THREE.TextureLoader().load('/dist/textures/Sci_fi_Metal_Panel_005_basecolor.jpg')
  texPlafond.wrapS = texPlafond.wrapT = THREE.RepeatWrapping
  texPlafond.repeat.set(nbColonnes, nbLignes)
  const matPlafond = new THREE.MeshStandardMaterial({ map: texPlafond, roughness: 0.9, metalness: 0.1 })

  // Création du plafond
  const plafond = new THREE.Mesh(
    new THREE.PlaneGeometry(nbColonnes * taille, nbLignes * taille),
    matPlafond
  )
  plafond.rotation.x = Math.PI / 2
  plafond.position.y = hauteur
  lab.maScene.add(plafond)
  lab.tousLesObjets3D.push(plafond)

  // Parcours de la grille case par case
  for (let ligne = 0; ligne < nbLignes; ligne++) {
    for (let colonne = 0; colonne < nbColonnes; colonne++) {
      const caseActuelle = grille[ligne][colonne]
      if (caseActuelle === 1) placerMur(lab, colonne, ligne)
      else if (caseActuelle === 'S') placerDepart(lab, colonne, ligne)
      else if (caseActuelle === 'E') placerSortie(lab, colonne, ligne)
    }
  }
}

export function placerMur(lab, colonne, ligne) {
  const taille = TAILLE_CASE
  const hauteur = HAUTEUR_MUR

  const mur = new THREE.Mesh(
    new THREE.BoxGeometry(taille, hauteur, taille),
    lab.textureMur
  )
  const coords = lab.convertirPosition(colonne, ligne)
  mur.position.set(coords.x, hauteur / 2, coords.z)
  mur.castShadow = true
  mur.receiveShadow = true
  lab.maScene.add(mur)
  lab.tousLesObjets3D.push(mur)
  lab.listeMurs.push(new THREE.Box3().setFromObject(mur))
}

export function placerDepart(lab, colonne, ligne) {
  const coords = lab.convertirPosition(colonne, ligne)
  lab.posDepart.set(coords.x, 1.7, coords.z)
}

export function placerSortie(lab, colonne, ligne) {
  const taille = TAILLE_CASE

  const matSortie = new THREE.MeshStandardMaterial({
    color: 0x00ff88,
    emissive: 0x00ff88,
    emissiveIntensity: 0.08,
    transparent: true,
    opacity: 0.12,
  })

  const marqueur = new THREE.Mesh(
    new THREE.PlaneGeometry(taille * 0.9, taille * 0.9),
    matSortie
  )
  marqueur.rotation.x = -Math.PI / 2
  const coords = lab.convertirPosition(colonne, ligne)
  marqueur.position.set(coords.x, 0.05, coords.z)
  lab.maScene.add(marqueur)
  lab.tousLesObjets3D.push(marqueur)
  lab.posSortie.copy(coords)
}
