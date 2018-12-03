const camcircle = document.getElementsByClassName('cam-circle');
    
const topcamera = document.getElementById('top-camera');
const rightcamera = document.getElementById('right-camera');
const bottomcamera = document.getElementById('bottom-camera');
const leftcamera = document.getElementById('left-camera');

export function move(element) {

    switch (element) {
        case 'IDLE': 
            retract();
            break;
        case 'FRONT':
            retract();
            topcamera.style.animation = 'slide-top 0.3s ease-in-out both';
            break;
        case 'RIGHT':
            retract();
            rightcamera.style.animation = 'slide-right 0.3s ease-in-out both';
            break;
        case 'BOTTOM':
            retract();
            bottomcamera.style.animation = 'slide-bottom 0.3s ease-in-out both';
            break;
        case 'LEFT':
            retract();
            leftcamera.style.animation = 'slide-left 0.3s ease-in-out both';
            break;
    }
    
}

export function retract() {
    for(let i = 0; i < camcircle.length - 1; i++) { // -1 because the center circle is also a camera but we dont want that one to dissapear
        camcircle[i].style.animation = 'retract 0.3s ease-in-out both';
    }
}

export function expand() {

    topcamera.style.animation = 'slide-top 0.3s ease-in-out both';
    rightcamera.style.animation = 'slide-right 0.3s ease-in-out both';
    bottomcamera.style.animation = 'slide-bottom 0.3s ease-in-out both';
    leftcamera.style.animation = 'slide-left 0.3s ease-in-out both';
}

const top = document.getElementById('top-camera');
const right = document.getElementById('right-camera');
const left = document.getElementById('left-camera');
const bottom = document.getElementById('bottom-camera');
const idle = document.getElementById('camera');


export function init() {
    top.onmousedown = () => setCameraSelected('up');
    right.onmousedown = () => setCameraSelected('right');
    left.onmousedown = () => setCameraSelected('left');
    bottom.onmousedown = () => setCameraSelected('down');
    idle.onmousedown = () => setCameraSelected('idle');   

    for(var i = 0; i < camcircle.length; i++) camcircle[i].onmouseup = function(){unSelectCamera()};

}

export function setCameraSelected(direction) { // allows to select a camera to have a glowing halo around it
    switch(direction) {
    case 'up':
        top.classList.add('selected');
        break;
    case 'down':
        bottom.classList.add('selected');
        break;
    case 'left':
        left.classList.add('selected');
        break;
    case 'right':
        right.classList.add('selected');
        break;
    case 'idle':
        idle.classList.add('selected');
        break;
    }
  }
  
export function unSelectCamera() {
// console.log('unselect is running');
document.getElementById('top-camera').classList.remove('selected');
document.getElementById('bottom-camera').classList.remove('selected');
document.getElementById('left-camera').classList.remove('selected');
document.getElementById('right-camera').classList.remove('selected');
document.getElementById('idle').classList.remove('selected');
}

init();
expand();