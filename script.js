const themeCheckbox = document.getElementById('theme-checkbox');
const modeText = document.getElementById('mode-text');
const body = document.body;

themeCheckbox.addEventListener('change', () => {
    if (themeCheckbox.checked) {
        body.classList.add('dark-mode');
        modeText.textContent = 'Dark mode';
    } else {
        body.classList.remove('dark-mode');
        modeText.textContent = 'Light mode';
    }
});
