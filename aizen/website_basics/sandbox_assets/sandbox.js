// Function to create terminal interface
function createTerminal() {
    const terminal = document.createElement('div');
    terminal.className = 'sandbox-terminal';

    // Create terminal header
    const header = document.createElement('div');
    header.className = 'terminal-header';
    
    // Add decorative dots
    const dots = document.createElement('div');
    dots.className = 'terminal-dots';
    ['red', 'yellow', 'green'].forEach(color => {
        const dot = document.createElement('div');
        dot.className = `terminal-dot ${color}`;
        dots.appendChild(dot);
    });
    
    // Add terminal title
    const title = document.createElement('div');
    title.className = 'terminal-title';
    title.textContent = 'sandbox-terminal';
    
    header.appendChild(dots);
    header.appendChild(title);
    
    // Add terminal content area
    const content = document.createElement('div');
    content.className = 'terminal-content';
    
    terminal.appendChild(header);
    terminal.appendChild(content);
    
    // Make sure the terminal is visible
    terminal.style.display = 'block';
    
    return terminal;
}

// Function to get formatted timestamp
function getTimestamp() {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { 
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

// Function to generate random process ID
function generatePID() {
    return Math.floor(Math.random() * 9000) + 1000;
}

// Function to add a line to the terminal
function addTerminalLine(terminal, type, text) {
    const content = terminal.querySelector('.terminal-content');
    if (!content) {
        console.error('Terminal content area not found');
        return;
    }
    
    const line = document.createElement('div');
    line.className = 'terminal-line';
    
    const timestamp = getTimestamp();
    let output;
    
    switch (type) {
        case 'command':
            const prompt = document.createElement('span');
            prompt.className = 'terminal-prompt';
            prompt.textContent = 'user@sandbox:~$ ';
            line.appendChild(prompt);
            
            if (text) {
                const command = document.createElement('span');
                command.className = 'terminal-command';
                command.textContent = text;
                line.appendChild(command);
            }
            break;
            
        case 'system':
            output = document.createElement('div');
            output.className = 'terminal-system';
            output.textContent = `[${timestamp}] ${text}`;
            line.appendChild(output);
            break;
            
        case 'error':
            output = document.createElement('div');
            output.className = 'terminal-error';
            output.textContent = `[${timestamp}] Error: ${text}`;
            line.appendChild(output);
            break;
            
        case 'success':
            output = document.createElement('div');
            output.className = 'terminal-success';
            output.textContent = text;
            line.appendChild(output);
            break;
            
        default:
            output = document.createElement('div');
            output.className = `terminal-${type}`;
            output.textContent = text;
            line.appendChild(output);
    }
    
    content.appendChild(line);
    content.scrollTop = content.scrollHeight;
    
    // Make sure the terminal is visible
    terminal.style.display = 'block';
}

// Function to clear terminal content
function clearTerminal(terminal) {
    const content = terminal.querySelector('.terminal-content');
    if (content) {
        content.innerHTML = '';
    }
}

// Function to initialize sandbox functionality
function initializeSandbox() {
    const sandboxContainers = document.querySelectorAll('.sandbox-container');
    
    sandboxContainers.forEach(container => {
        const editor = container.querySelector('.sandbox-code');
        const runButton = container.querySelector('.sandbox-run');
        const preview = container.querySelector('.sandbox-preview');
        const terminal = container.querySelector('.sandbox-terminal');
        
        if (editor && runButton && preview && terminal) {
            // Add initial terminal message
            addTerminalLine(terminal, 'system', 'Terminal initialized. Click "Run Code" to execute.');
            addTerminalLine(terminal, 'output', 'Ready for input...');
            
            // Set initial preview height
            preview.style.height = '300px';
            
            // Add run button event listener
            runButton.addEventListener('click', () => {
                clearTerminal(terminal);
                addTerminalLine(terminal, 'command', 'Running code...');
                validateAndRun(editor.value, preview, terminal);
            });
            
            // Add keyboard shortcut
            editor.addEventListener('keydown', function(e) {
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                    e.preventDefault();
                    clearTerminal(terminal);
                    addTerminalLine(terminal, 'command', 'Running code...');
                    validateAndRun(editor.value, preview, terminal);
                }
            });

            // Add auto-indent functionality
            editor.addEventListener('keydown', function(e) {
                if (e.key === 'Tab') {
                    e.preventDefault();
                    const start = this.selectionStart;
                    const end = this.selectionEnd;
                    this.value = this.value.substring(0, start) + '    ' + this.value.substring(end);
                    this.selectionStart = this.selectionEnd = start + 4;
                }
            });

            // Run once on load to show initial preview
            validateAndRun(editor.value, preview, terminal);
        }
    });
}

// Function to get line context
function getLineContext(code, lineNumber, contextLines = 2) {
    const lines = code.split('\n');
    const start = Math.max(0, lineNumber - contextLines - 1);
    const end = Math.min(lines.length, lineNumber + contextLines);
    let context = '';
    
    for (let i = start; i < end; i++) {
        const lineNum = (i + 1).toString().padStart(4, ' ');
        const pointer = i === lineNumber - 1 ? '>' : ' ';
        context += `${pointer} ${lineNum} | ${lines[i]}\n`;
        if (i === lineNumber - 1) {
            // Add error pointer
            const spacesBeforeError = lines[i].search(/\S/);
            context += `    ${' '.repeat(6)}| ${' '.repeat(spacesBeforeError)}${'~'.repeat(Math.max(1, lines[i].trim().length))}\n`;
        }
    }
    return context;
}

// Function to find closing tag position
function findClosingTag(code, openTagMatch) {
    const tagName = openTagMatch[0].match(/<([^ >]+)/)[1];
    const startPos = openTagMatch.index;
    const closeTagRegex = new RegExp(`</${tagName}>`, 'g');
    let expectedClosingTag = null;
    
    // Find all closing tags of this type
    let match;
    while ((match = closeTagRegex.exec(code)) !== null) {
        if (match.index > startPos) {
            expectedClosingTag = match;
            break;
        }
    }
    
    return expectedClosingTag ? expectedClosingTag.index : -1;
}

// Function to check HTML syntax in detail
function validateHTMLInDetail(code) {
    const errors = [];
    
    // Check DOCTYPE
    if (!code.includes('<!DOCTYPE html>')) {
        errors.push({
            line: 1,
            message: 'Missing DOCTYPE declaration'
        });
    }
    
    // Check for unclosed tags
    const lines = code.split('\n');
    const openTags = [];
    
    lines.forEach((line, index) => {
        // Find all opening and closing tags in the line
        const openMatches = line.match(/<[a-z][^>/\s]*(?:\s+[^>]*)?>/gi) || [];
        const closeMatches = line.match(/<\/[a-z][^>]*>/gi) || [];
        
        openMatches.forEach(tag => {
            const tagName = tag.match(/<([a-z][^>/\s]*)/i)[1].toLowerCase();
            if (!tag.endsWith('/>') && !['br', 'img', 'input', 'hr', 'meta', 'link'].includes(tagName)) {
                openTags.push({ tag: tagName, line: index + 1 });
            }
        });
        
        closeMatches.forEach(tag => {
            const tagName = tag.match(/<\/([a-z][^>]*)/i)[1].toLowerCase();
            const lastOpenTag = openTags[openTags.length - 1];
            
            if (lastOpenTag && lastOpenTag.tag === tagName) {
                openTags.pop();
            } else {
                errors.push({
                    line: index + 1,
                    message: `Unexpected closing tag </${tagName}>`
                });
            }
        });
    });
    
    // Report unclosed tags
    openTags.forEach(tag => {
        errors.push({
            line: tag.line,
            message: `Unclosed tag <${tag.tag}>`
        });
    });
    
    return errors;
}

// Function to check CSS syntax in detail
function validateCSSInDetail(css) {
    const errors = [];
    const lines = css.split('\n');
    let inRule = false;
    let bracketCount = 0;
    let lastPropertyLine = 0;
    
    lines.forEach((line, index) => {
        const lineNum = index + 1;
        const trimmedLine = line.trim();
        
        // Check for unmatched brackets
        const openBrackets = (trimmedLine.match(/{/g) || []).length;
        const closeBrackets = (trimmedLine.match(/}/g) || []).length;
        bracketCount += openBrackets - closeBrackets;
        
        if (trimmedLine.includes('{')) {
            inRule = true;
            
            // Check selector syntax
            if (!trimmedLine.match(/^[a-z0-9\s._#*+>[\]="\-:()]+{/i)) {
                errors.push({
                    line: lineNum,
                    message: 'Invalid selector syntax'
                });
            }
        }
        
        if (inRule && !trimmedLine.includes('{') && !trimmedLine.includes('}')) {
            // Check property syntax
            if (trimmedLine && !trimmedLine.match(/^[a-z\-]+:\s*[^;]+;?\s*$/i)) {
                errors.push({
                    line: lineNum,
                    message: 'Invalid property syntax'
                });
            }
            
            // Check for missing semicolons
            if (trimmedLine && !trimmedLine.endsWith(';') && !trimmedLine.endsWith('{')) {
                errors.push({
                    line: lineNum,
                    message: 'Missing semicolon'
                });
            }
            
            lastPropertyLine = lineNum;
        }
        
        if (trimmedLine.includes('}')) {
            inRule = false;
        }
    });
    
    // Check for unmatched brackets at the end
    if (bracketCount !== 0) {
        errors.push({
            line: lastPropertyLine,
            message: 'Unmatched brackets in CSS'
        });
    }
    
    return errors;
}

function displayErrorContext(terminal, code, lineNumber, message, type = 'error') {
    const lines = code.split('\n');
    const startLine = Math.max(1, lineNumber - 2);
    const endLine = Math.min(lines.length, lineNumber + 2);
    
    // Create the error display container
    const errorContainer = document.createElement('div');
    errorContainer.className = 'terminal-line';
    
    // Add the error message header
    const errorHeader = document.createElement('div');
    errorHeader.className = type === 'error' ? 'terminal-error-message' : 'terminal-warning-message';
    errorHeader.textContent = `${type === 'error' ? '✖' : '⚠'} ${message}`;
    errorContainer.appendChild(errorHeader);
    
    // Add the code context
    const codeContext = document.createElement('div');
    codeContext.className = 'terminal-code-context';
    
    for (let i = startLine - 1; i < endLine; i++) {
        const lineContent = lines[i] || '';
        const contextLine = document.createElement('div');
        contextLine.className = `context-line${i + 1 === lineNumber ? ' current' : ''}`;
        
        // Add line marker
        const marker = document.createElement('span');
        marker.className = i + 1 === lineNumber ? 'error-marker' : 'line-marker';
        marker.textContent = i + 1 === lineNumber ? '>' : ' ';
        contextLine.appendChild(marker);
        
        // Add line number
        const lineNum = document.createElement('span');
        lineNum.className = 'terminal-line-number';
        lineNum.textContent = String(i + 1).padStart(3, ' ');
        contextLine.appendChild(lineNum);
        
        // Add line content with syntax highlighting
        const content = document.createElement('span');
        content.className = 'line-content';
        content.textContent = lineContent;
        contextLine.appendChild(content);
        
        codeContext.appendChild(contextLine);
        
        // Add error pointer line if this is the error line
        if (i + 1 === lineNumber) {
            const pointerLine = document.createElement('div');
            pointerLine.className = 'context-line';
            
            const pointerMarker = document.createElement('span');
            pointerMarker.className = 'line-marker';
            pointerMarker.textContent = ' ';
            pointerLine.appendChild(pointerMarker);
            
            const pointerNum = document.createElement('span');
            pointerNum.className = 'terminal-line-number';
            pointerNum.textContent = '   ';
            pointerLine.appendChild(pointerNum);
            
            const pointer = document.createElement('span');
            pointer.className = 'terminal-error-pointer';
            const leadingSpaces = lineContent.match(/^\s*/)[0].length;
            pointer.textContent = ' '.repeat(leadingSpaces) + '~'.repeat(Math.max(1, lineContent.trim().length));
            pointerLine.appendChild(pointer);
            
            codeContext.appendChild(pointerLine);
        }
    }
    
    errorContainer.appendChild(codeContext);
    
    // Add to terminal content
    const terminalContent = terminal.querySelector('.terminal-content');
    if (terminalContent) {
        terminalContent.appendChild(errorContainer);
        terminalContent.scrollTop = terminalContent.scrollHeight;
    }
}

function validateAndRun(code, preview, terminal) {
    // Clear previous output
    clearTerminal(terminal);
    preview.srcdoc = '';
    
    // Add initial message
    addTerminalLine(terminal, 'system', 'Running code validation...');
    
    // Validate HTML
    const htmlErrors = validateHTMLInDetail(code);
    if (htmlErrors.length > 0) {
        htmlErrors.forEach(error => {
            displayErrorContext(terminal, code, error.line, error.message, 'error');
        });
        return;
    }
    
    // Extract and validate CSS
    const cssMatch = code.match(/<style>([\s\S]*?)<\/style>/);
    if (cssMatch) {
        const cssErrors = validateCSSInDetail(cssMatch[1]);
        if (cssErrors.length > 0) {
            cssErrors.forEach(error => {
                const cssStartLine = code.substring(0, code.indexOf('<style>')).split('\n').length;
                displayErrorContext(terminal, cssMatch[1], error.line, error.message, 'error');
            });
            return;
        }
    }
    
    // Show any warnings
    const warnings = [];
    if (!code.includes('<!DOCTYPE html>')) {
        warnings.push({
            line: 1,
            message: 'Consider adding a DOCTYPE declaration for better browser compatibility'
        });
    }
    
    warnings.forEach(warning => {
        displayErrorContext(terminal, code, warning.line, warning.message, 'warning');
    });
    
    // If no errors, run the code and show success message
    preview.srcdoc = code;
    addTerminalLine(terminal, 'success', '✓ Code validated successfully!');
    if (warnings.length === 0) {
        addTerminalLine(terminal, 'output', 'No warnings or errors found.');
    }
    
    // Add error handling for runtime errors in the preview
    const errorHandler = `
        <script>
            window.onerror = function(msg, url, line) {
                window.parent.postMessage({
                    type: 'error',
                    message: msg,
                    line: line,
                    pid: ${generatePID()}
                }, '*');
                return true;
            };
        </script>
    `;
    
    // Insert error handler at the end of the head section
    const modifiedCode = code.replace('</head>', `${errorHandler}</head>`);
    preview.srcdoc = modifiedCode;
}

// Listen for JavaScript errors from the preview iframe
window.addEventListener('message', function(event) {
    if (event.data.type === 'error') {
        const iframe = document.querySelector('.sandbox-preview');
        const terminal = iframe.closest('.sandbox-container').querySelector('.sandbox-terminal');
        addTerminalLine(terminal, 'error', `Runtime error in process [${event.data.pid}]: ${event.data.message} (Line: ${event.data.line})`);
    }
});

// Initialize all sandboxes when the page loads
document.addEventListener('DOMContentLoaded', initializeSandbox); 