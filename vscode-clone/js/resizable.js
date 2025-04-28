class ResizablePanel {
    constructor() {
        this.panels = new Map();
        
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initialize());
        } else {
            this.initialize();
        }
    }

    initialize() {
        this.setupResizablePanels();
    }

    setupResizablePanels() {
        // Setup sidebar resizing
        const activityBar = document.querySelector('.activity-bar');
        const sidebar = document.querySelector('.sidebar');
        if (activityBar && sidebar && activityBar.parentNode) {
            this.setupResizableElement(activityBar, sidebar, 'horizontal');
        } else {
            console.warn('Activity bar or sidebar elements not found for resizing');
        }

        // Setup panel resizing
        const mainContent = document.querySelector('.main-content');
        const panelContainer = document.querySelector('.panel-container');
        if (mainContent && panelContainer && mainContent.parentNode) {
            this.setupResizableElement(mainContent, panelContainer, 'vertical');
        } else {
            console.warn('Main content or panel container elements not found for resizing');
        }

        // Setup editor split view
        this.setupSplitView();
    }

    setupResizableElement(element1, element2, direction) {
        if (!element1 || !element2 || !element1.parentNode) {
            console.error('Invalid elements for resizing:', { element1, element2 });
            return;
        }

        const resizer = document.createElement('div');
        resizer.className = `resizer ${direction}`;
        
        let isResizing = false;
        let startPosition = 0;
        let startSize = 0;

        const startResize = (e) => {
            isResizing = true;
            startPosition = direction === 'horizontal' ? e.clientX : e.clientY;
            startSize = direction === 'horizontal' ? element1.offsetWidth : element1.offsetHeight;
            document.body.style.cursor = direction === 'horizontal' ? 'ew-resize' : 'ns-resize';
        };

        const resize = (e) => {
            if (!isResizing) return;

            const currentPosition = direction === 'horizontal' ? e.clientX : e.clientY;
            const diff = currentPosition - startPosition;
            
            if (direction === 'horizontal') {
                const newWidth = startSize + diff;
                if (newWidth > 50 && newWidth < window.innerWidth - 100) {
                    element1.style.width = `${newWidth}px`;
                }
            } else {
                const newHeight = startSize + diff;
                if (newHeight > 50 && newHeight < window.innerHeight - 100) {
                    element1.style.height = `${newHeight}px`;
                }
            }
        };

        const stopResize = () => {
            isResizing = false;
            document.body.style.cursor = 'default';
        };

        resizer.addEventListener('mousedown', startResize);
        document.addEventListener('mousemove', resize);
        document.addEventListener('mouseup', stopResize);

        try {
            // Check if element2 is a sibling of element1
            if (element1.nextSibling === element2) {
                element1.parentNode.insertBefore(resizer, element2);
            } else {
                // If not siblings, append the resizer after element1
                element1.parentNode.insertBefore(resizer, element1.nextSibling);
            }
        } catch (error) {
            console.error('Error setting up resizer:', error);
        }
    }

    setupSplitView() {
        const editorContent = document.querySelector('.editor-content');
        const splitButton = document.createElement('div');
        splitButton.className = 'split-button';
        splitButton.innerHTML = '<i class="fas fa-columns"></i>';
        
        splitButton.addEventListener('click', () => {
            this.createSplitView(editorContent);
        });

        editorContent.appendChild(splitButton);
    }

    createSplitView(container) {
        const newEditor = document.createElement('div');
        newEditor.className = 'editor-split';
        newEditor.innerHTML = `
            <div class="editor-tabs"></div>
            <div class="editor-content">
                <div class="monaco-editor"></div>
            </div>
        `;

        container.style.display = 'flex';
        container.style.flexDirection = 'row';
        
        const originalEditor = container.querySelector('.editor-content');
        originalEditor.style.width = '50%';
        newEditor.style.width = '50%';

        container.appendChild(newEditor);
        
        // Setup resizer between split views
        this.setupResizableElement(originalEditor, newEditor, 'horizontal');
        
        // Initialize Monaco editor in the new split
        this.initializeMonacoEditor(newEditor.querySelector('.monaco-editor'));
    }

    initializeMonacoEditor(container) {
        require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.36.1/min/vs' }});
        require(['vs/editor/editor.main'], function() {
            const editor = monaco.editor.create(container, {
                value: '',
                language: 'javascript',
                theme: 'vs-dark',
                automaticLayout: true,
                minimap: {
                    enabled: true
                }
            });
        });
    }

    // Save and load panel states
    savePanelStates() {
        const states = {};
        this.panels.forEach((panel, id) => {
            states[id] = {
                width: panel.element.style.width,
                height: panel.element.style.height,
                isVisible: panel.element.style.display !== 'none'
            };
        });
        localStorage.setItem('panelStates', JSON.stringify(states));
    }

    loadPanelStates() {
        const states = JSON.parse(localStorage.getItem('panelStates') || '{}');
        Object.entries(states).forEach(([id, state]) => {
            const panel = this.panels.get(id);
            if (panel) {
                panel.element.style.width = state.width;
                panel.element.style.height = state.height;
                panel.element.style.display = state.isVisible ? 'flex' : 'none';
            }
        });
    }
}

// Initialize the resizable panel when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.resizablePanel = new ResizablePanel();
});

// Export the class for use in other files
window.ResizablePanel = ResizablePanel; 