class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  get pixels() {
    return {
      x: map(this.x, domain[0], domain[1], 0, width),
      y: map(this.y, range[0], range[1], 0, height)
    }
  }
  draw() {  
    let r = 5;
    fill('#fff');
    stroke(0);
    ellipse(this.pixels.x, this.pixels.y, r * 2, r *2);
  }
}

class Curve {
  constructor(fn, n = 100, start = domain[0], stop = domain[1]) {
    
    [this.xvals, this.yvals] = tf.tidy(() => {
      
      const step = (stop - start) / n;
      const xs = tf.range(start, stop, step);
      const ys = fn(xs);

      return [xs.dataSync(), ys.dataSync()];
    });

    this.pts = Array.from(this.yvals).map((y, i) => new Point(this.xvals[i], y));
  }

  draw() {
    strokeWeight(2)
    stroke('#fff');
    noFill();
    beginShape();
      this.pts.forEach(pt => vertex(pt.pixels.x, pt.pixels.y));
    endShape();
  }
}


// Randomly pick ground truth coefficients
const randomCoefficient = () => Math.random() * 2 - 1;

// const trueCoefficients = {a: -.8, b: -.2, c: .9, d: .5};
const trueCoefficients = {
  a: randomCoefficient(),
  b: randomCoefficient(),
  c: randomCoefficient(),
  d: randomCoefficient()
};

// Generate training data
const domain = [-1, 1], range = [0, 1];

const trainingData = generateData(100, trueCoefficients, domain, range);

const xvals = trainingData.xs.dataSync();
const yvals = trainingData.ys.dataSync();

const trainingDataPts = Array.from(yvals).map((y, i) => new Point(xvals[i], y));

// model variables
const a = tf.variable(tf.scalar(Math.random()));
const b = tf.variable(tf.scalar(Math.random()));
const c = tf.variable(tf.scalar(Math.random()));
const d = tf.variable(tf.scalar(Math.random()));


function generateData(numPoints, coeff, domain = [-1, 1], range = [-1, 1], sigma = 0.04) {
  return tf.tidy(() => {
    const [a, b, c, d] = [
      tf.scalar(coeff.a), tf.scalar(coeff.b), tf.scalar(coeff.c),
      tf.scalar(coeff.d)
    ];

    const xs = tf.randomUniform([numPoints], domain[0], domain[1]);

    // Generate polynomial data
    const three = tf.scalar(3, 'int32');
    const ys = a.mul(xs.pow(three))
      .add(b.mul(xs.square()))
      .add(c.mul(xs))
      .add(d)
      // Add random noise to the generated data
      // to make the problem a bit more interesting
      .add(tf.randomNormal([numPoints], 0, sigma));

    // Normalize the y values
    const ymin = ys.min();
    const ymax = ys.max();
    const yrange = ymax.sub(ymin);
    const ysNormalized = ys.sub(ymin).div(yrange);
      // .mul(tf.scalar(range[1]-range[0])).add(tf.scalar((range[0]+range[1])/2));

    return {
      xs, 
      ys: ysNormalized
    };
  })
}

function predict(x) {
  // y = a * x ^ 3 + b * x ^ 2 + c * x + d
  return tf.tidy(() => {
    return a.mul(x.pow(tf.scalar(3))) // a * x^3
      .add(b.mul(x.square())) // + b * x ^ 2
      .add(c.mul(x)) // + c * x
      .add(d); // + d
  });
}

function loss(Y_h, Y) {
  const meanSquaredError = Y_h.sub(Y).square().mean();
  return meanSquaredError;
}

function train(xs, ys, numIterations = 5) {

  const learningRate = 0.25;
  const optimizer = tf.train.sgd(learningRate);

  for (let i=0; i < numIterations; i++) {
    optimizer.minimize(() => {
      const Y_h = predict(xs);
      return loss(Y_h, ys);
    });
  }

  tf.dispose(optimizer);

}

function setup() {

  createCanvas(400, 400)

}

function draw() {

  background('#000');
  trainingDataPts.forEach(point => point.draw());

  // train the model
  train(trainingData.xs, trainingData.ys);

  // draw prediction curve
  const predictCurve = new Curve(predict);
  predictCurve.draw();

}