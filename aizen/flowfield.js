// aizen/flowfield.js - ABSOLUTE EXTREME Optimized Constellation Effect (WebGL 2 + Transform Feedback)

function initializeExtremeWebGLConstellation() {
    console.log("Initializing ABSOLUTE EXTREME Optimized Constellation Effect (WebGL 2 + TF)...");
    const functionName = 'initializeExtremeWebGLConstellation'; // For error messages
    try {
        const canvas = document.getElementById('particle-canvas');
        if (!canvas) throw new Error("Canvas element #particle-canvas not found!");

        // --- Require WebGL 2 ---
        const gl = canvas.getContext('webgl2');
        if (!gl) {
            throw new Error("WebGL 2 is required for this effect but is not supported or enabled.");
        }
        console.log("WebGL 2 Context acquired.");

        // --- Configuration ---
        const numParticles = 200; // Can push higher with TF
        const particleRadius = 1.5; // Used for CPU boundary check approx
        const particleSize = 2.5;   // Used for gl_PointSize
        const connectDistance = 90;
        const connectDistanceSq = connectDistance * connectDistance;
        const mouseConnectDistance = 150;
        const mouseConnectDistanceSq = mouseConnectDistance * mouseConnectDistance;

        // --- GLSL Shaders (WebGL 2) ---

        // Particle Update/Draw Shaders (with Transform Feedback outputs)
        const particleVS_TF = `#version 300 es
            precision highp float;

            // Input Attributes
            in vec2 a_position; // Current position
            in vec2 a_velocity; // Current velocity

            // Uniforms
            uniform vec2 u_resolution;
            uniform float u_deltaTime; // (Potentially use for frame-rate independent physics)
            uniform vec2 u_mousePos;
            uniform float u_mouseActive; // 0.0 or 1.0

            // Outputs for Transform Feedback
            out vec2 v_out_position;
            out vec2 v_out_velocity;

            // Constants
            const float particleRadius = ${(particleRadius).toFixed(1)}; // Approx check radius for physics
            const float MOUSE_REPEL_RADIUS_SQ = ${(mouseConnectDistance * 0.8 * mouseConnectDistance * 0.8).toFixed(1)}; // Slightly smaller repel radius
            const float MOUSE_REPEL_STRENGTH = 50.0;

            void main() {
                vec2 pos = a_position;
                vec2 vel = a_velocity;
                float width = u_resolution.x;
                float height = u_resolution.y;

                // --- Physics Update (on GPU) ---
                pos += vel; // * u_deltaTime; // Basic Euler integration - dt ignored for simplicity now

                // Boundary Checks & Bounce
                if (pos.x < particleRadius) { pos.x = particleRadius; vel.x *= -1.0; }
                else if (pos.x > width - particleRadius) { pos.x = width - particleRadius; vel.x *= -1.0; }
                if (pos.y < particleRadius) { pos.y = particleRadius; vel.y *= -1.0; }
                else if (pos.y > height - particleRadius) { pos.y = height - particleRadius; vel.y *= -1.0; }

                 // --- Mouse Repulsion (GPU) --- - Simpler version on GPU
                 if (u_mouseActive > 0.5) {
                     vec2 diff = pos - u_mousePos;
                     float distSq = dot(diff, diff);
                     if (distSq < MOUSE_REPEL_RADIUS_SQ && distSq > 0.1) {
                         float dist = sqrt(distSq);
                         vec2 repelDir = diff / dist;
                         // Force inversely proportional to distance (stronger closer)
                         float repelForce = MOUSE_REPEL_STRENGTH * (1.0 - dist / sqrt(MOUSE_REPEL_RADIUS_SQ));
                         // Apply force directly to velocity change this frame (scaled by approx dt)
                         vel += repelDir * repelForce * 0.016; // Apply small velocity change
                     }
                 }

                // --- Output for Transform Feedback ---
                v_out_position = pos;
                v_out_velocity = vel;

                // --- Output for Rendering ---
                vec2 zeroToOne = pos / u_resolution;
                vec2 zeroToTwo = zeroToOne * 2.0;
                vec2 clipSpace = zeroToTwo - 1.0;

                gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1); // Flip Y
                gl_PointSize = ${particleSize.toFixed(1)};
            }`;

        const particleFS_TF = `#version 300 es
            precision highp float;
            uniform vec4 u_color;
            out vec4 outColor;

            void main() {
              // Optional: Make points circular
              vec2 coord = gl_PointCoord - vec2(0.5);
              if(length(coord) > 0.5) { discard; }
              outColor = u_color;
            }`;

        // Line Shaders (Simple)
        const lineVS = `#version 300 es
            precision highp float;
            in vec2 a_position; // Line endpoint position
            uniform vec2 u_resolution;
            // If passing opacity per vertex:
            // in float a_opacity;
            // out float v_opacity;

            void main() {
              vec2 zeroToOne = a_position / u_resolution;
              vec2 zeroToTwo = zeroToOne * 2.0;
              vec2 clipSpace = zeroToTwo - 1.0;
              gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
              // if passing opacity: v_opacity = a_opacity;
            }`;

        const lineFS = `#version 300 es
            precision highp float;
            uniform vec4 u_color; // Base line color (RGB + Alpha)
            // If receiving opacity per vertex:
            // in float v_opacity;
            out vec4 outColor;

            void main() {
              // If using uniform alpha:
              outColor = u_color;
              // If using varying opacity:
              // outColor = vec4(u_color.rgb, u_color.a * v_opacity);
            }`;


        // --- WebGL Helper Functions ---
        function createShader(gl, type, source) {
            const shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                const info = gl.getShaderInfoLog(shader);
                gl.deleteShader(shader);
                throw new Error(`Shader compile error: ${info}`);
            }
            return shader;
        }

        function createProgram(gl, vsSource, fsSource, transformFeedbackVaryings = null) {
             const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
             const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);

             const program = gl.createProgram();
             gl.attachShader(program, vertexShader);
             gl.attachShader(program, fragmentShader);

            if (transformFeedbackVaryings && transformFeedbackVaryings.length > 0) {
                gl.transformFeedbackVaryings(
                    program,
                    transformFeedbackVaryings,
                    gl.SEPARATE_ATTRIBS // Use SEPARATE for distinct pos/vel buffers
                );
                console.log("Transform Feedback Varyings set:", transformFeedbackVaryings);
            }

             gl.linkProgram(program);

             // Check link status *before* detaching/deleting shaders
             if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
                 const info = gl.getProgramInfoLog(program);
                 gl.deleteProgram(program);
                 gl.deleteShader(vertexShader); // Cleanup shaders
                 gl.deleteShader(fragmentShader);
                 throw new Error(`Program link error: ${info}`);
             }

             // Detach and delete shaders *after* successful link
             gl.detachShader(program, vertexShader);
             gl.detachShader(program, fragmentShader);
             gl.deleteShader(vertexShader);
             gl.deleteShader(fragmentShader);

             console.log("Shader program created successfully.");
             return program;
         }


        // --- WebGL State & Programs ---
        const particleProgramTF = createProgram(gl, particleVS_TF, particleFS_TF, ['v_out_position', 'v_out_velocity']);
        const lineProgram = createProgram(gl, lineVS, lineFS);


        // --- Particle Shader Locations ---
        const particleAttribLocs = {
            position: gl.getAttribLocation(particleProgramTF, 'a_position'),
            velocity: gl.getAttribLocation(particleProgramTF, 'a_velocity'),
        };
        const particleUniformLocs = {
            resolution: gl.getUniformLocation(particleProgramTF, 'u_resolution'),
            color: gl.getUniformLocation(particleProgramTF, 'u_color'),
            mousePos: gl.getUniformLocation(particleProgramTF, 'u_mousePos'),
            mouseActive: gl.getUniformLocation(particleProgramTF, 'u_mouseActive'),
            deltaTime: gl.getUniformLocation(particleProgramTF, 'u_deltaTime'),
        };

        // --- Line Shader Locations ---
        const lineAttribLocs = { position: gl.getAttribLocation(lineProgram, 'a_position') };
        const lineUniformLocs = {
            resolution: gl.getUniformLocation(lineProgram, 'u_resolution'),
            color: gl.getUniformLocation(lineProgram, 'u_color'),
        };

        // --- Buffers & Vertex Array Objects (VAOs) ---
        const particleVAOs = [gl.createVertexArray(), gl.createVertexArray()];
        const particlePositionBuffers = [gl.createBuffer(), gl.createBuffer()];
        const particleVelocityBuffers = [gl.createBuffer(), gl.createBuffer()];
        const lineBuffer = gl.createBuffer();
        const lineVAO = gl.createVertexArray();

        // --- Transform Feedback Object ---
        const transformFeedback = gl.createTransformFeedback();

        // --- Setup Buffers and VAOs ---
        let currentRead = 0; // Index for read buffers/VAO (resource A)
        let currentWrite = 1; // Index for write buffers/VAO (resource B)

        // JS Typed Arrays for initial data and CPU sync/grid
        let particlePositions = new Float32Array(numParticles * 2);
        let particleVelocities = new Float32Array(numParticles * 2);

        // Allocate GPU buffer space and setup VAO bindings
        for (let i = 0; i < 2; ++i) {
            // Position Buffer
            gl.bindBuffer(gl.ARRAY_BUFFER, particlePositionBuffers[i]);
            gl.bufferData(gl.ARRAY_BUFFER, particlePositions.byteLength, gl.DYNAMIC_DRAW); // Allocate size

            // Velocity Buffer
            gl.bindBuffer(gl.ARRAY_BUFFER, particleVelocityBuffers[i]);
            gl.bufferData(gl.ARRAY_BUFFER, particleVelocities.byteLength, gl.DYNAMIC_DRAW);

            // Setup VAO for reading from this set of buffers
            gl.bindVertexArray(particleVAOs[i]);

            // Bind position buffer to VAO attribute 0
            gl.bindBuffer(gl.ARRAY_BUFFER, particlePositionBuffers[i]);
            gl.enableVertexAttribArray(particleAttribLocs.position);
            gl.vertexAttribPointer(particleAttribLocs.position, 2, gl.FLOAT, false, 0, 0);

            // Bind velocity buffer to VAO attribute 1
            gl.bindBuffer(gl.ARRAY_BUFFER, particleVelocityBuffers[i]);
            gl.enableVertexAttribArray(particleAttribLocs.velocity);
            gl.vertexAttribPointer(particleAttribLocs.velocity, 2, gl.FLOAT, false, 0, 0);
        }
        gl.bindVertexArray(null); // Unbind VAO

         // Setup Line VAO (only needs position)
         gl.bindVertexArray(lineVAO);
         gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer); // Bind line buffer for attribute setup
         gl.enableVertexAttribArray(lineAttribLocs.position);
         gl.vertexAttribPointer(lineAttribLocs.position, 2, gl.FLOAT, false, 0, 0);
         gl.bindVertexArray(null); // Unbind VAO
         gl.bindBuffer(gl.ARRAY_BUFFER, null); // Unbind buffer


        // --- Grid Optimization Data ---
        const cellSize = Math.max(connectDistance, 50);
        let grid = [];
        let numCols, numRows;

        // --- Other State ---
        let animationFrameId = null;
        let lastTimestamp = 0;
        let mouseX = null;
        let mouseY = null;
        let canvasRect = canvas.getBoundingClientRect();
        let particleColor = [0, 0, 0, 1];
        let lineColor = [0, 0, 0, 1];

        // --- CPU Physics Sync & Grid/Line Calculation ---
        function updateCPUDataAndCalculateLines(width, height, currentMouseX, currentMouseY, deltaTime) {
            const MOUSE_REPEL_RADIUS_SQ = mouseConnectDistance * 0.8 * mouseConnectDistance * 0.8;
            const MOUSE_REPEL_STRENGTH = 50.0;
            const mouseActive = (currentMouseX !== null && currentMouseY !== null);

            // 1. Update CPU mirrored data (using same logic as shader)
            for (let i = 0; i < numParticles; i++) {
                const idx = i * 2;
                let x = particlePositions[idx];
                let y = particlePositions[idx + 1];
                let vx = particleVelocities[idx];
                let vy = particleVelocities[idx + 1];

                x += vx; // * deltaTime; // Apply velocity
                y += vy; // * deltaTime;

                // Boundary Checks (match shader)
                if (x < particleRadius) { x = particleRadius; vx *= -1.0; }
                else if (x > width - particleRadius) { x = width - particleRadius; vx *= -1.0; }
                if (y < particleRadius) { y = particleRadius; vy *= -1.0; }
                else if (y > height - particleRadius) { y = height - particleRadius; vy *= -1.0; }

                // Mouse Repulsion (match shader)
                if (mouseActive) {
                    const diffX = x - currentMouseX;
                    const diffY = y - currentMouseY;
                    const distSq = diffX * diffX + diffY * diffY;
                    if (distSq < MOUSE_REPEL_RADIUS_SQ && distSq > 0.1) {
                        const dist = Math.sqrt(distSq);
                        const repelDirX = diffX / dist;
                        const repelDirY = diffY / dist;
                        const repelForce = MOUSE_REPEL_STRENGTH * (1.0 - dist / Math.sqrt(MOUSE_REPEL_RADIUS_SQ));
                        vx += repelDirX * repelForce * 0.016; // Match shader approx scaling
                        vy += repelDirY * repelForce * 0.016;
                    }
                }

                particlePositions[idx] = x;
                particlePositions[idx + 1] = y;
                particleVelocities[idx] = vx;
                particleVelocities[idx + 1] = vy;
            }

            // 2. Populate Grid using updated CPU positions
            for (let i = 0; i < grid.length; i++) grid[i].length = 0;
            for (let i = 0; i < numParticles; i++) {
                const x = particlePositions[i * 2];
                const y = particlePositions[i * 2 + 1];
                const gridX = Math.max(0, Math.min(numCols - 1, Math.floor(x / cellSize)));
                const gridY = Math.max(0, Math.min(numRows - 1, Math.floor(y / cellSize)));
                grid[gridY * numCols + gridX].push(i); // Store index
            }

            // 3. Calculate Lines using Grid (based on CPU positions)
            const lines = [];
            const tempLineOpacities = []; // If calculating opacity for lines

            for (let i = 0; i < numParticles; i++) {
                const p1Idx = i;
                const p1x = particlePositions[p1Idx * 2];
                const p1y = particlePositions[p1Idx * 2 + 1];
                const p1GridX = Math.max(0, Math.min(numCols - 1, Math.floor(p1x / cellSize)));
                const p1GridY = Math.max(0, Math.min(numRows - 1, Math.floor(p1y / cellSize)));

                for (let ox = -1; ox <= 1; ox++) {
                    for (let oy = -1; oy <= 1; oy++) {
                        const checkGridX = p1GridX + ox;
                        const checkGridY = p1GridY + oy;
                        if (checkGridX >= 0 && checkGridX < numCols && checkGridY >= 0 && checkGridY < numRows) {
                            const cellParticles = grid[checkGridY * numCols + checkGridX];
                            for (let j = 0; j < cellParticles.length; j++) {
                                const p2Idx = cellParticles[j];
                                if (p1Idx >= p2Idx) continue; // Use index compare

                                const p2x = particlePositions[p2Idx * 2];
                                const p2y = particlePositions[p2Idx * 2 + 1];
                                const dx = p1x - p2x;
                                const dy = p1y - p2y;
                                const distSq = dx * dx + dy * dy;

                                if (distSq < connectDistanceSq) {
                                    lines.push(p1x, p1y, p2x, p2y);
                                    // Optionally calculate opacity here if needed later
                                    // const opacity = Math.max(0, 1.0 - distSq / connectDistanceSq);
                                    // tempLineOpacities.push(opacity, opacity);
                                }
                            }
                        }
                    }
                }
            }

            if (mouseActive) {
                const mouseGridX = Math.max(0, Math.min(numCols - 1, Math.floor(currentMouseX / cellSize)));
                const mouseGridY = Math.max(0, Math.min(numRows - 1, Math.floor(currentMouseY / cellSize)));
                for (let ox = -1; ox <= 1; ox++) {
                    for (let oy = -1; oy <= 1; oy++) {
                        const checkGridX = mouseGridX + ox;
                        const checkGridY = mouseGridY + oy;
                        if (checkGridX >= 0 && checkGridX < numCols && checkGridY >= 0 && checkGridY < numRows) {
                            const cellParticles = grid[checkGridY * numCols + checkGridX];
                            for (let i = 0; i < cellParticles.length; i++) {
                                const pIdx = cellParticles[i];
                                const px = particlePositions[pIdx * 2];
                                const py = particlePositions[pIdx * 2 + 1];
                                const dx = px - currentMouseX;
                                const dy = py - currentMouseY;
                                const distSq = dx * dx + dy * dy;
                                if (distSq < mouseConnectDistanceSq) {
                                    lines.push(px, py, currentMouseX, currentMouseY);
                                     // Optionally calculate opacity
                                    // const opacity = Math.max(0, 1.0 - distSq / mouseConnectDistanceSq);
                                    // tempLineOpacities.push(opacity, opacity);
                                }
                            }
                        }
                    }
                }
            }

            return new Float32Array(lines);
        }


        // --- Setup Function ---
        function setup() {
            console.log(`Setting up ${functionName}...`);
            if (animationFrameId) cancelAnimationFrame(animationFrameId);

            const width = canvas.clientWidth;
            const height = canvas.clientHeight;
            if (width === 0 || height === 0) {
                console.warn("Canvas dimensions are zero, skipping setup for now.");
                // Optionally schedule a retry
                // setTimeout(setup, 100);
                return;
            }
            canvas.width = width;
            canvas.height = height;
            canvasRect = canvas.getBoundingClientRect();

            // Setup Grid
            numCols = Math.ceil(width / cellSize);
            numRows = Math.ceil(height / cellSize);
            grid = Array(numCols * numRows).fill(null).map(() => []);

            // Initialize CPU particle data
            for (let i = 0; i < numParticles; i++) {
                const idx = i * 2;
                particlePositions[idx] = Math.random() * width;
                particlePositions[idx + 1] = Math.random() * height;
                particleVelocities[idx] = (Math.random() - 0.5) * 1.0; // Initial random velocity
                particleVelocities[idx + 1] = (Math.random() - 0.5) * 1.0;
            }

            // Upload initial data to *both* sets of GPU buffers
            for (let i = 0; i < 2; ++i) {
                gl.bindBuffer(gl.ARRAY_BUFFER, particlePositionBuffers[i]);
                gl.bufferSubData(gl.ARRAY_BUFFER, 0, particlePositions); // Use subData after initial allocation
                gl.bindBuffer(gl.ARRAY_BUFFER, particleVelocityBuffers[i]);
                gl.bufferSubData(gl.ARRAY_BUFFER, 0, particleVelocities);
            }
            gl.bindBuffer(gl.ARRAY_BUFFER, null);

            updateColors(); // Set initial colors based on theme

            currentRead = 0; // Start reading from buffer set 0
            currentWrite = 1;
            lastTimestamp = 0; // Reset timestamp for delta time

            console.log(`Extreme Setup complete. Canvas: ${width}x${height}, Grid: ${numCols}x${numRows}, Particles: ${numParticles}`);
            if (!animationFrameId) { // Start animation if not already running
                 animate(0); // Pass initial timestamp
            }
        }

        // --- Color Update Function ---
        function updateColors() {
             const isDarkMode = document.body.classList.contains('dark-mode');
             if (isDarkMode) {
                 particleColor = [1.0, 1.0, 1.0, 1.0]; // White Opaque
                 lineColor = [1.0, 1.0, 1.0, 0.35];   // White Transparent
             } else {
                 particleColor = [0.0, 0.0, 0.0, 1.0]; // Black Opaque
                 lineColor = [0.0, 0.0, 0.0, 0.25];   // Black Transparent
             }
             console.log("WebGL colors updated.");
         }

        // --- Animation Loop ---
        function animate(timestamp) {
             animationFrameId = requestAnimationFrame(animate); // Request next frame immediately

             const deltaTime = (timestamp - lastTimestamp) * 0.001; // Delta time in seconds
             lastTimestamp = timestamp;
             // Clamp deltaTime to avoid large jumps if tab was inactive
             const dt = Math.min(deltaTime, 0.05); // Max frame time 50ms (20fps min effective)


            const width = canvas.width;
            const height = canvas.height;
             if (width === 0 || height === 0) return; // Skip frame if canvas not ready


            // --- CPU Tasks (Sync & Line Calc) ---
            const lineVertices = updateCPUDataAndCalculateLines(width, height, mouseX, mouseY, dt);

            // --- GPU Tasks ---
            gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
            gl.clearColor(0, 0, 0, 0); // Transparent background
            gl.clear(gl.COLOR_BUFFER_BIT);

            // 1. Update particle state using Transform Feedback
            gl.useProgram(particleProgramTF);
            gl.bindVertexArray(particleVAOs[currentRead]); // READ from A

            // Set uniforms
            gl.uniform2f(particleUniformLocs.resolution, width, height);
            gl.uniform4fv(particleUniformLocs.color, particleColor); // Still need color for drawing pass
            gl.uniform2f(particleUniformLocs.mousePos, mouseX === null ? -1000 : mouseX, mouseY === null ? -1000 : mouseY);
            gl.uniform1f(particleUniformLocs.mouseActive, mouseX === null ? 0.0 : 1.0);
             //gl.uniform1f(particleUniformLocs.deltaTime, dt); // Pass delta time if shader uses it

            // Bind TF and WRITE buffers (B)
            gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, transformFeedback);
            gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, particlePositionBuffers[currentWrite]); // Write Position to B
            gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 1, particleVelocityBuffers[currentWrite]); // Write Velocity to B

            // Execute TF update pass (no rendering)
            gl.enable(gl.RASTERIZER_DISCARD);
            gl.beginTransformFeedback(gl.POINTS);
            gl.drawArrays(gl.POINTS, 0, numParticles);
            gl.endTransformFeedback();
            gl.disable(gl.RASTERIZER_DISCARD);

            // Unbind TF buffers
            gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, null);
            gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 1, null);
            gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);

            // 2. Draw the updated particles (reading from B, which we just wrote to)
            gl.bindVertexArray(particleVAOs[currentWrite]); // Bind VAO for B
            // Uniforms already set from TF pass
            gl.drawArrays(gl.POINTS, 0, numParticles);


            // 3. Draw Lines (calculated by CPU)
            if (lineVertices.length > 0) {
                gl.useProgram(lineProgram);
                gl.bindVertexArray(lineVAO); // Use the line VAO

                // Upload new line data
                gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, lineVertices, gl.DYNAMIC_DRAW); // Update vertex data

                // Set uniforms
                gl.uniform2f(lineUniformLocs.resolution, width, height);
                gl.uniform4fv(lineUniformLocs.color, lineColor); // Use base line color with its alpha

                // Enable blending
                gl.enable(gl.BLEND);
                gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA); // Standard alpha blending

                gl.drawArrays(gl.LINES, 0, lineVertices.length / 2); // Draw lines

                gl.disable(gl.BLEND);
                gl.bindBuffer(gl.ARRAY_BUFFER, null); // Unbind line buffer
            }

            // Swap buffers for next frame
            currentRead = currentWrite; // The one we just wrote to (B) becomes the read buffer (A)
            currentWrite = (currentRead + 1) % 2; // The old read buffer (A) becomes the write buffer (B)


            gl.bindVertexArray(null); // Unbind VAO

            // animationFrameId = requestAnimationFrame(animate); // Moved to top for immediate request
        }

        // --- Event Handlers & Initial Setup ---
        const handleMouseMove = (event) => {
            canvasRect = canvas.getBoundingClientRect();
            mouseX = event.clientX - canvasRect.left;
            mouseY = event.clientY - canvasRect.top;
        };
        const handleMouseLeave = () => { mouseX = null; mouseY = null; };
        let resizeTimeout;
        const handleResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                console.log("Resizing WebGL canvas...");
                if (animationFrameId) { // Only reschedule setup if animation was running
                     cancelAnimationFrame(animationFrameId);
                     animationFrameId = null; // Prevent multiple loops if resize is rapid
                }
                setup(); // Re-run setup to adjust canvas/buffer sizes and grid
            }, 250); // Debounce resize
        };

        // Theme Toggle Observer
        const themeToggleBtnConst = document.getElementById('theme-toggle-btn');
        if (themeToggleBtnConst) {
            const themeObserver = new MutationObserver(updateColors); // Just update colors
            themeObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });
        } else { console.warn("Theme toggle button not found."); }

        // --- Start ---
        setup(); // Initial setup and start animation
        window.addEventListener('resize', handleResize);
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseleave', handleMouseLeave);

        console.log("EXTREME Optimized WebGL 2 Constellation effect initialization complete.");

    } catch (error) {
        console.error(`Error initializing ${functionName}:`, error);
        // Display user-friendly error message
        const canvasElement = document.getElementById('particle-canvas');
        if (canvasElement) {
            try {
                canvasElement.style.display = 'none';
                const errorDiv = document.createElement('div');
                errorDiv.textContent = `Error: Could not initialize background effect. ${error.message}`;
                errorDiv.style.color = 'red';
                errorDiv.style.textAlign = 'center';
                errorDiv.style.padding = '20px';
                canvasElement.parentNode.insertBefore(errorDiv, canvasElement.nextSibling);
            } catch (displayError) {
                 console.error("Could not display error message in DOM.", displayError);
            }
        }
    }
}

// Make function globally available
// Ensure home.js calls initializeExtremeWebGLConstellation() 