let p, data_test, data_train, X_train, Y_train, X_test, Y_test;

function setup() {

  createCanvas(400, 400)

  p = new Perceptron(2);

  // training data
  data_train = Array.from({length: 20}, () => new Point);
  X_train = math.transpose(math.matrix(data_train.map(p => [p.x, p.y])));
  Y_train = math.transpose(math.matrix(data_train.map(p => [p.label])));

  // // testing data
  data_test = data_train;
  // data_test = Array.from({length: 100}, () => new Point);
  // X_test = [];
  // Y_test = [];
  // data_test.forEach(point => {
  //   X_test.push([point.x, point.y]);
  //   Y_test.push(point.label);
  // });

  

  // console.log(p);
  // console.log('Pre-training accuracy: ', p.test(X_test, Y_test));

  // // train perceptron
  let costs = p.optimize({'x_dict': X_train, 'y_dict': Y_train, 'learning_rate': 0.4});

  // console.log(p);
  // console.log('Post-training accuracy: ', p.test(X_test, Y_test));

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
    // this.weights = Array.from({length: w}, () => random(-1, 1));
    this.weights = math.zeros([w, 1]);
    this.bias = math.zeros([1, 1]);
  }

  prop(w, b, X, Y) {

    let m = X.size()[1];

    console.log('b', b);

    let Z = math.add(math.multiply(math.transpose(w), X), b);
    let A = Perceptron.sigmoid(Z);
    
    // cost = - (y * Math.log(a) + (1 - y) * Math.log(1 - a));
    let _a = math.multiply(Y, math.transpose(math.log(A))),
        _b = math.multiply(math.subtract(1, Y), math.transpose(math.log(math.subtract(1, A))));
    let cost = math.sum(math.subtract(_b, _a));

    // L2 reg
    // cost += w.reduce((sum, w) => sum + (l2_lambda / 2) * (w ** 2), 0);

    // grads for back prop
    let dz = math.subtract(A, Y);
    let dw = math.dotDivide(math.dot(X, math.transpose(dz)), m);
    // sum accross axis = 1
    let db = math.matrix(dz.valueOf().map(arr => [arr.reduce((acc, val) => acc + val, 0)]));
    let grads = {dw, db};

    return [grads, cost];

  }

  static sigmoid(Z) {
    // sigmoid(Z) = 1 / [1 + e^(-Z)]
    let denominator = math.chain(Z).multiply(-1).exp().add(1).done();
    return math.dotDivide(1, denominator);
  }

  optimize(o) {

    // options
    o = o || {};
    let X_train = o.x_dict;
    let Y_train = o.y_dict;
    let learning_rate = o.learning_rate || 1;
    let l2_lambda = o.l2_lambda || 0;

    let costs = [];

    let [grads, cost] = this.prop(this.weights, this.bias, X_train, Y_train);

    console.log(grads, cost);

    // X_train.forEach((x, n) => {

    //   let y = Y_train[n];
    //   let [grads, cost] = this.prop(this.weights, this.bias, x, y, l2_lambda);

    //   // update weights and bias
    //   this.weights = this.weights.map((wi, i) => wi - grads.dw[i] * learning_rate);
    //   this.bias -= grads.db * learning_rate;

    //   costs.push(cost);

    // })

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
    // if (p.predict(this.inputs, true) == this.label) {
    //   fill(0, 255, 0);
    //   noStroke();
    //   ellipse(this.pixels.x, this.pixels.y, this.r * 2 * 1.5, this.r * 2 * 1.5);
    // }

    let c = {'1': '#000', '0': '#fff'}[this.label];
    fill(c);
    stroke(0);
    ellipse(this.pixels.x, this.pixels.y, this.r * 2, this.r *2);
  }
}