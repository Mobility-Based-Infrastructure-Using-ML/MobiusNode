/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */
import * as tf from '@tensorflow/tfjs';

const CONTROLS = ['front', 'back', 'left', 'right', 'idle'];

export function init() {
  // document.getElementById('controller').style.display = '';
  statusElement.style.display = 'none';
}

const trainStatusElement = document.getElementById('train-status');

// Set hyper params from UI values.
const learningRateElement = document.getElementById('learningRate');
export const getLearningRate = () => +learningRateElement.value;

const batchSizeFractionElement = document.getElementById('batchSizeFraction');
export const getBatchSizeFraction = () => +batchSizeFractionElement.value;

const epochsElement = document.getElementById('epochs');
export const getEpochs = () => +epochsElement.value;

const denseUnitsElement = document.getElementById('dense-units');
export const getDenseUnits = () => +denseUnitsElement.value;
const statusElement = document.getElementById('status');

export function predictClass(classId) {
  document.body.setAttribute('data-active', CONTROLS[classId]);
  const classToDirection = {4: "IDLE", 3: "RIGHT", 2: "LEFT", 1: "BOTTOM", 0: "FRONT"}

  return classToDirection[classId];
}

export function isPredicting() {
  statusElement.style.visibility = 'visible';
}
export function donePredicting() {
  statusElement.style.visibility = 'hidden';
}
export function trainStatus(status) {
  trainStatusElement.innerText = status;
  // UPDATES LOSS
}

export let addExampleHandler;
export function setExampleHandler(handler) {
  addExampleHandler = handler;
}
let mouseDown = false;

const idle = document.getElementById('idle');
const upButton = document.getElementById('up');
const downButton = document.getElementById('down');
const leftButton = document.getElementById('left');
const rightButton = document.getElementById('right');

const camcircle = document.getElementsByClassName('cam-circle');

const thumbDisplayed = {};

// this is tensorflow so we need to connect it to the server. 
async function handler(label) {
  mouseDown = true;
  const className = CONTROLS[label]; // array that turns a number into front left right back or idle
  while (mouseDown) {
    // console.log('adding examples for', className);
    addExampleHandler(label);
    await tf.nextFrame();
  }
}
// INSTEAD OF THE ABOVE FUNCTION, USE WEBSOCKETS TO SEND THAT INFORMATION TO THE SERVER AND PIC UP FROM THERE

// DO IT HERE
function exportHandler(handler) {

}

upButton.addEventListener('mousedown', () => (frontEx > MIN_EXAMPLES) ? null : handler(0)); // front 0
upButton.addEventListener('mouseup', () => mouseDown = false);

downButton.addEventListener('mousedown', () => (backEx > MIN_EXAMPLES) ? null : handler(1)); // back 1
downButton.addEventListener('mouseup', () => mouseDown = false);

leftButton.addEventListener('mousedown', () => (leftEx > MIN_EXAMPLES) ? null : handler(2)); // left 2
leftButton.addEventListener('mouseup', () => mouseDown = false);

rightButton.addEventListener('mousedown', () => (rightEx > MIN_EXAMPLES) ? null : handler(3)); // right 3
rightButton.addEventListener('mouseup', () => mouseDown = false);

idle.addEventListener('mousedown', () => (idleEx > MIN_EXAMPLES) ? null : handler(4)); // idle 4
idle.addEventListener('mouseup', () => mouseDown = false);

let frontEx = 0;
let backEx = 0;
let leftEx = 0;
let rightEx = 0;
let idleEx = 0;

const MIN_EXAMPLES = 30;


// let's make these thumbnails bigger so it's easier to see
// ON CLICK OF SAMPLE
export function drawThumb(img, label) {
  if (thumbDisplayed[label] == null) {
    const thumbCanvas = document.getElementById(CONTROLS[label] + '-thumb');
    switch (label){
      case 0:
        // front
        draw(img, thumbCanvas);
        frontEx++;
        (frontEx > MIN_EXAMPLES) ? camcircle[label].style.background = '#7ba3d2' : null;
        break;
      case 1:
        // back
        draw(img, thumbCanvas);
        backEx++;
        (backEx > MIN_EXAMPLES) ? camcircle[label].style.background = '#7ba3d2' : null;
        break;
      case 2:
        // left
        draw(img, thumbCanvas);
        leftEx++;
        (leftEx > MIN_EXAMPLES) ? camcircle[label].style.background = '#7ba3d2' : null;
        break;
      case 3:
        // right
        draw(img, thumbCanvas);
        rightEx++;
        (rightEx > MIN_EXAMPLES) ? camcircle[label].style.background = '#7ba3d2' : null;
        break;
      case 4:
        // idle
        idleEx++;
        (idleEx > MIN_EXAMPLES) ? camcircle[label].style.background = '#7ba3d2' : null;
        break;
    }
  }
}

export function draw(image, canvas) {
  const [width, height] = [224, 224];
  const ctx = canvas.getContext('2d');
  const imageData = new ImageData(width, height);
  const data = image.dataSync();
  for (let i = 0; i < height * width; ++i) {
    const j = i * 4;
    imageData.data[j + 0] = (data[i * 3 + 0] + 1) * 127;
    imageData.data[j + 1] = (data[i * 3 + 1] + 1) * 127;
    imageData.data[j + 2] = (data[i * 3 + 2] + 1) * 127;
    imageData.data[j + 3] = 255;
  }
  ctx.putImageData(imageData, 0, 0);
}
