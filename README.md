# Labyrinth 3D

Un jeu de labyrinthe en vue à la première personne, entièrement développé en JavaScript avec Three.js.

---

## C'est quoi ce projet ?

Le joueur se retrouve dans un labyrinthe vu de l'intérieur et doit trouver la sortie le plus vite possible. Il y a trois niveaux de difficulté, un chronomètre, et un menu pause.

---

## Technologies utilisées

| Outil | Rôle |
|---|---|
| **Three.js** | Bibliothèque 3D — elle génère tous les murs, le sol et la caméra |
| **Vite** | Outil de développement — il lance un serveur local et compile le projet |
| **JavaScript ES Modules** | On découpe le code en plusieurs fichiers qui s'importent entre eux |
| **HTML / CSS** | Les menus (démarrage, pause, fin de partie) |

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
| `ESC` ou `Espace` | Pause |

---

## Structure des fichiers

```
labyrinth-3D/
│
├── index.html              → Page principale, contient tous les menus (HTML)
├── style.css               → Tout le style visuel des menus
│
└── src/
    ├── main.js             → Point d'entrée : relie tout entre eux, gère les états du jeu
    ├── scene.js            → Crée la scène 3D, la caméra, les lumières et les textures
    ├── ui.js               → Gère l'affichage des écrans (menu, pause, fin)
    │
    └── game/
        ├── maps.js         → Contient les 3 labyrinthes sous forme de tableaux 2D
        ├── Labyrinth.js    → Lit la map et construit les murs en 3D
        ├── Player.js       → Gère les déplacements et la détection de collisions
        └── Timer.js        → Gère le chronomètre (démarrage, pause, arrêt)
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
- `'E'` → sortie (marquée par une lumière verte au sol)

### 2. La construction 3D — Labyrinth.js

Le fichier `Labyrinth.js` parcourt ce tableau case par case. Chaque fois qu'il trouve un `1`, il place un cube 3D à la bonne position dans la scène. Le sol et le plafond sont générés en une seule grande surface plane.

### 3. Le joueur — Player.js

Le joueur est représenté par la caméra. Quand on appuie sur une touche, on déplace la caméra dans la direction correspondante. Avant chaque mouvement, on vérifie si la position d'arrivée est dans un mur : si oui, on annule le déplacement.

### 4. Les états du jeu — main.js

Le jeu peut être dans 4 états différents :

```
'start'   → menu principal affiché
'playing' → partie en cours, chrono qui tourne
'paused'  → pause, le labyrinthe reste visible en fond
'end'     → sortie trouvée, affichage du temps final
```

Chaque bouton ou touche fait passer d'un état à un autre.

### 5. Le chronomètre — Timer.js

Il démarre quand la partie commence, se met en pause avec ESC, et s'arrête quand le joueur atteint la sortie. Le temps final est affiché sur l'écran de fin.

---

## Les niveaux de difficulté

| Niveau | Taille de la grille | Particularité |
|---|---|---|
| Facile | 11×11 | Chemins directs, peu de faux passages |
| Normal | 15×15 | Plus de croisements, quelques détours |
| Difficile | 19×19 | Structure en serpentin avec de nombreux faux chemins |
