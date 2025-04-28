class VSCodeUI {
    constructor() {
        this.isMaximized = false;
        this.setupTitleBar();
        this.setupActivityBar();
        this.setupSidebar();
        this.setupEditor();
        this.setupPanel();
        this.setupStatusBar();
        this.setupCommandPalette();
        this.setupContextMenus();
        this.setupNotifications();
        this.setupTheme();
        this.setupResizablePanels();
    }

    setupTitleBar() {
        const minimizeBtn = document.querySelector('.title-bar-button.minimize');
        const maximizeBtn = document.querySelector('.title-bar-button.maximize');
        const closeBtn = document.querySelector('.title-bar-button.close');
        const titleBar = document.querySelector('.title-bar');

        // Add hover effects
        [minimizeBtn, maximizeBtn, closeBtn].forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                btn.style.backgroundColor = '#404040';
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.backgroundColor = 'transparent';
            });
        });

        // Special hover effect for close button
        closeBtn.addEventListener('mouseenter', () => {
            closeBtn.style.backgroundColor = '#e81123';
        });
        closeBtn.addEventListener('mouseleave', () => {
            closeBtn.style.backgroundColor = 'transparent';
        });

        minimizeBtn.addEventListener('click', () => {
            const container = document.querySelector('.editor-container');
            container.style.transform = 'scale(0.95)';
            container.style.opacity = '0.8';
            setTimeout(() => {
                container.style.transform = 'scale(1)';
                container.style.opacity = '1';
            }, 100);
        });

        maximizeBtn.addEventListener('click', () => {
            const container = document.querySelector('.editor-container');
            if (this.isMaximized) {
                container.style.maxHeight = '90vh';
                container.style.maxWidth = '90vw';
                container.style.margin = 'auto';
                container.style.borderRadius = '8px';
                maximizeBtn.textContent = '□';
            } else {
                container.style.maxHeight = '100vh';
                container.style.maxWidth = '100vw';
                container.style.margin = '0';
                container.style.borderRadius = '0';
                maximizeBtn.textContent = '❐';
            }
            this.isMaximized = !this.isMaximized;
        });

        closeBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to close the editor?')) {
                window.close();
            }
        });
    }

    setupActivityBar() {
        const items = document.querySelectorAll('.activity-bar-item');
        items.forEach(item => {
            // Add hover effects
            item.addEventListener('mouseenter', () => {
                if (!item.classList.contains('active')) {
                    item.style.backgroundColor = '#2d2d2d';
                }
            });
            item.addEventListener('mouseleave', () => {
                if (!item.classList.contains('active')) {
                    item.style.backgroundColor = 'transparent';
                }
            });

            item.addEventListener('click', () => {
                // Remove active class from all items
                items.forEach(i => {
                    i.classList.remove('active');
                    i.style.backgroundColor = 'transparent';
                });
                
                // Add active class to clicked item
                item.classList.add('active');
                item.style.backgroundColor = '#2d2d2d';
                
                // Handle the action
                const action = item.dataset.action;
                this.handleActivityBarAction(action);
            });
        });
    }

    handleActivityBarAction(action) {
        const sidebar = document.querySelector('.sidebar');
        const sidebarContent = document.querySelector('.sidebar-content');
        
        switch (action) {
            case 'toggleExplorer':
                sidebar.style.display = sidebar.style.display === 'none' ? 'flex' : 'none';
                if (sidebar.style.display === 'flex') {
                    sidebarContent.innerHTML = '<div class="file-explorer"></div>';
                    window.fileManager.renderFileTree();
                }
                break;
            case 'toggleSearch':
                sidebar.style.display = sidebar.style.display === 'none' ? 'flex' : 'none';
                if (sidebar.style.display === 'flex') {
                    sidebarContent.innerHTML = `
                        <div class="search-container">
                            <div class="search-input">
                                <input type="text" placeholder="Search files...">
                                <button class="search-button">
                                    <i class="fas fa-search"></i>
                                </button>
                            </div>
                            <div class="search-results"></div>
                        </div>
                    `;
                }
                break;
            case 'toggleSourceControl':
                sidebar.style.display = sidebar.style.display === 'none' ? 'flex' : 'none';
                if (sidebar.style.display === 'flex') {
                    sidebarContent.innerHTML = `
                        <div class="source-control">
                            <div class="source-control-header">
                                <button class="refresh-button">
                                    <i class="fas fa-sync"></i>
                                </button>
                                <span>Source Control</span>
                            </div>
                            <div class="changes-list"></div>
                        </div>
                    `;
                }
                break;
            case 'toggleDebug':
                sidebar.style.display = sidebar.style.display === 'none' ? 'flex' : 'none';
                if (sidebar.style.display === 'flex') {
                    sidebarContent.innerHTML = `
                        <div class="debug-container">
                            <div class="debug-header">
                                <button class="start-debugging">
                                    <i class="fas fa-play"></i>
                                    Start Debugging
                                </button>
                            </div>
                            <div class="debug-variables"></div>
                        </div>
                    `;
                }
                break;
            case 'toggleExtensions':
                sidebar.style.display = sidebar.style.display === 'none' ? 'flex' : 'none';
                if (sidebar.style.display === 'flex') {
                    sidebarContent.innerHTML = `
                        <div class="extensions-container">
                            <div class="extensions-search">
                                <input type="text" placeholder="Search extensions...">
                            </div>
                            <div class="extensions-list"></div>
                        </div>
                    `;
                }
                break;
        }
    }

    setupSidebar() {
        // Sidebar content will be populated by FileManager
    }

    setupEditor() {
        // Editor setup will be handled by CodeEditor class
    }

    setupPanel() {
        const tabs = document.querySelectorAll('.panel-tab');
        const terminalContainer = document.querySelector('.terminal-container');
        const previewContainer = document.querySelector('.preview-container');
        
        tabs.forEach(tab => {
            // Add hover effects
            tab.addEventListener('mouseenter', () => {
                if (!tab.classList.contains('active')) {
                    tab.style.backgroundColor = '#2d2d2d';
                }
            });
            tab.addEventListener('mouseleave', () => {
                if (!tab.classList.contains('active')) {
                    tab.style.backgroundColor = 'transparent';
                }
            });

            tab.addEventListener('click', () => {
                // Remove active class from all tabs
                tabs.forEach(t => {
                    t.classList.remove('active');
                    t.style.backgroundColor = 'transparent';
                });
                
                // Add active class to clicked tab
                tab.classList.add('active');
                tab.style.backgroundColor = '#2d2d2d';
                
                // Handle panel switching
                const panel = tab.dataset.panel;
                switch (panel) {
                    case 'terminal':
                        terminalContainer.style.display = 'flex';
                        previewContainer.style.display = 'none';
                        // Initialize terminal if not already done
                        if (!window.terminal) {
                            window.terminal = new Terminal();
                        }
                        break;
                    case 'preview':
                        terminalContainer.style.display = 'none';
                        previewContainer.style.display = 'flex';
                        // Update preview content
                        this.updatePreview();
                        break;
                }
            });
        });
    }

    updatePreview() {
        const previewContent = document.querySelector('.preview-content');
        const editor = window.editor;
        
        if (editor && editor.getValue()) {
            const content = editor.getValue();
            previewContent.srcdoc = `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { 
                            margin: 0; 
                            padding: 20px;
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                        }
                        iframe { 
                            border: none; 
                            width: 100%; 
                            height: 100%; 
                        }
                    </style>
                </head>
                <body>
                    ${content}
                </body>
                </html>
            `;
        } else {
            previewContent.srcdoc = `
                <div style="
                    padding: 20px;
                    color: #666;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                ">
                    No content to preview
                </div>
            `;
        }
    }

    setupStatusBar() {
        // Status bar items will be updated by various components
    }

    setupCommandPalette() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'P') {
                this.showCommandPalette();
            }
        });
    }

    showCommandPalette() {
        const palette = document.createElement('div');
        palette.className = 'command-palette';
        palette.innerHTML = `
            <div class="command-palette-input">
                <input type="text" placeholder="Type a command or search...">
            </div>
            <div class="command-palette-list">
                <!-- Commands will be populated here -->
            </div>
        `;
        document.body.appendChild(palette);
        palette.querySelector('input').focus();
    }

    setupContextMenus() {
        // Context menus will be added dynamically
    }

    setupNotifications() {
        // Notification system will be implemented
    }

    setupTheme() {
        // Theme management will be implemented
    }

    setupResizablePanels() {
        // Panel resizing will be handled by ResizablePanel class
    }

    // Activity Bar Actions
    toggleExplorer() {
        const sidebar = document.querySelector('.sidebar');
        sidebar.style.display = sidebar.style.display === 'none' ? 'flex' : 'none';
    }

    toggleSearch() {
        // Search functionality will be implemented
    }

    toggleSourceControl() {
        // Source control functionality will be implemented
    }

    toggleDebug() {
        // Debug functionality will be implemented
    }

    toggleExtensions() {
        // Extensions functionality will be implemented
    }
}

// Export the class for use in other files
window.VSCodeUI = VSCodeUI; 