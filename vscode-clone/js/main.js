class CodeEditor {
    constructor() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initialize());
        } else {
            this.initialize();
        }
    }

    initialize() {
        this.editor = document.getElementById('monaco-editor');
        this.tabs = document.querySelector('.editor-tabs');
        this.content = document.querySelector('.editor-content');
        this.activeFile = null;
        this.files = new Map();

        if (this.editor && this.tabs && this.content) {
            this.setupEditor();
        } else {
            console.error('Required editor elements not found in the DOM:', {
                editor: !!this.editor,
                tabs: !!this.tabs,
                content: !!this.content
            });
        }
    }

    setupEditor() {
        require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.36.1/min/vs' }});
        require(['vs/editor/editor.main'], () => {
            this.monacoEditor = monaco.editor.create(this.editor, {
                value: '',
                language: 'javascript',
                theme: 'vs-dark',
                automaticLayout: true,
                minimap: {
                    enabled: true
                }
            });

            this.monacoEditor.onDidChangeModelContent(() => {
                this.updatePreview();
            });
        });
    }

    updatePreview() {
        if (this.activeFile && this.activeFile.endsWith('.html')) {
            const preview = document.querySelector('.preview-content');
            if (preview) {
                preview.srcdoc = this.monacoEditor.getValue();
            }
        }
    }

    openFile(fileName, content) {
        this.activeFile = fileName;
        this.files.set(fileName, content);
        
        if (this.monacoEditor) {
            const language = this.getLanguageFromFileName(fileName);
            this.monacoEditor.setValue(content);
            monaco.editor.setModelLanguage(this.monacoEditor.getModel(), language);
        }
    }

    getLanguageFromFileName(fileName) {
        if (!fileName) return 'plaintext';
        const extension = fileName.split('.').pop().toLowerCase();
        switch (extension) {
            case 'html': return 'html';
            case 'css': return 'css';
            case 'js': return 'javascript';
            default: return 'plaintext';
        }
    }

    saveFile() {
        if (this.activeFile && this.monacoEditor) {
            this.files.set(this.activeFile, this.monacoEditor.getValue());
        }
    }
}

// Initialize the editor when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.editor = new CodeEditor();
}); 