class FileManager {
    constructor() {
        this.fileTree = [];
        this.activeFile = null;
        this.contextMenu = null;
        
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initialize());
        } else {
            this.initialize();
        }
    }

    initialize() {
        this.setupFileTree();
        this.setupEventListeners();
        this.setupDragAndDrop();
        this.setupContextMenu();
        this.setupNewFileButton();
    }

    setupFileTree() {
        // Initial file structure
        this.fileTree = [
            {
                name: 'vscode-clone',
                type: 'folder',
                children: [
                    {
                        name: 'css',
                        type: 'folder',
                        children: [
                            { name: 'styles.css', type: 'file', content: '' },
                            { name: 'editor.css', type: 'file', content: '' },
                            { name: 'file-explorer.css', type: 'file', content: '' },
                            { name: 'terminal.css', type: 'file', content: '' },
                            { name: 'resizable.css', type: 'file', content: '' }
                        ]
                    },
                    {
                        name: 'js',
                        type: 'folder',
                        children: [
                            { name: 'vscode.js', type: 'file', content: '' },
                            { name: 'resizable.js', type: 'file', content: '' },
                            { name: 'file-manager.js', type: 'file', content: '' },
                            { name: 'terminal.js', type: 'file', content: '' },
                            { name: 'main.js', type: 'file', content: '' }
                        ]
                    },
                    { name: 'index.html', type: 'file', content: '' }
                ]
            }
        ];

        this.renderFileTree();
    }

    renderFileTree() {
        const sidebarContent = document.querySelector('.sidebar-content');
        if (!sidebarContent) {
            console.error('Sidebar content element not found');
            return;
        }

        sidebarContent.innerHTML = '';
        
        const renderItem = (item, level = 0) => {
            const itemElement = document.createElement('div');
            itemElement.className = `file-tree-item ${item.type} ${item === this.activeFile ? 'active' : ''}`;
            itemElement.style.paddingLeft = `${level * 15}px`;
            
            const icon = document.createElement('i');
            icon.className = this.getItemIcon(item);
            
            const name = document.createElement('span');
            name.textContent = item.name;
            
            itemElement.appendChild(icon);
            itemElement.appendChild(name);
            
            if (item.type === 'folder') {
                const toggle = document.createElement('i');
                toggle.className = 'fas fa-chevron-right toggle';
                itemElement.insertBefore(toggle, icon);
                
                toggle.addEventListener('click', (e) => {
                    e.stopPropagation();
                    itemElement.classList.toggle('expanded');
                    toggle.classList.toggle('fa-chevron-right');
                    toggle.classList.toggle('fa-chevron-down');
                });
                
                if (item.children) {
                    const childrenContainer = document.createElement('div');
                    childrenContainer.className = 'file-tree-children';
                    item.children.forEach(child => {
                        childrenContainer.appendChild(renderItem(child, level + 1));
                    });
                    itemElement.appendChild(childrenContainer);
                }
            }
            
            itemElement.addEventListener('click', () => this.handleItemClick(item));
            itemElement.addEventListener('contextmenu', (e) => this.showContextMenu(e, item));
            
            return itemElement;
        };

        this.fileTree.forEach(item => {
            sidebarContent.appendChild(renderItem(item));
        });
    }

    getItemIcon(item) {
        if (item.type === 'folder') {
            return 'fas fa-folder';
        }
        
        const extension = item.name.split('.').pop().toLowerCase();
        switch (extension) {
            case 'html':
                return 'fas fa-file-code';
            case 'css':
                return 'fas fa-file-code';
            case 'js':
                return 'fas fa-file-code';
            case 'json':
                return 'fas fa-file-code';
            case 'md':
                return 'fas fa-file-alt';
            default:
                return 'fas fa-file';
        }
    }

    handleItemClick(item) {
        if (item.type === 'file') {
            this.activeFile = item;
            this.renderFileTree();
            this.openFile(item);
        }
    }

    openFile(file) {
        const editor = document.querySelector('#monaco-editor');
        require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.36.1/min/vs' }});
        require(['vs/editor/editor.main'], function() {
            const monacoEditor = monaco.editor.create(editor, {
                value: file.content || '',
                language: this.getLanguageFromFileName(file.name),
                theme: 'vs-dark',
                automaticLayout: true,
                minimap: {
                    enabled: true
                }
            });

            monacoEditor.onDidChangeModelContent(() => {
                file.content = monacoEditor.getValue();
                this.updateTabTitle(file);
            });
        }.bind(this));
    }

    getLanguageFromFileName(filename) {
        const extension = filename.split('.').pop().toLowerCase();
        switch (extension) {
            case 'html':
                return 'html';
            case 'css':
                return 'css';
            case 'js':
                return 'javascript';
            case 'json':
                return 'json';
            case 'md':
                return 'markdown';
            default:
                return 'plaintext';
        }
    }

    updateTabTitle(file) {
        const tab = document.querySelector(`.editor-tab[data-file="${file.name}"]`);
        if (tab) {
            const isModified = file.content !== file.originalContent;
            tab.classList.toggle('modified', isModified);
        }
    }

    setupContextMenu() {
        // Create context menu element
        this.contextMenu = document.createElement('div');
        this.contextMenu.className = 'context-menu';
        document.body.appendChild(this.contextMenu);

        // Hide context menu when clicking outside
        document.addEventListener('click', () => {
            this.contextMenu.style.display = 'none';
        });

        // Prevent context menu from closing when clicking inside it
        this.contextMenu.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    showContextMenu(event, item) {
        event.preventDefault();
        
        // Position the context menu
        this.contextMenu.style.display = 'block';
        this.contextMenu.style.left = `${event.clientX}px`;
        this.contextMenu.style.top = `${event.clientY}px`;

        // Clear previous menu items
        this.contextMenu.innerHTML = '';

        // Add menu items based on item type
        if (item.type === 'folder') {
            this.addContextMenuItem('New File', 'fa-file', () => this.createNewFile(item));
            this.addContextMenuItem('New Folder', 'fa-folder-plus', () => this.createNewFolder(item));
        }
        
        this.addContextMenuItem('Rename', 'fa-edit', () => this.renameItem(item));
        this.addContextMenuItem('Delete', 'fa-trash', () => this.deleteItem(item));
    }

    addContextMenuItem(label, icon, action) {
        const menuItem = document.createElement('div');
        menuItem.className = 'context-menu-item';
        menuItem.innerHTML = `<i class="fas ${icon}"></i> ${label}`;
        menuItem.addEventListener('click', () => {
            action();
            this.contextMenu.style.display = 'none';
        });
        this.contextMenu.appendChild(menuItem);
    }

    createNewFile(parent) {
        const fileName = prompt('Enter file name:');
        if (!fileName) return;

        // Validate file name
        if (!this.isValidFileName(fileName)) {
            alert('Invalid file name. Please use only letters, numbers, underscores, and dots.');
            return;
        }

        // Check for duplicates
        if (this.fileExists(parent, fileName)) {
            alert('A file with this name already exists.');
            return;
        }

        const newFile = {
            name: fileName,
            type: 'file',
            content: '',
            parent: parent
        };

        if (!parent.children) {
            parent.children = [];
        }

        parent.children.push(newFile);
        this.renderFileTree();
        this.openFile(newFile);
    }

    createNewFolder(parent) {
        const folderName = prompt('Enter folder name:');
        if (!folderName) return;

        // Validate folder name
        if (!this.isValidFileName(folderName)) {
            alert('Invalid folder name. Please use only letters, numbers, and underscores.');
            return;
        }

        // Check for duplicates
        if (this.fileExists(parent, folderName)) {
            alert('A folder with this name already exists.');
            return;
        }

        const newFolder = {
            name: folderName,
            type: 'folder',
            children: [],
            parent: parent
        };

        if (!parent.children) {
            parent.children = [];
        }

        parent.children.push(newFolder);
        this.renderFileTree();
    }

    isValidFileName(name) {
        // Allow letters, numbers, underscores, dots, and hyphens
        return /^[a-zA-Z0-9_.-]+$/.test(name);
    }

    fileExists(parent, name) {
        return parent.children && parent.children.some(child => child.name === name);
    }

    renameItem(item) {
        const newName = prompt('Enter new name:', item.name);
        if (!newName || newName === item.name) return;

        // Validate new name
        if (!this.isValidFileName(newName)) {
            alert('Invalid name. Please use only letters, numbers, underscores, and dots.');
            return;
        }

        // Check for duplicates
        const parent = this.findParent(item);
        if (parent && this.fileExists(parent, newName)) {
            alert('An item with this name already exists.');
            return;
        }

        item.name = newName;
        this.renderFileTree();
    }

    deleteItem(item) {
        if (!confirm(`Are you sure you want to delete ${item.name}?`)) return;

        const parent = this.findParent(item);
        if (parent) {
            parent.children = parent.children.filter(child => child !== item);
            this.renderFileTree();
        }
    }

    findParent(item) {
        const findParentRecursive = (tree, target) => {
            for (const node of tree) {
                if (node.children) {
                    if (node.children.includes(target)) {
                        return node;
                    }
                    const found = findParentRecursive(node.children, target);
                    if (found) {
                        return found;
                    }
                }
            }
            return null;
        };

        return findParentRecursive(this.fileTree, item);
    }

    setupEventListeners() {
        const sidebarContent = document.querySelector('.sidebar-content');
        if (!sidebarContent) {
            console.error('Sidebar content element not found for event listeners');
            return;
        }

        // Add right-click event listener to file tree
        sidebarContent.addEventListener('contextmenu', (e) => {
            const itemElement = e.target.closest('.file-tree-item');
            if (itemElement) {
                const item = this.findItemByName(itemElement.dataset.name);
                if (item) {
                    this.showContextMenu(e, item);
                }
            }
        });

        // Add click event listener for file tree items
        sidebarContent.addEventListener('click', (e) => {
            const itemElement = e.target.closest('.file-tree-item');
            if (itemElement) {
                const item = this.findItemByName(itemElement.dataset.name);
                if (item) {
                    this.handleItemClick(item);
                }
            }
        });
    }

    findItemByName(name) {
        const findItemRecursive = (tree, targetName) => {
            for (const node of tree) {
                if (node.name === targetName) {
                    return node;
                }
                if (node.children) {
                    const found = findItemRecursive(node.children, targetName);
                    if (found) {
                        return found;
                    }
                }
            }
            return null;
        };

        return findItemRecursive(this.fileTree, name);
    }

    setupDragAndDrop() {
        const sidebar = document.querySelector('.sidebar');
        
        sidebar.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        });
        
        sidebar.addEventListener('drop', (e) => {
            e.preventDefault();
            const files = e.dataTransfer.files;
            
            for (const file of files) {
                this.handleDroppedFile(file);
            }
        });
    }

    handleDroppedFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const newFile = {
                name: file.name,
                type: 'file',
                content: e.target.result
            };
            
            // Add to root folder for now
            this.fileTree[0].children.push(newFile);
            this.renderFileTree();
        };
        
        reader.readAsText(file);
    }

    setupNewFileButton() {
        const sidebarContent = document.querySelector('.sidebar-content');
        if (!sidebarContent) {
            console.error('Sidebar content element not found for new file button');
            return;
        }

        const newFileButton = document.createElement('div');
        newFileButton.className = 'new-file-button';
        newFileButton.innerHTML = `
            <button class="file-operation-button">
                <i class="fas fa-plus"></i>
                New File
            </button>
        `;

        // Add the button at the top of the sidebar content
        if (sidebarContent.firstChild) {
            sidebarContent.insertBefore(newFileButton, sidebarContent.firstChild);
        } else {
            sidebarContent.appendChild(newFileButton);
        }

        newFileButton.addEventListener('click', () => {
            this.createNewFile(this.fileTree[0]); // Create in root directory
        });
    }
}

// Initialize the file manager when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.fileManager = new FileManager();
});

// Export the class for use in other files
window.FileManager = FileManager; 