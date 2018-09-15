// Training data
const train_X = tf.tensor2d([[0, 0], [1, 0], [0, 1], [1, 1]]);
const train_Y = tf.tensor2d([[0], [1], [1], [0]]);

let nn, grid;

function setup() {

  createCanvas(400, 400);

  grid = new Grid({
    res: 10 // 1 cell = 10 px
  });

  nn = new NN({
    inputShape: train_X.shape[1]
  });
  
}

function draw() {
  
  // Train the model
  const res = nn.model.fit(train_X, train_Y, {
    epochs: 10,
    shuffle: true
  });

  // Get the model predictions
  const Y_h = nn.predict(grid.xs);

  // Update and draw the grid values
  grid.update(Y_h);
  grid.draw();

  }

class NN {
  constructor({inputShape = [2], nodes = [4, 1], activation = 'sigmoid', learningRate = 0.1} = {}) {
    this.model = tf.sequential();
    this.model.add( // hidden layer
      tf.layers.dense({
        inputShape,
        units: nodes[0],
        activation
      })
    );
    this.model.add( // output layer
      tf.layers.dense({
        units: nodes[1],
        activation
      })
    );
    const optimizer = tf.train.adam(learningRate);
    this.model.compile({optimizer, loss: 'meanSquaredError'});
  }
  predict(xs) {
    return tf.tidy(() => {
      const X = tf.tensor(xs);
      const Y = this.model.predict(X);
      return Y.dataSync();
    });
  }
}

class Grid {
  constructor({res = 100} = {}) {
    this.res = res;
    const cols = Math.floor(width / this.res), rows = Math.floor(height / this.res);
    this.px = Array.from({length: rows}).map((_, j) => Array.from({length: cols}).map((_, i) => new Cell(i, j, this)));
    this.shape = [rows, cols];
    this.xs = [];
    this.forEach((cell, i, j) => this.xs.push([i/(this.shape[1]-1), j/(this.shape[0]-1)]));
  }
  update(arr) {
    this.forEach((cell, i, j) => cell.setVal(arr[j * this.shape[0] + i]));
  }
  forEach(fn) {
    this.px.forEach((row, j) => row.forEach((cell, i) => fn(cell, i, j)));
  }
  draw() {
    this.forEach(cell => cell.draw());
  }
}

class Cell {
  constructor(i, j, grid, val=0.5) {
    this.i = i;
    this.j = j;
    this.pos = {x: i * grid.res, y: j * grid.res};
    this.grid = grid;
    this.val = val;
  }
  setVal(v) {
    this.val = v;
  }
  draw() {
    // stroke(255);
    noStroke();
    fill(map(this.val, 0, 1, 0, 255));
    rect(this.pos.x, this.pos.y, this.grid.res, this.grid.res);
  }
}