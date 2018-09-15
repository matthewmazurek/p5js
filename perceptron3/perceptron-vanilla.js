let p, data, X_train, Y_train, X_test, Y_test;

function setup() {

  createCanvas(400, 400)

  p = new Perceptron(2);

  // training data
  data_train = Array.from({length: 1000}, () => new Point);
  X_train = [];
  Y_train = [];
  data_train.forEach(point => {
    X_train.push([point.x, point.y]);
    Y_train.push(point.label);
  });

  // testing data
  data_test = Array.from({length: 100}, () => new Point);
  X_test = [];
  Y_test = [];
  data_test.forEach(point => {
    X_test.push([point.x, point.y]);
    Y_test.push(point.label);
  });

  console.log(p);
  console.log('Pre-training accuracy: ', p.test(X_test, Y_test));

  // train perceptron
  let costs = p.optimize({'x_dict': X_train, 'y_dict': Y_train, 'learning_rate': 0.4, 'l2_lambda': 0.001});

  console.log(p);
  console.log('Post-training accuracy: ', p.test(X_test, Y_test));

  // frameRate(0.5);

}

function draw() {
  background('fff');
  data_test.forEach(point => point.draw());
  
  // visual training
  // if (X_train.length) p.train([X_train.pop()], [Y_train.pop()]);

}

class Perceptron {

  // inputs x -> (x * w + b) -> z -> sigmoid -> output, a 

  constructor(w) {
    this.weights = Array.from({length: w}, () => random(-1, 1));
    this.bias = random(-1, 1);
  }

  prop(w, b, x, y, l2_lambda) {

    let z = x.reduce((sum, xi, i) => sum + xi * w[i], 0) + b;
    let a = Perceptron.sigmoid(z);
    let cost = - (y * Math.log(a) + (1 - y) * Math.log(1 - a));

    // L2 reg
    cost += w.reduce((sum, w) => sum + (l2_lambda / 2) * (w ** 2), 0);

    // grads for back prop
    let dz = a - y;
    let dw = x.map((xi, i) => xi * dz + l2_lambda * w[i]);
    let db = dz;
    let grads = {dw, db};

    return [grads, cost];

  }

  static sigmoid(z) {
    return 1 / (1 + Math.exp(-z));
  }

  optimize(o) {

    // options
    o = o || {};
    let X_train = o.x_dict;
    let Y_train = o.y_dict;
    let learning_rate = o.learning_rate || 1;
    let l2_lambda = o.l2_lambda || 0;

    let costs = [];

    X_train.forEach((x, n) => {

      let y = Y_train[n];
      let [grads, cost] = this.prop(this.weights, this.bias, x, y, l2_lambda);

      // update weights and bias
      this.weights = this.weights.map((wi, i) => wi - grads.dw[i] * learning_rate);
      this.bias -= grads.db * learning_rate;

      costs.push(cost);

    })

    return costs;
  }

  predict(x, round) {
    round = round || false;
    let z = x.reduce((sum, xi, i) => sum + xi * this.weights[i], 0) + this.bias;
    let a = Perceptron.sigmoid(z);
    return round ? Math.round(a) : a;
  }

  test(X_test, Y_test) {
    let res = X_test.map((x, n) => this.predict(x, true) == Y_test[n]);
    let accuracy = res.reduce((a, v) => a + (v ? 1 : 0), 0) / res.length;
    return accuracy;
  }

}

class Point {
  constructor() {
    this.x = random(0, 1);
    this.y = random(0, 1);
    this.r = 5;
    this.label = this.y > this.x ? 1 : 0;
    // this.label = ((this.y - 0.5) ** 2 + (this.x - 0.5) ** 2) > 0.25 ? 1 : 0;
  }
  get inputs() {
    return [this.x, this.y];
  }
  get pixels() {
    return {
      x: map(this.x, 0, 1, 0, width),
      y: map(this.y, 0, 1, 0, height)
    }
  }
  draw() {
    if (p.predict(this.inputs, true) == this.label) {
      fill(0, 255, 0);
      noStroke();
      ellipse(this.pixels.x, this.pixels.y, this.r * 2 * 1.5, this.r * 2 * 1.5);
    }

    let c = {'1': '#000', '0': '#fff'}[this.label];
    fill(c);
    stroke(0);
    ellipse(this.pixels.x, this.pixels.y, this.r * 2, this.r *2);
  }
}