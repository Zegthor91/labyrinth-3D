import * as THREE from 'three'
import { TAILLE_CASE, HAUTEUR_MUR } from './constants.js'

export function construireEclairage(lab) {
  const grille = lab.grille
  const nbLignes = grille.length
  const nbColonnes = grille[0].length
  const taille = TAILLE_CASE
  const hauteur = HAUTEUR_MUR

  // Couleur de la bande selon la difficulté
  let couleur
  if (nbLignes <= 12) couleur = 0x66ffaa
  else if (nbLignes <= 16) couleur = 0xffaa22
  else couleur = 0xcc1111

  // Matériau partagé par toutes les bandes
  lab.matBande = new THREE.MeshStandardMaterial({
    color: couleur,
    emissive: couleur,
    emissiveIntensity: 1.8,
    transparent: true,
    opacity: 0.95,
  })

  const voisins = [
    { dl: -1, dc: 0 },
    { dl: 1, dc: 0 },
    { dl: 0, dc: -1 },
    { dl: 0, dc: 1 },
  ]

  // Texture grille néon générée sur canvas
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const ctx = canvas.getContext('2d')
  const hex = '#' + couleur.toString(16).padStart(6, '0')
  ctx.clearRect(0, 0, 128, 128)
  ctx.strokeStyle = hex
  ctx.lineWidth = 1.8
  ctx.globalAlpha = 0.65
  const pas = 32
  for (let i = 0; i <= 128; i += pas) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 128); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(128, i); ctx.stroke()
  }
  const texGrille = new THREE.CanvasTexture(canvas)
  texGrille.wrapS = texGrille.wrapT = THREE.RepeatWrapping
  texGrille.repeat.set(2, 2)

  lab.matGrille = new THREE.MeshBasicMaterial({
    map: texGrille,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
    side: THREE.FrontSide,
  })

  // Rotation d'un plan selon la direction du mur voisin
  const rotationY = { '-10': 0, '10': Math.PI, '0-1': Math.PI / 2, '01': -Math.PI / 2 }

  // Pour chaque face mur-couloir : bande basse + bande haute + plan de grille
  for (let ligne = 0; ligne < nbLignes; ligne++) {
    for (let colonne = 0; colonne < nbColonnes; colonne++) {
      if (grille[ligne][colonne] === 1) continue

      const coords = lab.convertirPosition(colonne, ligne)

      for (const { dl, dc } of voisins) {
        const vl = ligne + dl
        const vc = colonne + dc
        if (vl < 0 || vl >= nbLignes || vc < 0 || vc >= nbColonnes) continue
        if (grille[vl][vc] !== 1) continue

        const sx = coords.x + dc * (taille / 2 - 0.03)
        const sz = coords.z + dl * (taille / 2 - 0.03)
        const geoW = dc !== 0 ? 0.05 : taille
        const geoD = dc !== 0 ? taille : 0.05

        const bandeBas = new THREE.Mesh(new THREE.BoxGeometry(geoW, 0.06, geoD), lab.matBande)
        bandeBas.position.set(sx, 0.06, sz)
        lab.maScene.add(bandeBas)
        lab.tousLesObjets3D.push(bandeBas)

        const bandeHaut = new THREE.Mesh(new THREE.BoxGeometry(geoW, 0.06, geoD), lab.matBande)
        bandeHaut.position.set(sx, hauteur - 0.06, sz)
        lab.maScene.add(bandeHaut)
        lab.tousLesObjets3D.push(bandeHaut)

        const plan = new THREE.Mesh(new THREE.PlaneGeometry(taille, hauteur), lab.matGrille)
        plan.position.set(sx, hauteur / 2, sz)
        plan.rotation.y = rotationY[`${dl}${dc}`]
        lab.maScene.add(plan)
        lab.tousLesObjets3D.push(plan)
      }
    }
  }
}
