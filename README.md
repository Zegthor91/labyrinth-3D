# Labyrinth 3D

Un jeu de labyrinthe en vue à la première personne, entièrement développé en JavaScript avec Three.js.

---

## C'est quoi ce projet ?

Le joueur se retrouve dans un labyrinthe vu de l'intérieur et doit trouver la sortie le plus vite possible. Il y a trois niveaux de difficulté, un chronomètre, et un menu pause.

---

## Technologies utilisées

| Outil | Rôle |
|---|---|
| **Three.js** | Bibliothèque 3D — génère tous les murs, le sol, le plafond, les lumières et les effets visuels |
| **Three.js Postprocessing** | Pipeline de rendu avancé — SSAO (occlusion ambiante) et correction des couleurs |
| **PointerLockControls** | Addon Three.js — capture la souris pour la vue FPS (verrouillage du curseur) |
| **Vite** | Outil de développement — lance un serveur local et compile le projet |
| **JavaScript ES Modules** | On découpe le code en plusieurs fichiers qui s'importent entre eux |
| **Canvas API** | API native du navigateur — génère les textures de grille néon de manière procédurale |
| **HTML / CSS** | Les menus (démarrage, pause, fin de partie) avec animations `@keyframes` |

---

## Techniques utilisées

### Rendu 3D

| Technique | Détail |
|---|---|
| **MeshStandardMaterial** | Matériau PBR (Physically Based Rendering) — simule la façon dont la lumière interagit avec les surfaces selon leur rugosité (`roughness`) et leur aspect métallique (`metalness`) |
| **TextureLoader + RepeatWrapping** | Chargement de textures avec répétition — la même image est carrelée sur toute la surface du sol ou du plafond |
| **FogExp2** | Brouillard exponentiel — contrairement au brouillard linéaire, il s'épaissit de façon naturelle et progressive, ce qui renforce la profondeur des couloirs |
| **PlaneGeometry / BoxGeometry** | Primitives géométriques de base — le sol et le plafond sont de simples plans, les murs et les bandes lumineuses sont des boîtes |
| **AmbientLight + DirectionalLight + PointLight** | Trois types de lumières combinés — ambiante pour l'éclairage de base, directionnelle pour les ombres, ponctuelle pour les halos locaux |
| **Shadow mapping (PCFSoft)** | Technique de rendu des ombres douces — les murs projettent des ombres réalistes avec des bords légèrement flous |

### Post-processing

| Technique | Détail |
|---|---|
| **EffectComposer** | Orchestrateur du pipeline de post-traitement — les passes s'enchaînent dans l'ordre au lieu d'aller directement à l'écran |
| **SSAOPass** (Screen Space Ambient Occlusion) | Calcule en temps réel quelles zones de l'image sont "enfoncées" (coins, recoins) et les assombrit — donne du volume sans avoir besoin de lumières supplémentaires |
| **OutputPass** | Dernière étape du pipeline — convertit les couleurs dans l'espace colorimétrique sRGB pour un affichage correct sur écran |

### Logique de jeu

| Technique | Détail |
|---|---|
| **AABB Collision (Box3)** | Détection de collisions par boîtes englobantes alignées sur les axes — on crée une boîte autour du joueur et on vérifie si elle intersecte un mur |
| **Grille 2D → Scène 3D** | Conversion de coordonnées — la position `(colonne, ligne)` d'une case dans le tableau est convertie en coordonnées réelles `(x, z)` dans la scène Three.js |
| **State machine** | Machine à états (`start` / `playing` / `paused` / `end`) — chaque action du joueur ou du jeu fait passer d'un état à un autre de façon contrôlée |
| **Canvas Texture procédurale** | La grille néon sur les murs n'est pas une image externe — elle est dessinée en JavaScript avec l'API Canvas (`ctx.strokeStyle`, `ctx.beginPath`) puis convertie en texture Three.js via `CanvasTexture` |
| **Animation sinusoïdale** | L'effet de clignotement des bandes lumineuses est calculé avec deux fonctions `Math.sin()` superposées à des fréquences différentes — cela évite un clignotement mécanique et régulier |

---

## Installation et lancement

```bash
# Installer les dépendances
npm install

# Lancer le projet en local
npm run dev
```

Ensuite ouvrir le navigateur à l'adresse indiquée dans le terminal (généralement `http://localhost:5173`).

---

## Contrôles

| Touche | Action |
|---|---|
| `Z` `Q` `S` `D` | Se déplacer |
| Souris | Regarder autour |
| `V` | Basculer vue FPS / vue du dessus |
| `ESC` ou `Espace` | Pause |

---

## Structure des fichiers

