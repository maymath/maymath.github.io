// Course script for handling sandbox functionality
document.addEventListener('DOMContentLoaded', () => {
    // Theme toggle functionality
    const themeToggle = document.querySelector('.theme-toggle');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Function to set theme
    const setTheme = (theme) => {
        document.body.classList.toggle('dark-theme', theme === 'dark');
        themeToggle.textContent = theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
        if (theme) {
            localStorage.setItem('theme', theme);
        } else {
            localStorage.removeItem('theme');
        }
    };

    // Initialize theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        setTheme(savedTheme);
    } else {
        setTheme(prefersDarkScheme.matches ? 'dark' : 'light');
    }

    // Theme toggle button click handler
    themeToggle.addEventListener('click', () => {
        const isDark = document.body.classList.contains('dark-theme');
        setTheme(isDark ? 'light' : 'dark');
    });

    // Listen for system theme changes
    prefersDarkScheme.addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            setTheme(e.matches ? 'dark' : 'light');
        }
    });

    // Sandbox functionality
    const initializeSandbox = (container) => {
        const editor = container.querySelector('.sandbox-code');
        const preview = container.querySelector('.sandbox-preview');
        const runButton = container.querySelector('.sandbox-run');
        const terminal = container.querySelector('.sandbox-terminal');

        if (!editor || !preview || !runButton) return;

        runButton.addEventListener('click', () => {
            const code = editor.value;
            validateAndRun(code, preview, terminal);
        });
    };

    // Initialize all sandboxes
    document.querySelectorAll('.sandbox-container').forEach(initializeSandbox);
}); 