let bigEye;
let eyeball;
let eyeFilter;
let eyeballChart;
let leftRotSize = 0;
let ballSize = 0;
let ballColor = 'transparent'
let rotTimer;
let sleepTimer;
let isSleep = true; // 是否处于休眠状态

if (!window.monitorLoaded) {
    Init();
    window.monitorLoaded = true;
}

function Init() {
    const div = document.createElement("div");
    div.innerHTML = `<div class="eyeSocket eyeSocketSleeping" id='bigEye'>
    <div id="eyeball"></div>
    </div>
    <div class="filter">
    <div class="eyeSocket" id='eyeFilter'>
    </div>
    </div>
    <svg width="0">
    <filter id='filter'>
        <feTurbulence baseFrequency="1">
            <animate id="animate1" attributeName="baseFrequency" dur="1s" from="0.5" to="0.55" begin="0s;animate1.end">
            </animate>
            <animate id="animate2" attributeName="baseFrequency" dur="1s" from="0.55" to="0.5" begin="animate2.end">
            </animate>
        </feTurbulence>
        <feDisplacementMap in="SourceGraphic" scale="50" xChannelSelector="R" yChannelSelector="B" />
    </filter>
    </svg>`;
    document.body.appendChild(div);

    const style = document.createElement('style');
    style.innerHTML = `
        
    body {
        perspective: 1000px;
        --c-eyeSocket: rgb(41, 104, 217);
        --c-eyeSocket-outer: #02ffff;
        --c-eyeSocket-outer-shadow: transparent;
        --c-eyeSocket-inner: rgb(35, 22, 140);
    }
    
    .filter {
        width: 100%;
        height: 100%;
        filter: url('#filter');
    }
    
    .eyeSocket,
    .filter .eyeSocket {
        position: absolute;
        left: calc(50% - 75px);
        top: 17px;
        width: 150px;
        aspect-ratio: 1;
        border-radius: 50%;
        border: 4px solid var(--c-eyeSocket);
        box-shadow: 0px 0px 50px var(--c-eyeSocket-outer-shadow);
        transition: border 0.5s ease-in-out, box-shadow 0.5s ease-in-out;
        z-index: 1000000;
    }
    
    .filter .eyeSocket {
        opacity: 0;
        left: calc(50% - 92px);
        top: 0px;
        transition: all 0.5s ease-in-out;
    }
    
    .eyeSocket::before,
    .eyeSocket::after {
        content: "";
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        border-radius: 50%;
        transition: all 0.5s ease-in-out;
        box-sizing: border-box;
    }
    
    .eyeSocket::before {
        width: calc(100% + 20px);
        height: calc(100% + 20px);
        border: 6px solid var(--c-eyeSocket-outer);
    }
    
    .eyeSocket::after {
        width: 100%;
        height: 100%;
        border: 4px solid var(--c-eyeSocket-inner);
        box-shadow: inset 0px 0px 30px var(--c-eyeSocket-inner);
    }
    
    #eyeball {
        width: 100%;
        height: 100%;
    }
    
    .eyeSocketSleeping {
        animation: sleeping 6s infinite;
    }
    
    .eyeSocketLooking {
        animation: lookAround 2.5s;
    }
    
    @keyframes sleeping {
        0% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.2);
        }
        100% {
            transform: scale(1);
        }
    }
    
    @keyframes lookAround {
        0% {
            transform: translateX(0) rotateY(0);
        }
        10% {
            transform: translateX(0) rotateY(0);
        }
        40% {
            transform: translateX(-70px) rotateX(-45deg) rotateY(-30deg);
        }
        80% {
            transform: translateX(70px) rotateX(-45deg) rotateY(30deg);
        }
        100% {
            transform: translateX(0) rotateY(0);
        }
    }`
    document.body.appendChild(style);

    bigEye = document.getElementById('bigEye');
    eyeball = document.getElementById('eyeball');
    eyeFilter = document.getElementById('eyeFilter');
    eyeballChart = echarts.init(eyeball);
    setTimeout(() => {
        clickToWeakup();
    }, 2000);
    bigEye.addEventListener('click', () => {
        if (!isSleep) return;
        clickToWeakup();
    })
    bigEye.addEventListener('webkitAnimationEnd', () => {
        new Promise(res => {
            clearInterval(rotTimer);
            rotTimer = setInterval(() => {
                getEyeballChart()
                ballSize > 0 && (ballSize -= 0.5);
                leftRotSize === 360 ? (leftRotSize = 0) : (leftRotSize += 0.1);
                if (ballSize === 0) {
                    clearInterval(rotTimer);

                    res();
                }
            }, 10);
        }).then(() => {
            eyeFilter.style.opacity = '0'
            eyeFilter.className = bigEye.className = 'eyeSocket';
            setNormal();
            document.body.addEventListener('mousemove', focusOnMouse);
            rotTimer = setInterval(() => {
                getEyeballChart()
                ballSize <= 12 && (ballSize += 0.1);
                leftRotSize === 360 ? (leftRotSize = 0) : (leftRotSize += 0.1);
            }, 10);
        })
    })

    chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
            switch (request.type) {
                case "gethref":
                    sendResponse({ href: window.location.href.toLocaleLowerCase() });
                    break;
                case "setAngry":
                    setAngry();
                    break;
                case "setNormal":
                    setNormal();
                    break;
                default:
                    break;
            }
        });

}

