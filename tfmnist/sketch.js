
const model = tf.sequential();

// Conv2d 28 x 28 x 1 --> 24 x 24 x 8
model.add(tf.layers.conv2d({
  inputShape: [28, 28, 1],
  kernelSize: 5,
  strides: 1,
  filters: 8,
  activation: 'relu',
  kernelInitializer: 'VarianceScaling'

}));

// MaxPool 24 x 24 x 8 --> 12 x 12 x 8
model.add(tf.layers.maxPooling2d({
  poolSize: [2, 2],
  strides: [2, 2]
}));

// Conv2d 12 x 12 x 8 --> 8 x 8 x 16
model.add(tf.layers.conv2d({
  kernelSize: 5,
  strides: 1,
  filters: 16,
  activation: 'relu',
  kernelInitializer: 'VarianceScaling'

}));

// MaxPool 4 x 4 x 16
model.add(tf.layers.maxPooling2d({
  poolSize: [2, 2],
  strides: [2, 2]
}));

// Flatten 4 x 4 x 16 --> 256
model.add(tf.layers.flatten());

// FC
model.add(tf.layers.dense({
  units: 10,
  kernelInitializer: 'VarianceScaling',
  activation: 'softmax'
}))

const LEARNING_RATE = 0.15;
const optimizer = tf.train.sgd(LEARNING_RATE);

model.compile({
  optimizer: optimizer,
  loss: 'categoricalCrossentropy',
  metrics: ['accuracy']
});

const BATCH_SIZE = 64;
const TRAIN_BATCHES = 100;

const TEST_BATCH_SIZE = 1000;
const TEST_ITERATION_FREQUENCY = 5;

async function train() {

  ui.isTraining();

  const lossValues = [];
  const accuracyValues = [];

  for (let i = 0; i < TRAIN_BATCHES; i++) {

    const batch = data.nextTrainBatch(BATCH_SIZE);

    let testBatch, validationData, isTestCycle;

    if (i % TEST_ITERATION_FREQUENCY === 0) {
      isTestCycle = true;
      testBatch = data.nextTestBatch(TEST_BATCH_SIZE);
      validationData = [
        testBatch.xs.reshape([TEST_BATCH_SIZE, 28, 28, 1]), testBatch.labels
      ];
    }

    const history = await model.fit(
      batch.xs.reshape([BATCH_SIZE, 28, 28, 1]),
      batch.labels,
      {
        batchSize: BATCH_SIZE,
        validationData,
        epochs: 1
      }
    );

    const loss = history.history.loss[0];
    const accuracy = history.history.acc[0];

    // Plot losses
    lossValues.push({batch: i, loss, set: 'train'});
    ui.plotLosses(lossValues);

    // Plot accuracy
    if (isTestCycle) {
      accuracyValues.push({batch: i, accuracy, set: 'test'});
      ui.plotAccuracies(accuracyValues);
    }

    // Memory mx
    batch.xs.dispose();
    batch.labels.dispose();
    if (isTestCycle) {
      testBatch.xs.dispose();
      testBatch.labels.dispose();
      isTestCycle = false;
    }

    await tf.nextFrame();

  }
  
}

async function showPredictions() {
  const testExamples = 100;
  const batch = data.nextTestBatch(testExamples);

  tf.tidy(() => {

    const output = model.predict(batch.xs.reshape([-1, 28, 28, 1]));

    const axis = 1;
    const labels = Array.from(batch.labels.argMax(axis).dataSync());
    const predictions = Array.from(output.labels.argMax(axis).dataSync());

    ui.showTestResults(batch, predictions, labels);

  });
}

let data;

async function load() {
  data = new MnistData();
  await data.load();
}

async function mnist() {
  await load();
  await train();
  showPredictions();
}
mnist();



function setup() {

}

function draw() {

}