// Circular text animation configuration
const circularTextConfig = {
    size: 24,
    circleY: 0.75,
    circleX: 2,
    letter_spacing: 5,
    diameter: 10,
    rotation: 0.4,
    speed: 0.3
};

const initCircularText = (message = "Rhode To Dublin") => {
    const outerCircleText = document.getElementById('outerCircleText');
    if (!outerCircleText) return;

    // Create main text
    const msg = message.split('');
    const radius = Math.round(circularTextConfig.size * circularTextConfig.diameter * 0.208333);
    let currStep = 20;
    let ymouse = radius * circularTextConfig.circleY + 20;
    let xmouse = radius * circularTextConfig.circleX + 20;
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

    const makecircle = () => {
        currStep -= circularTextConfig.rotation;
        
        // Update main text
        for (let i = msg.length - 1; i > -1; --i) {
            const d = document.getElementById(`iemsg${i}`).style;
            d.top = Math.round(y[i] + radius * Math.sin((currStep + i) / circularTextConfig.letter_spacing) * circularTextConfig.circleY - 15) + 'px';
            d.left = Math.round(x[i] + radius * Math.cos((currStep + i) / circularTextConfig.letter_spacing) * circularTextConfig.circleX) + 'px';
        }
    };

    const drag = () => {
        // Update main text positions
        y[0] = Y[0] += (ymouse - Y[0]) * circularTextConfig.speed;
        x[0] = X[0] += (xmouse - 20 - X[0]) * circularTextConfig.speed;
        for (let i = msg.length - 1; i > 0; --i) {
            y[i] = Y[i] += (y[i-1] - Y[i]) * circularTextConfig.speed;
            x[i] = X[i] += (x[i-1] - X[i]) * circularTextConfig.speed;
        }
        
        makecircle();
    };

    const mouse = (e) => {
        ymouse = !isNaN(e.pageY) ? e.pageY : e.clientY;
        xmouse = !isNaN(e.pageX) ? e.pageX : e.clientX;
    };

    document.addEventListener('mousemove', mouse);
    setInterval(drag, 25);
};

export default initCircularText; 