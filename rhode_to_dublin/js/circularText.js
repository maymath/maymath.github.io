// Circular text animation configuration
const circularTextConfig = {
    msg: "Rhode To Dublin",
    size: 24,
    circleY: 0.75,
    circleX: 2,
    letter_spacing: 5,
    diameter: 10,
    rotation: 0.4,
    speed: 0.3
};

const smallTextConfig = {
    msg: "(made by AizenKai1001)",
    size: 12,
    circleY: 0.75,
    circleX: 2,
    letter_spacing: 5,
    diameter: 10,
    rotation: 0.4,
    speed: 0.3
};

const initCircularText = () => {
    const outerCircleText = document.getElementById('outerCircleText');
    if (!outerCircleText) return;

    // Create main text
    const msg = circularTextConfig.msg.split('');
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
    container.style.cursor = 'default';
    
    msg.forEach((char, i) => {
        const charElement = document.createElement('div');
        charElement.id = `iemsg${i}`;
        charElement.textContent = char;
        charElement.style.position = 'absolute';
        charElement.style.height = `${radius}px`;
        charElement.style.width = `${radius}px`;
        charElement.style.textAlign = 'center';
        container.appendChild(charElement);
        y[i] = x[i] = Y[i] = X[i] = 0;
    });

    // Create small text
    const smallMsg = smallTextConfig.msg.split('');
    const smallRadius = Math.round(smallTextConfig.size * smallTextConfig.diameter * 0.208333);
    const smallY = [], smallX = [], smallY2 = [], smallX2 = [];
    
    smallMsg.forEach((char, i) => {
        const charElement = document.createElement('div');
        charElement.id = `smallmsg${i}`;
        charElement.textContent = char;
        charElement.style.position = 'absolute';
        charElement.style.height = `${smallRadius}px`;
        charElement.style.width = `${smallRadius}px`;
        charElement.style.textAlign = 'center';
        charElement.style.fontSize = `${smallTextConfig.size}px`;
        charElement.style.opacity = '0.7';
        container.appendChild(charElement);
        smallY[i] = smallX[i] = smallY2[i] = smallX2[i] = 0;
    });

    outerCircleText.appendChild(container);

    const makecircle = () => {
        currStep -= circularTextConfig.rotation;
        
        // Update main text
        for (let i = msg.length - 1; i > -1; --i) {
            const d = document.getElementById(`iemsg${i}`).style;
            d.top = Math.round(y[i] + radius * Math.sin((currStep + i) / circularTextConfig.letter_spacing) * circularTextConfig.circleY - 15) + 'px';
            d.left = Math.round(x[i] + radius * Math.cos((currStep + i) / circularTextConfig.letter_spacing) * circularTextConfig.circleX) + 'px';
        }
        
        // Update small text
        for (let i = smallMsg.length - 1; i > -1; --i) {
            const d = document.getElementById(`smallmsg${i}`).style;
            d.top = Math.round(smallY[i] + smallRadius * Math.sin((currStep + i + msg.length) / smallTextConfig.letter_spacing) * smallTextConfig.circleY - 15) + 'px';
            d.left = Math.round(smallX[i] + smallRadius * Math.cos((currStep + i + msg.length) / smallTextConfig.letter_spacing) * smallTextConfig.circleX) + 'px';
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
        
        // Update small text positions
        smallY[0] = smallY2[0] += (ymouse - smallY2[0]) * smallTextConfig.speed;
        smallX[0] = smallX2[0] += (xmouse - 20 - smallX2[0]) * smallTextConfig.speed;
        for (let i = smallMsg.length - 1; i > 0; --i) {
            smallY[i] = smallY2[i] += (smallY[i-1] - smallY2[i]) * smallTextConfig.speed;
            smallX[i] = smallX2[i] += (smallX[i-1] - smallX2[i]) * smallTextConfig.speed;
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