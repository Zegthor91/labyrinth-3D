// ── Références DOM ────────────────────────────────────────────────────────────
export const ui = {
  startScreen:      document.getElementById('start-screen'),
  pauseScreen:      document.getElementById('pause-screen'),
  endScreen:        document.getElementById('end-screen'),
  finalTime:        document.getElementById('final-time'),
  crosshair:        document.getElementById('crosshair'),
  btnStart:         document.getElementById('btn-start'),
  btnRestart:       document.getElementById('btn-restart'),
  btnResume:        document.getElementById('btn-resume'),
  btnRestartPause:  document.getElementById('btn-restart-pause'),
  btnMenu:          document.getElementById('btn-menu'),
}

// ── Sélection du niveau ───────────────────────────────────────────────────────
const levelBtns = document.querySelectorAll('.level-btn')
let _selectedLevel = 'normal'

levelBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    levelBtns.forEach(b => b.classList.remove('active'))
    btn.classList.add('active')
    _selectedLevel = btn.dataset.level
  })
})

document.querySelector('[data-level="normal"]').classList.add('active')

export const getSelectedLevel = () => _selectedLevel

// ── Helpers d'affichage ───────────────────────────────────────────────────────
export function showStart() {
  ui.startScreen.style.display = 'flex'
  ui.pauseScreen.style.display = 'none'
  ui.endScreen.style.display   = 'none'
  ui.crosshair.style.display   = 'none'
}

export function showGame() {
  ui.startScreen.style.display = 'none'
  ui.pauseScreen.style.display = 'none'
  ui.endScreen.style.display   = 'none'
  ui.crosshair.style.display   = 'block'
}

export function showPause() {
  ui.pauseScreen.style.display = 'flex'
  ui.crosshair.style.display   = 'none'
}

export function hidePause() {
  ui.pauseScreen.style.display = 'none'
  ui.crosshair.style.display   = 'block'
}

export function showEnd(timeText) {
  ui.endScreen.style.display  = 'flex'
  ui.crosshair.style.display  = 'none'
  ui.finalTime.textContent    = timeText
}
