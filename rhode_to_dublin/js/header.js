// Configuration for the taskbar
const taskbarConfig = {
    links: [
        { text: 'Home', href: 'homepage.html' },
        { text: 'Who', href: 'who.html' },
        { text: 'Sunday Session', href: 'sunday_session.html' },
        { text: 'Visitors', href: 'visitors.html' },
        { text: 'Links', href: 'links.html' },
        { text: 'Something Old Something New', href: 'cd.html' }
    ]
};

// Create and insert the taskbar
function createTaskbar() {
    console.log('Creating taskbar...');
    
    // Create taskbar container
    const taskbar = document.createElement('div');
    taskbar.className = 'taskbar';
    
    // Create taskbar container for width transition
    const taskbarContainer = document.createElement('div');
    taskbarContainer.className = 'taskbar-container';
    
    // Create taskbar content
    const taskbarContent = document.createElement('div');
    taskbarContent.className = 'taskbar-content';
    
    // Add logo/icon
    const taskbarIcon = document.createElement('div');
    taskbarIcon.className = 'taskbar-icon';
    taskbarIcon.innerHTML = '🎵'; // Music note icon
    taskbarContent.appendChild(taskbarIcon);
    
    // Add links
    taskbarConfig.links.forEach(link => {
        const a = document.createElement('a');
        a.href = link.href;
        a.textContent = link.text;
        taskbarContent.appendChild(a);
    });
    
    // Assemble taskbar
    taskbarContainer.appendChild(taskbarContent);
    taskbar.appendChild(taskbarContainer);
    
    // Insert at the beginning of body
    document.body.insertBefore(taskbar, document.body.firstChild);
    console.log('Taskbar inserted into body');
}

// Initialize taskbar when DOM is loaded
document.addEventListener('DOMContentLoaded', createTaskbar); 