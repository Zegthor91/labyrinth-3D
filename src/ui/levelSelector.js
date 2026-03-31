// Sélection du niveau
const levelBtns = document.querySelectorAll('.level-btn')
let _selectedLevel = 'normal' // par défaut

levelBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    levelBtns.forEach(b => b.classList.remove('active'))
    btn.classList.add('active')
    _selectedLevel = btn.dataset.level
  })
})

document.querySelector('[data-level="normal"]').classList.add('active')

export const getSelectedLevel = () => _selectedLevel