// 画眼球
function getEyeballChart() {
    eyeballChart.setOption({
        series: [{
            type: 'gauge',
            radius: '-20%',
            clockwise: false,
            startAngle: `${0 + leftRotSize * 5}`,
            endAngle: `${270 + leftRotSize * 5}`,
            splitNumber: 3,
            detail: false,
            axisLine: {
                show: false,
            },
            axisTick: false,
            splitLine: {
                show: true,
                length: ballSize,
                lineStyle: {
                    shadowBlur: 20,
                    shadowColor: ballColor,
                    shadowOffsetY: '0',
                    color: ballColor,
                    width: 4,
                }
            },
            axisLabel: false
        }, {
            type: 'gauge',
            radius: '-20%',
            clockwise: false,
            startAngle: `${45 + leftRotSize * 5}`,
            endAngle: `${315 + leftRotSize * 5}`,
            splitNumber: 3,
            detail: false,
            axisLine: {
                show: false,
            },
            axisTick: false,
            splitLine: {
                show: true,
                length: ballSize,
                lineStyle: {
                    shadowBlur: 20,
                    shadowColor: ballColor,
                    shadowOffsetY: '0',
                    color: ballColor,
                    width: 4,
                }
            },
            axisLabel: false
        }]
    })
}

// 休眠
function toSleep() {
    isSleep = true;
    clearInterval(rotTimer);
    rotTimer = setInterval(() => {
        getEyeballChart()
        if (ballSize > 0) {
            ballSize -= 0.1;
        } else {
            bigEye.className = 'eyeSocket eyeSocketSleeping'
        }
        leftRotSize === 360 ? (leftRotSize = 0) : (leftRotSize += 0.1);
    }, 10);
    document.body.removeEventListener('mousemove', focusOnMouse);
    bigEye.style.transform = `rotateY(0deg) rotateX(0deg)`;
    eyeball.style.transform = `translate(0px, 0px)`;
}

// 唤醒
function clickToWeakup() {
    isSleep = false;
    eyeFilter.style.opacity = '1'
    eyeFilter.className = bigEye.className = 'eyeSocket eyeSocketLooking'
    setAngry();
    clearInterval(rotTimer);
    rotTimer = setInterval(() => {
        getEyeballChart();
        ballSize <= 50 && (ballSize += 1);
        leftRotSize === 360 ? (leftRotSize = 0) : (leftRotSize += 0.5);
    }, 10);
}
// 生气模式
function setAngry() {
    document.body.style.setProperty('--c-eyeSocket', 'rgb(255,187,255)')
    document.body.style.setProperty('--c-eyeSocket-outer', 'rgb(238,85,135)')
    document.body.style.setProperty('--c-eyeSocket-outer-shadow', 'rgb(255, 60, 86)')
    document.body.style.setProperty('--c-eyeSocket-inner', 'rgb(208,14,74)')
    ballColor = 'rgb(208,14,74)';
}
// 常态模式
function setNormal() {
    document.body.style.setProperty('--c-eyeSocket', 'rgb(41, 104, 217)')
    document.body.style.setProperty('--c-eyeSocket-outer', '#02ffff')
    document.body.style.setProperty('--c-eyeSocket-outer-shadow', 'transparent')
    document.body.style.setProperty('--c-eyeSocket-inner', 'rgb(35, 22, 140)')
    ballColor = 'rgb(0,238,255)';
}

// 关注鼠标
function focusOnMouse(e) {
    // 视口尺寸
    let clientWidth = document.body.clientWidth;
    let clientHeight = document.body.clientHeight;
    // 原点，即bigEye中心位置，页面中心
    let origin = [clientWidth / 2, 0];
    // 鼠标坐标
    let mouseCoords = [e.clientX - origin[0], origin[1] - e.clientY];
    let eyeXDeg = mouseCoords[1] / clientHeight * 80;
    let eyeYDeg = mouseCoords[0] / clientWidth * 60;
    bigEye.style.transform = `rotateY(${eyeYDeg}deg) rotateX(${eyeXDeg}deg)`;
    eyeball.style.transform = `translate(${eyeYDeg / 1.5}px, ${-eyeXDeg / 1.5}px)`;
    // 设置休眠
    if (sleepTimer) clearTimeout(sleepTimer);
    sleepTimer = setTimeout(() => {
        toSleep();
    }, 30000);
}