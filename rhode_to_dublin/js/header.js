// Configuration for the taskbar
const taskbarConfig = {
    links: [
        { text: 'Home', href: 'homepage.html' },
        { text: 'Who', href: 'who.html' },
        { text: 'Sunday Session', href: 'sunday_session.html' },
        { text: 'Visitors', href: 'visitors.html' },
        { text: 'Links', href: 'links.html' },
        { text: 'Something Old\nSomething New', href: 'cd.html' }
    ]
};

// Add header styles
const headerStyles = `
.taskbar {
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    width: 250px;
    z-index: 3000;
    background-color: #008055;
    box-shadow: 2px 0 4px rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease;
    min-width: 80px;
}

.taskbar-content {
    width: 100%;
    height: 100%;
    padding: 30px 0;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.taskbar-icon {
    font-size: 32px;
    margin-bottom: 30px;
    color: #FFFFFF;
}

.taskbar-image {
    width: 80%;
    max-width: 200px;
    margin: 20px 0;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.taskbar a {
    width: 100%;
    padding: 15px 10px;
    color: #FFFFFF;
    text-decoration: none;
    text-align: center;
    font-size: 1.1em;
    line-height: 1.4;
    word-wrap: break-word;
    white-space: normal;
    transition: all 0.3s ease;
}

.taskbar a:hover {
    background-color: #40e0d0;
    color: #009966;
}

@media (max-width: 768px) {
    .taskbar {
        width: 180px;
    }
    
    body {
        padding-left: 180px;
    }
    
    .taskbar-image {
        width: 90%;
        max-width: 160px;
    }
}

@media (max-width: 480px) {
    .taskbar {
        width: 120px;
    }
    
    body {
        padding-left: 120px;
    }
    
    .taskbar a {
        font-size: 1em;
        padding: 12px 8px;
    }
    
    .taskbar-image {
        width: 90%;
        max-width: 100px;
    }
}

@media (max-width: 320px) {
    .taskbar {
        width: 100px;
    }
    
    body {
        padding-left: 100px;
    }
    
    .taskbar-image {
        width: 90%;
        max-width: 80px;
    }
}
`;

// Create and append style element
const styleElement = document.createElement('style');
styleElement.textContent = headerStyles;
document.head.appendChild(styleElement);

// Function to update taskbar layout
function updateTaskbarLayout() {
    const taskbar = document.querySelector('.taskbar');
    const windowWidth = window.innerWidth;
    
    if (windowWidth <= 320) {
        taskbar.style.width = '100px';
        document.body.style.paddingLeft = '100px';
    } else if (windowWidth <= 480) {
        taskbar.style.width = '120px';
        document.body.style.paddingLeft = '120px';
    } else if (windowWidth <= 768) {
        taskbar.style.width = '180px';
        document.body.style.paddingLeft = '180px';
    } else {
        taskbar.style.width = '250px';
        document.body.style.paddingLeft = '250px';
    }
}

// Create and insert the taskbar
function createTaskbar() {
    const taskbar = document.createElement('div');
    taskbar.className = 'taskbar';
    
    const taskbarContent = document.createElement('div');
    taskbarContent.className = 'taskbar-content';
    
    const taskbarIcon = document.createElement('div');
    taskbarIcon.className = 'taskbar-icon';
    taskbarIcon.innerHTML = '🎼'; // Music note icon
    taskbarContent.appendChild(taskbarIcon);
    
    const links = [
        { text: 'Home', href: '/rhode_to_dublin/pages/homepage.html' },
        { text: 'Who', href: '/rhode_to_dublin/pages/who.html' },
        { text: 'Sunday Session at Fastnet Pub', href: '/rhode_to_dublin/pages/sunday_session.html' }
    ];
    
    // Add first half of links
    links.forEach(link => {
        const a = document.createElement('a');
        a.href = link.href;
        a.textContent = link.text;
        taskbarContent.appendChild(a);
    });
    
    // Add image in the middle
    const image = document.createElement('img');
    image.src = '/images/block2.jpg';
    image.alt = 'Rhode To Dublin';
    image.className = 'taskbar-image';
    taskbarContent.appendChild(image);
    
    // Add second half of links
    const remainingLinks = [
        { text: 'Interesting Visitors to the Fastnet Session', href: '/rhode_to_dublin/pages/visitors.html' },
        { text: 'Links', href: '/rhode_to_dublin/pages/links.html' },
        { text: 'Something Old\nSomething New', href: '/rhode_to_dublin/pages/cd.html' }
    ];
    
    remainingLinks.forEach(link => {
        const a = document.createElement('a');
        a.href = link.href;
        a.textContent = link.text;
        taskbarContent.appendChild(a);
    });
    
    taskbar.appendChild(taskbarContent);
    document.body.insertBefore(taskbar, document.body.firstChild);
    
    // Add resize event listener with debounce
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(updateTaskbarLayout, 100);
    });
    
    // Initial layout update
    updateTaskbarLayout();
}

// Initialize taskbar when DOM is loaded
document.addEventListener('DOMContentLoaded', createTaskbar); 