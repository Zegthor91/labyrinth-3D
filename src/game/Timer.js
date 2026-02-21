/**
 * Timer - Gère le chronomètre du jeu
 */
export class Timer {
  constructor(displayElement) {
    this.displayElement = displayElement
    this._startTime = 0
    this._elapsed = 0
    this._running = false
  }

  /** Démarre le chronomètre */
  start() {
    this._startTime = performance.now()
    this._elapsed = 0
    this._running = true
    if (this.displayElement) this.displayElement.style.display = 'block'
  }

  /** Met le chronomètre en pause en conservant le temps écoulé */
  pause() {
    if (!this._running) return
    this._elapsed = performance.now() - this._startTime
    this._running = false
  }

  /** Reprend le chronomètre depuis le temps sauvegardé */
  resume() {
    if (this._running) return
    this._startTime = performance.now() - this._elapsed
    this._running = true
  }

  /** Arrête le chronomètre et retourne le temps écoulé en ms */
  stop() {
    if (!this._running) return this._elapsed
    this._elapsed = performance.now() - this._startTime
    this._running = false
    return this._elapsed
  }

  /** Remet le chronomètre à zéro */
  reset() {
    this._startTime = 0
    this._elapsed = 0
    this._running = false
    if (this.displayElement) {
      this.displayElement.textContent = '00:00'
      this.displayElement.style.display = 'none'
    }
  }

  /** Retourne le temps écoulé en ms */
  get elapsed() {
    if (this._running) return performance.now() - this._startTime
    return this._elapsed
  }

  /** Met à jour l'affichage (à appeler dans la boucle de rendu) */
  update() {
    if (!this._running) return
    if (this.displayElement) {
      this.displayElement.textContent = Timer.format(this.elapsed)
    }
  }

  /**
   * Formate un temps en ms en "MM:SS"
   * @param {number} ms
   * @returns {string}
   */
  static format(ms) {
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0')
    const seconds = (totalSeconds % 60).toString().padStart(2, '0')
    return `${minutes}:${seconds}`
  }
}