```
labyrinth-3D/
│
├── index.html                   → Page principale, contient tous les menus (HTML)
├── style.css                    → Style visuel des menus + animation du fond du menu
│
├── dist/textures/               → Textures appliquées aux murs, au sol et au plafond
│
└── src/
    ├── main.js                  → Point d'entrée : relie tout, gère les états du jeu
    │
    ├── core/
    │   ├── scene.js             → Scène 3D, caméra et brouillard
    │   ├── renderer.js          → WebGLRenderer et configuration
    │   ├── lights.js            → Lumières (ambiante, directionnelle, ponctuelle)
    │   ├── postprocessing.js    → Pipeline SSAO (EffectComposer)
    │   └── events.js            → Redimensionnement de la fenêtre
    │
    ├── assets/
    │   └── materials.js         → Chargement des textures et matériaux PBR
    │
    ├── ui/
    │   ├── screens.js           → Affichage des écrans (menu, pause, fin)
    │   ├── levelSelector.js     → Sélection du niveau de difficulté
    │   └── index.js             → Re-exports
    │
    └── game/
        ├── maps.js              → Les 3 labyrinthes sous forme de tableaux 2D
        ├── Timer.js             → Chronomètre (démarrage, pause, arrêt)
        │
        ├── labyrinth/
        │   ├── constants.js     → Taille des cases et hauteur des murs
        │   ├── builder.js       → Construction du sol, plafond, murs et sortie
        │   ├── lighting.js      → Bandes néon et grille canvas sur les murs
        │   ├── physics.js       → Détection de collisions et de la sortie
        │   └── index.js         → Classe Labyrinthe (orchestre tout)
        │
        └── player/
            ├── constants.js     → Vitesse et rayon de collision
            ├── controls.js      → Écoute des touches clavier
            ├── movement.js      → Déplacement et gestion des collisions
            └── index.js         → Classe Player (orchestre tout)
```

---

## Comment fonctionne le jeu ?

### 1. La map — un simple tableau 2D

Chaque labyrinthe est représenté par un tableau de chiffres :

```js
[1, 1, 1, 1, 1]
[1,'S', 0, 0, 1]  ← 'S' = départ du joueur
[1, 1, 1, 0, 1]
[1, 0, 0,'E', 1]  ← 'E' = sortie
[1, 1, 1, 1, 1]
```

- `1` → un mur (un cube 3D sera créé ici)
- `0` → un couloir vide (on peut y marcher)
- `'S'` → point de départ
- `'E'` → sortie (discrètement marquée au sol)

### 2. La construction 3D — labyrinth/

Le dossier `labyrinth/` est découpé en responsabilités claires : `builder.js` parcourt le tableau case par case et place chaque cube 3D à la bonne position. Le sol et le plafond sont générés en une seule grande surface plane, chacun avec sa propre texture. La classe `Labyrinthe` dans `index.js` orchestre l'ensemble en appelant les fonctions de chaque fichier.

### 3. L'ambiance visuelle — textures, lumières et effets

Tout ce qui rend le labyrinthe immersif est construit automatiquement dans `labyrinth/lighting.js` à chaque nouvelle partie :

- **Textures** — chaque surface (murs, sol, plafond) a sa propre texture sci-fi chargée depuis `/dist/textures/`
- **Bandes lumineuses** — une ligne néon fine court le long de la base et du sommet de chaque mur, comme une installation électrique visible
- **Grille néon** — générée sur canvas, la grille est plaquée sur chaque face de mur pour rappeler l'esthétique digitale du menu principal
- **Clignotement** — les bandes et la grille pulsent ensemble via une animation sinusoïdale, donnant l'impression que le système électrique respire
- **Couleur selon la difficulté** — vert clair sur le niveau facile, jaune/orange sur le normal, rouge foncé sur le difficile

### 4. Le post-processing — core/postprocessing.js

Le rendu passe par un pipeline de post-traitement à trois étapes :

```
RenderPass → SSAOPass → OutputPass
```

- **RenderPass** — rendu classique de la scène
- **SSAOPass** (Screen Space Ambient Occlusion) — assombrit automatiquement les coins, les recoins et les zones encaissées, ce qui donne de la profondeur et du volume aux murs
- **OutputPass** — correction finale des couleurs (espace colorimétrique sRGB)

Le brouillard est exponentiel (`FogExp2`) : il s'épaissit progressivement avec la distance, ce qui renforce la perspective atmosphérique dans les couloirs.

### 5. Le joueur — player/

Le dossier `player/` sépare les responsabilités : `controls.js` écoute le clavier, `movement.js` calcule le déplacement et gère les collisions, `index.js` regroupe le tout dans la classe `Player`. Le joueur est représenté par la caméra — avant chaque mouvement, on vérifie si la position d'arrivée est dans un mur et on annule le déplacement si c'est le cas.

### 6. Les états du jeu — main.js

Le jeu peut être dans 4 états différents :

```
'start'   → menu principal affiché
'playing' → partie en cours, chrono qui tourne
'paused'  → pause, le labyrinthe reste visible en fond
'end'     → sortie trouvée, affichage du temps final
```

Chaque bouton ou touche fait passer d'un état à un autre.

### 7. Le chronomètre — Timer.js

Il démarre quand la partie commence, se met en pause avec ESC, et s'arrête quand le joueur atteint la sortie. Le temps final est affiché sur l'écran de fin.

---

## Les niveaux de difficulté

| Niveau | Taille de la grille | Couleur des lumières | Particularité |
|---|---|---|---|
| Facile | 11×11 | Vert clair | Chemins directs, peu de faux passages |
| Normal | 15×15 | Jaune / orange | Plus de croisements, quelques détours |
| Difficile | 19×19 | Rouge foncé | Structure en serpentin avec de nombreux faux chemins |

---

## Le menu principal

Le fond du menu est animé en CSS pur : une grille de carrés cyan défile en diagonale avec un effet de clignotement sur les traits, dans un style digital et néon. L'animation est entièrement gérée via des `@keyframes` CSS sans aucun JavaScript.
