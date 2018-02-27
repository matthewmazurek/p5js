let perceptron, trainX, trainY, trainingSet;

let pointSize = 5;

function setup() {
  
  createCanvas(200, 200);
  
  trainingSet = Array.from({length: 100}, () => new DataPoint(
    random(width),
    random(height)
  ));
  
  trainX = trainingSet.map(p => [p.x, p.y]);
  trainY = trainingSet.map(p => p.label);
  
  perceptron = new Perceptron(trainX[0].length);
  
  
}

function draw() {
  
  background(255);
  stroke(0);
  strokeWeight(1);
  
  line(0, 0, width, height);
  
  let fills = {
    '1': color(0, 255, 0),
    '-1': color(255, 0, 0)
  };
  
  let A = perceptron.forwardProp(trainX);
  let L = perceptron.calculateLoss(A, trainY);
  
  for (let p in trainingSet) {
    fill(fills[L[p] == 0 ? 1 : -1]);
    ellipse(trainingSet[p].x, trainingSet[p].y, pointSize);
  }
  
}

class Perceptron {
  
  constructor(w) {
    // initialize weights randomly
    this.W = Array.from({length: w}, () => random(-1, 1));
    this.learningRate = 0.00001;
  }
  
  forwardProp(X) {
    let Z = [], A = [];
    for (let i in X) {
      Z[i] = X[i].reduce((s, x, j) => s + x * this.W[j], 0);
      A[i] = Math.sign(Z[i]);
    }
    return A;
  }
  
  calculateLoss(A, Y) {
    return A.map((a, i) => Y[i] - a);
  }
  
  train(X, Y) {
    let A = this.forwardProp(X);
    let L = this.calculateLoss(A, Y);
    let oldW = this.W;
    for (let i in L) {
      this.W = this.W.map((w, j) => w + X[i][j] * L[i] * this.learningRate);
    }
    let newA = this.forwardProp(X);
    console.log("labels:", Y, "fprop:", A, "Loss:", L, "new fProp:", newA, "old Weights:", oldW, "new Weights:", this.W, "eval", this.meanSquaredError(X, Y));
  }
  
  meanSquaredError(X, Y) {
    return this.calculateLoss(this.forwardProp(X), Y).reduce((s, l) => s + l**2) / X.length;
  }
  
}

class DataPoint {
  constructor(x, y, label) {
    this.x = x;
    this.y = y;
    this.label = (y > x) ? 1 : -1;
  }
}