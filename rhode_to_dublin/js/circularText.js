// Circular text animation configuration
const circularTextConfig = {
    size: 24,
    circleY: 0.75,
    circleX: 2,
    letter_spacing: 5,
    diameter: 10,
    rotation: 0.05,
    speed: 0.1
};

// Reset all site data
const resetSiteData = () => {
    // Clear localStorage
    localStorage.clear();
    // Clear sessionStorage
    sessionStorage.clear();
    // Clear any cookies
    document.cookie.split(";").forEach(cookie => {
        document.cookie = cookie
            .replace(/^ +/, "")
            .replace(/=.*/, `=;expires=${new Date(0).toUTCString()};path=/`);
    });
};

const initCircularText = (message = "Rhode To Dublin") => {
    // Reset site data on load
    resetSiteData();

    const outerCircleText = document.getElementById('outerCircleText');
    if (!outerCircleText) return;

    // Clear any existing content
    outerCircleText.innerHTML = '';

    // Create main text
    const msg = message.split('');
    // Calculate radius based on message length
    const baseRadius = Math.round(circularTextConfig.size * circularTextConfig.diameter * 0.208333);
    const radius = baseRadius * (1 + (msg.length / 20)); // Adjust radius based on message length
    let currStep = 20;
    let ymouse = radius * circularTextConfig.circleY + 20;
    let xmouse = radius * circularTextConfig.circleX + 20;
    let lastMouseX = 0;
    let lastMouseY = 0;
    let velocityX = 0;
    let velocityY = 0;
    const y = [], x = [], Y = [], X = [];
    
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.top = '0';
    container.style.left = '0';
    container.style.fontSize = `${circularTextConfig.size}px`;
    container.style.fontStyle = 'italic';
    container.style.fontWeight = 'bold';
    container.style.fontFamily = "'comic sans ms', verdana, arial";
    container.style.color = '#40e0d0';
    container.style.zIndex = '3000';
    container.style.pointerEvents = 'none';
    container.style.userSelect = 'none';
    container.style.webkitUserSelect = 'none';
    container.style.mozUserSelect = 'none';
    container.style.msUserSelect = 'none';
    container.style.webkitTouchCallout = 'none';
    container.style.webkitTapHighlightColor = 'transparent';
    
    // Create character elements
    msg.forEach((char, i) => {
        const charElement = document.createElement('div');
        charElement.id = `iemsg${i}`;
        charElement.textContent = char;
        charElement.style.position = 'absolute';
        charElement.style.height = `${radius}px`;
        charElement.style.width = `${radius}px`;
        charElement.style.textAlign = 'center';
        charElement.style.pointerEvents = 'none';
        charElement.style.userSelect = 'none';
        charElement.style.webkitUserSelect = 'none';
        charElement.style.mozUserSelect = 'none';
        charElement.style.msUserSelect = 'none';
        charElement.style.webkitTouchCallout = 'none';
        charElement.style.webkitTapHighlightColor = 'transparent';
        container.appendChild(charElement);
        y[i] = x[i] = Y[i] = X[i] = 0;
    });

    outerCircleText.appendChild(container);

    // Add the same styles to the outer container
    outerCircleText.style.pointerEvents = 'none';
    outerCircleText.style.userSelect = 'none';
    outerCircleText.style.webkitUserSelect = 'none';
    outerCircleText.style.mozUserSelect = 'none';
    outerCircleText.style.msUserSelect = 'none';
    outerCircleText.style.webkitTouchCallout = 'none';
    outerCircleText.style.webkitTapHighlightColor = 'transparent';
    outerCircleText.style.position = 'fixed';
    outerCircleText.style.zIndex = 1000;

    const makecircle = () => {
        currStep -= circularTextConfig.rotation;
        
        // Calculate velocity influence
        const speed = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
        const direction = Math.atan2(velocityY, velocityX);
        
        // Update main text with velocity influence
        for (let i = msg.length - 1; i > -1; --i) {
            const d = document.getElementById(`iemsg${i}`).style;
            const progress = i / msg.length;
            
            // Base circular position with adjusted spacing for message length
            const spacing = circularTextConfig.letter_spacing * (1 + (msg.length / 40));
            const baseX = radius * Math.cos((currStep + i) / spacing) * circularTextConfig.circleX;
            const baseY = radius * Math.sin((currStep + i) / spacing) * circularTextConfig.circleY - 15;
            
            // Add velocity influence
            const velX = velocityX * progress * 0.5;
            const velY = velocityY * progress * 0.5;
            
            // Apply position with velocity influence
            d.top = Math.round(y[i] + baseY + velY) + 'px';
            d.left = Math.round(x[i] + baseX + velX) + 'px';
        }
    };

    const drag = () => {
        // Calculate velocity
        velocityX = (xmouse - lastMouseX) * 0.5;
        velocityY = (ymouse - lastMouseY) * 0.5;
        
        // Update last mouse position
        lastMouseX = xmouse;
        lastMouseY = ymouse;

        // Update main text positions with improved following
        y[0] = Y[0] += (ymouse - Y[0]) * circularTextConfig.speed;
        x[0] = X[0] += (xmouse - 20 - X[0]) * circularTextConfig.speed;
        
        // Improved trailing effect
        for (let i = msg.length - 1; i > 0; --i) {
            const progress = i / msg.length;
            y[i] = Y[i] += (y[i-1] - Y[i]) * (circularTextConfig.speed * (1 - progress * 0.5));
            x[i] = X[i] += (x[i-1] - X[i]) * (circularTextConfig.speed * (1 - progress * 0.5));
        }
        
        makecircle();
        requestAnimationFrame(drag);
    };

    const mouse = (e) => {
        ymouse = e.clientY;
        xmouse = e.clientX;
    };

    // Initialize at the center of the cursor
    document.addEventListener('mousemove', mouse);
    requestAnimationFrame(drag);

    // Cleanup on page unload
    window.addEventListener('unload', () => {
        document.removeEventListener('mousemove', mouse);
    });
};

export default initCircularText; 
