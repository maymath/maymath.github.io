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

// Create and insert the taskbar
function createTaskbar() {
    console.log('Creating taskbar...');
    
    // Create taskbar container
    const taskbar = document.createElement('div');
    taskbar.className = 'taskbar';
    taskbar.style.cssText = `
        position: fixed;
        left: 0;
        top: 0;
        height: 100vh;
        width: 250px;
        z-index: 3000;
        background-color: #008055;
        box-shadow: 2px 0 4px rgba(0, 0, 0, 0.2);
    `;
    
    // Create taskbar content
    const taskbarContent = document.createElement('div');
    taskbarContent.className = 'taskbar-content';
    taskbarContent.style.cssText = `
        width: 100%;
        height: 100%;
        padding: 30px 0;
        display: flex;
        flex-direction: column;
        align-items: center;
    `;
    
    // Add logo/icon
    const taskbarIcon = document.createElement('div');
    taskbarIcon.className = 'taskbar-icon';
    taskbarIcon.innerHTML = '🎵'; // Music note icon
    taskbarIcon.style.cssText = `
        font-size: 32px;
        margin-bottom: 30px;
        color: #FFFFFF;
    `;
    taskbarContent.appendChild(taskbarIcon);
    
    // Add links
    taskbarConfig.links.forEach(link => {
        const a = document.createElement('a');
        a.href = link.href;
        a.textContent = link.text;
        a.style.cssText = `
            width: 100%;
            padding: 15px 10px;
            color: #FFFFFF;
            text-decoration: none;
            text-align: center;
            font-size: 1.1em;
            line-height: 1.4;
            word-wrap: break-word;
            white-space: normal;
        `;
        a.onmouseover = () => {
            a.style.backgroundColor = '#40e0d0';
            a.style.color = '#009966';
        };
        a.onmouseout = () => {
            a.style.backgroundColor = '';
            a.style.color = '#FFFFFF';
        };
        taskbarContent.appendChild(a);
    });
    
    // Assemble taskbar
    taskbar.appendChild(taskbarContent);
    
    // Add body padding
    document.body.style.paddingLeft = '250px';
    
    // Insert at the beginning of body
    document.body.insertBefore(taskbar, document.body.firstChild);
    console.log('Taskbar inserted into body');
}

// Initialize taskbar when DOM is loaded
document.addEventListener('DOMContentLoaded', createTaskbar); 