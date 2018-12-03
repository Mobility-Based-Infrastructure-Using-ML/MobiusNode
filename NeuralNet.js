const tf = require('@tensorflow/tfjs');
const ControllerDataset = require('./js/controller_dataset');
const ui = require('./js/ui');
const anim = require('./js/animations');
const Webcam = require('./js/webcam');
const Data = require('./js/data');

// The number of classes we want to predict. In this example, we will be
// predicting 4 classes for up, down, left, and right.
const NUM_CLASSES = 5;

// A webcam class that generates Tensors from the images from the webcam.
const webcam = new Webcam(document.getElementById('webcam'));

// The dataset object where we will store activations.
const controllerDataset = new ControllerDataset(NUM_CLASSES);

var loss;
var timestart, timeend;

let mobilenet;
let model;

// Loads mobilenet and returns a model that returns the internal activation
// we'll use as input to our classifier model.
async function loadMobilenet() {
  const mobilenet = await tf.loadModel(
      'https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json');

  // Return a model that outputs an internal activation.
  const layer = mobilenet.getLayer('conv_pw_13_relu');
  return tf.model({inputs: mobilenet.inputs, outputs: layer.output});
}

// When the UI buttons are pressed, read a frame from the webcam and associate
// it with the class label given by the button. front, back, left, right, idle are
// labels 0, 1, 2, 3, 4 respectively.
ui.setExampleHandler(label => {
  tf.tidy(() => {
    const img = webcam.capture();
    controllerDataset.addExample(mobilenet.predict(img), label);

    // Draw the preview thumbnail.
    ui.drawThumb(img, label);
  });
});

/**
 * Sets up and trains the classifier.
 */
async function train() {
  if (controllerDataset.xs == null) {
    throw new Error('Add some examples before training!');
  }

  // Creates a 2-layer fully connected model. By creating a separate model,
  // rather than adding layers to the mobilenet model, we "freeze" the weights
  // of the mobilenet model, and only train weights from the new model.
  model = tf.sequential({
    layers: [
      // Flattens the input to a vector so we can use it in a dense layer. While
      // technically a layer, this only performs a reshape (and has no training
      // parameters).
      tf.layers.flatten({inputShape: [7, 7, 256]}),
      // Layer 1
      tf.layers.dense({
        units: ui.getDenseUnits(), // how many nodes in the hidden layer (defaults to 100)
        activation: 'relu',
        kernelInitializer: 'varianceScaling',
        useBias: true
      }),
      // Layer 2. The number of units of the last layer should correspond
      // to the number of classes we want to predict.
      tf.layers.dense({
        units: NUM_CLASSES,
        kernelInitializer: 'varianceScaling',
        useBias: false,
        activation: 'softmax'
      })
    ]
  });

  // Creates the optimizers which drives training of the model.
  const optimizer = tf.train.adam(ui.getLearningRate());
  // We use categoricalCrossentropy which is the loss function we use for
  // categorical classification which measures the error between our predicted
  // probability distribution over classes (probability that an input is of each
  // class), versus the label (100% probability in the true class)>
  model.compile({optimizer: optimizer, loss: 'categoricalCrossentropy'});

  // We parameterize batch size as a fraction of the entire dataset because the
  // number of examples that are collected depends on how many examples the user
  // collects. This allows us to have a flexible batch size.
  const batchSize =
      Math.floor(controllerDataset.xs.shape[0] * ui.getBatchSizeFraction());
  if (!(batchSize > 0)) {
    throw new Error(
        `Batch size is 0 or NaN. Please choose a non-zero fraction.`);
  }

  // Train the model! Model.fit() will shuffle xs & ys so we don't have to.
  model.fit(controllerDataset.xs, controllerDataset.ys, {
    batchSize,
    epochs: ui.getEpochs(),
    callbacks: {
      onBatchEnd: async (batch, logs) => {
        loss = logs.loss.toFixed(5);
        ui.trainStatus('Loss: ' + loss);
      }
    }
  });
}

let isPredicting = false;

// this is testing
async function predict() {

  timeend = new Date();

  ui.isPredicting();
  while (isPredicting) {
    const predictedClass = tf.tidy(() => { // memory management
      // viure the frame from the webcam.
      const img = webcam.capture();

      // Make a prediction through mobilenet, getting the internal activation of
      // the mobilenet model.
      const activation = mobilenet.predict(img);

      // Make a prediction through our newly-trained model using the activation
      // from mobilenet as input.
      const predictions = model.predict(activation);
      // Returns the index with the maximum probability. This number corresponds
      // to the class the model thinks is the most probable given the input.
      return predictions.as1D().argMax();
    });

    const classId = (await predictedClass.data())[0];
    predictedClass.dispose();

    // currentDir = ui.predictClass(classId);
    anim.move(ui.predictClass(classId));
    await tf.nextFrame();
  }
  ui.donePredicting();
}

document.getElementById('train').addEventListener('click', async () => {
  ui.trainStatus('Training...');
  timestart = new Date();
  await tf.nextFrame();
  await tf.nextFrame();
  isPredicting = false;
  train();
});
document.getElementById('predict').addEventListener('click', () => {
  anim.retract();
  ui.startPacman();
  isPredicting = true;
  predict();
});
document.getElementById('saveModel').addEventListener('click', () => {
  var info = {
    loss: loss,
    train: timeend - timestart
  }

  saveData(info);
})

async function init() {
  try {
    await webcam.setup();
  } catch (e) {
    document.getElementById('no-webcam').style.display = 'block';
  }
  mobilenet = await loadMobilenet();

  // Warm up the model. This uploads weights to the GPU and compiles the WebGL
  // programs so the first time we collect data from the webcam it will be
  // quick.
  tf.tidy(() => mobilenet.predict(webcam.capture()));

  ui.init();

  // console.log(tf.Model)
  

}


// Function for saving model to a file
// https://js.tensorflow.org/tutorials/model-save-load.html 
// Prompts to download 2 files
function saveData(data) {
  console.log('Saving Data');
  Data.update(data);
}

// Initialize the application.
init();

module.exports.loadMobilenet = loadMobilenet;