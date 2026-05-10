const modeToggle = document.getElementById('mode-toggle');
const modeText = document.getElementById('mode-text');
const body = document.body;

modeToggle.addEventListener('change', () => {
    if (modeToggle.checked) {
        body.classList.add('dark-mode');
        modeText.textContent = 'Dark mode';
    } else {
        body.classList.remove('dark-mode');
        modeText.textContent = 'Light mode';
    }
});
