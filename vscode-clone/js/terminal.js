class Terminal {
    constructor() {
        this.container = document.querySelector('.terminal-container');
        this.output = document.querySelector('.terminal-output');
        this.input = document.querySelector('.terminal-input');
        this.prompt = '>';
        this.commandHistory = [];
        this.historyIndex = -1;
        this.currentDirectory = '~';
        this.fileManager = window.fileManager; // Reference to the file manager instance
        this.setupTerminal();
    }

    setupTerminal() {
        this.input.addEventListener('keydown', (e) => this.handleKeyDown(e));
        this.input.addEventListener('input', () => this.handleInput());
        this.input.focus();
        
        // Initial welcome message
        this.writeOutput('VS Code Clone Terminal');
        this.writeOutput('Type "help" for available commands');
        this.writeOutput('');
        this.updatePrompt();
    }

    handleKeyDown(e) {
        switch (e.key) {
            case 'Enter':
                this.executeCommand(this.input.value);
                break;
            case 'ArrowUp':
                this.navigateHistory(-1);
                break;
            case 'ArrowDown':
                this.navigateHistory(1);
                break;
            case 'Tab':
                this.handleTabCompletion();
                break;
        }
    }

    handleInput() {
        // Handle input changes
    }

    executeCommand(command) {
        if (command.trim()) {
            this.commandHistory.push(command);
            this.historyIndex = this.commandHistory.length;
            
            this.writeOutput(`${this.prompt} ${command}`);
            
            const [cmd, ...args] = command.split(' ');
            switch (cmd.toLowerCase()) {
                case 'help':
                    this.showHelp();
                    break;
                case 'clear':
                    this.clearTerminal();
                    break;
                case 'cd':
                    this.changeDirectory(args[0]);
                    break;
                case 'ls':
                    this.listDirectory();
                    break;
                case 'mkdir':
                    this.createDirectory(args[0]);
                    break;
                case 'touch':
                    this.createFile(args[0]);
                    break;
                case 'rm':
                    this.removeItem(args[0]);
                    break;
                case 'cat':
                    this.showFileContent(args[0]);
                    break;
                default:
                    this.writeOutput(`Command not found: ${cmd}`);
            }
        }
        
        this.input.value = '';
        this.updatePrompt();
    }

    navigateHistory(direction) {
        if (this.commandHistory.length === 0) return;
        
        this.historyIndex = Math.max(0, Math.min(this.commandHistory.length, this.historyIndex + direction));
        
        if (this.historyIndex < this.commandHistory.length) {
            this.input.value = this.commandHistory[this.historyIndex];
        } else {
            this.input.value = '';
        }
    }

    handleTabCompletion() {
        const input = this.input.value.trim();
        const parts = input.split(' ');
        const lastPart = parts[parts.length - 1];
        
        if (lastPart) {
            const currentPath = this.currentDirectory === '~' ? '' : this.currentDirectory;
            const items = this.fileManager.getDirectoryContents(currentPath);
            
            const matches = items.filter(item => 
                item.name.toLowerCase().startsWith(lastPart.toLowerCase())
            );
            
            if (matches.length === 1) {
                parts[parts.length - 1] = matches[0].name;
                this.input.value = parts.join(' ');
            } else if (matches.length > 1) {
                this.writeOutput('\nPossible completions:');
                matches.forEach(match => {
                    const icon = match.type === 'folder' ? '📁' : this.getFileIcon(match.name);
                    this.writeOutput(`${icon} ${match.name}`);
                });
                this.writeOutput('');
                this.updatePrompt();
            }
        }
    }

    writeOutput(text) {
        const line = document.createElement('div');
        line.textContent = text;
        this.output.appendChild(line);
        this.output.scrollTop = this.output.scrollHeight;
    }

    updatePrompt() {
        this.prompt = `${this.currentDirectory} $`;
    }

    clearTerminal() {
        this.output.innerHTML = '';
    }

    showHelp() {
        this.writeOutput('Available commands:');
        this.writeOutput('  help          - Show this help message');
        this.writeOutput('  clear         - Clear the terminal');
        this.writeOutput('  cd <dir>      - Change directory');
        this.writeOutput('  ls            - List directory contents');
        this.writeOutput('  mkdir <dir>   - Create a new directory');
        this.writeOutput('  touch <file>  - Create a new file');
        this.writeOutput('  rm <item>     - Remove a file or directory');
        this.writeOutput('  cat <file>    - Show file contents');
    }

    changeDirectory(path) {
        if (!path) {
            this.currentDirectory = '~';
        } else if (path === '..') {
            const parts = this.currentDirectory.split('/');
            parts.pop();
            this.currentDirectory = parts.join('/') || '~';
        } else {
            try {
                const newPath = this.currentDirectory === '~' ? path : `${this.currentDirectory}/${path}`;
                if (this.fileManager.isDirectory(newPath)) {
                    this.currentDirectory = newPath;
                } else {
                    this.writeOutput(`Not a directory: ${path}`);
                    return;
                }
            } catch (error) {
                this.writeOutput(`Error: ${error.message}`);
                return;
            }
        }
        this.updatePrompt();
    }

    listDirectory() {
        const currentPath = this.currentDirectory === '~' ? '' : this.currentDirectory;
        const items = this.fileManager.getDirectoryContents(currentPath);
        
        if (items.length === 0) {
            this.writeOutput('Directory is empty');
            return;
        }

        // Group items by type
        const folders = items.filter(item => item.type === 'folder');
        const files = items.filter(item => item.type === 'file');

        // Display folders first
        folders.forEach(folder => {
            this.writeOutput(`📁 ${folder.name}/`);
        });

        // Then display files
        files.forEach(file => {
            const icon = this.getFileIcon(file.name);
            this.writeOutput(`${icon} ${file.name}`);
        });
    }

    getFileIcon(filename) {
        const extension = filename.split('.').pop().toLowerCase();
        switch (extension) {
            case 'html':
            case 'css':
            case 'js':
            case 'json':
                return '📄';
            case 'md':
                return '📝';
            default:
                return '📄';
        }
    }

    createDirectory(name) {
        if (!name) {
            this.writeOutput('Usage: mkdir <directory-name>');
            return;
        }

        try {
            const currentPath = this.currentDirectory === '~' ? '' : this.currentDirectory;
            this.fileManager.createNewFolder(currentPath, name);
            this.writeOutput(`Created directory: ${name}`);
        } catch (error) {
            this.writeOutput(`Error: ${error.message}`);
        }
    }

    createFile(name) {
        if (!name) {
            this.writeOutput('Usage: touch <file-name>');
            return;
        }

        try {
            const currentPath = this.currentDirectory === '~' ? '' : this.currentDirectory;
            this.fileManager.createNewFile(currentPath, name);
            this.writeOutput(`Created file: ${name}`);
        } catch (error) {
            this.writeOutput(`Error: ${error.message}`);
        }
    }

    removeItem(name) {
        if (!name) {
            this.writeOutput('Usage: rm <file-or-directory>');
            return;
        }

        try {
            const currentPath = this.currentDirectory === '~' ? '' : this.currentDirectory;
            const fullPath = currentPath ? `${currentPath}/${name}` : name;
            this.fileManager.deleteItem(fullPath);
            this.writeOutput(`Removed: ${name}`);
        } catch (error) {
            this.writeOutput(`Error: ${error.message}`);
        }
    }

    showFileContent(name) {
        if (!name) {
            this.writeOutput('Usage: cat <file-name>');
            return;
        }

        try {
            const currentPath = this.currentDirectory === '~' ? '' : this.currentDirectory;
            const fullPath = currentPath ? `${currentPath}/${name}` : name;
            const content = this.fileManager.getFileContent(fullPath);
            
            if (content) {
                this.writeOutput(`Content of ${name}:`);
                this.writeOutput('---');
                this.writeOutput(content);
                this.writeOutput('---');
            } else {
                this.writeOutput(`File is empty: ${name}`);
            }
        } catch (error) {
            this.writeOutput(`Error: ${error.message}`);
        }
    }
}

// Export the class for use in other files
window.Terminal = Terminal; 