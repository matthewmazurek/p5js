const points = [];

let m, b;

const learningRate = 0.5;
const optimizer = tf.train.sgd(learningRate);

let J;

function setup() {

  createCanvas(400, 400);
  m = tf.variable(tf.scalar(random(1)));
  b = tf.variable(tf.scalar(random(1)));

}

function draw() {
  background(0);
  points.forEach(pt => pt.draw());

  if (points.length) {
    tf.tidy(() => {

    let X = tf.tensor1d(points.map(pt => pt.x));
    let Y = tf.tensor1d(points.map(pt => pt.y));

    J = optimizer.minimize(() => loss(predict(X), Y), true);

    // draw learned line
    let line_x = tf.tensor1d([0, 1]);
    let line_y = predict(line_x);

    line_x = line_x.dataSync().map(x => map(x, 0, 1, 0, width));
    line_y = line_y.dataSync().map(y => map(y, 0, 1, 0, height));

    stroke(255);
    strokeWeight(1);
    line(line_x[0], line_y[0], line_x[1], line_y[1]);

    // print loss
    stroke(0);
    fill(255);
    text(`Loss = ${J.dataSync()}`, 20, height - 20);

  });
}
}

function mousePressed() {
  points.push(new Point(mouseX, mouseY));
}

const loss = (Yh, Y) => Yh.sub(Y).square().mean();
const predict = X => X.mul(m).add(b);

class Point {
  constructor(mX, mY) {
    mX = mX || random(width);
    mY = mY || random(height); 
    this.x = map(mX, 0, width, 0, 1);
    this.y = map(mY, 0, height, 0, 1);
  }
  draw() {
    const x = map(this.x, 0, 1, 0, width);
    const y = map(this.y, 0, 1, 0, height);
    stroke(255);
    strokeWeight(8);
    point(x, y);
  }
}