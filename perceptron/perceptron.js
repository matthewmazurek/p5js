
const xmin = -1, ymin = -1, xmax = 1, ymax = 1;
const sclx = x => map(x, xmin, xmax, 0, width);
const scly = y => map(y, ymin, ymax, 0, height);
const scl = (x, y) => [sclx(x), scly(y)];

let ptron, count = 0;

// training set length
let trainingSet = Array.from({length: 500});

// target linear separator
let target= {};
const f = x => target.a * x + target.b;

function setup() {
  
  // new perceptron
  ptron = new Perceptron(3, 0.02);
  
  // new target
  target = {a: random(1), b: random(1)};
  
  // setup trainign points
  for (let i in trainingSet) {
    let x = random(-1, 1);
    let y = random(-1, 1);
    let output = y >= f(x) ? 1 : -1;
    trainingSet[i] = {input: [x, y, 1], output};
  }
  
  // canvas
  createCanvas(600, 600);
  background(51);
  
}

function draw() {
  
  // reset canvas
  background(51);
  
  // draw actual line
  stroke(255);
  strokeWeight(2);
//  line(...scl(xmin, f(xmin)), ...scl(xmax, f(xmax)));
  
  // draw perceptron model line
  stroke(0, 204, 153);
  line(...scl(xmin, ptron.f(xmin)), ...scl(xmax, ptron.f(xmax)));
  
  // draw training points
  strokeWeight(1);
  for (let i in trainingSet) {
    
    let trainingPoint = trainingSet[i],
        colors = [[102, 102, 255], [255, 51, 153]],
        learned = count > i;
    
    if (trainingPoint.output < 0) fill(...colors[1], (learned ? 255 : 50));
    else fill(...colors[0], (learned ? 255 : 50));
    
    if (ptron.fprop(trainingPoint.input) == trainingPoint.output) stroke(255, 100);
    else noStroke();
    
    ellipse(...scl(trainingPoint.input[0], trainingPoint.input[1]), 10);
    
  }
  
  // train the perceptron, one input at a time
  ptron.bprop(trainingSet[count]);
  count = (count + 1) % trainingSet.length;
  
}


class Perceptron {
  
  // n, number of weights; c, learning co-efficient
  constructor (n, c) {
    this.weights = Array.from({length: n}, () => random(-1, 1));
    this.c = c;
  }
  
  // equation of linear separator (net output = 0)
  f(x1) {
    // output = w1x1 + w2x2 + w3 = 0, => x2 = (-w1x1 - w3) / w2
    return (-this.weights[0]*x1 -this.weights[2]) / this.weights[1];
  }
  
  // forward prop
  fprop (inputs) {
    let res = 0;
    for (let i in inputs) res += inputs[i] * this.weights[i];
    return this.threshold(res);
  }
  
  // hard-limiting, bipolar linear threshold
  threshold (n) {
    return n >= 0 ? 1 : -1;
  }
  
  // training and backprop
  bprop (trainingPoint) {
    let fprop = this.fprop(trainingPoint.input),
        desired = trainingPoint.output,
        error = desired - fprop; // either -2, 0, or 2
    for (let w in this.weights)
      this.weights[w] += this.c * error * trainingPoint.input[w];
  }
  
}