let data_train, data_test;


function setup() {

  createCanvas(400, 400)

  const model = tf.sequential();

  // training data
  data_train = Array.from({length: 1000}, () => new Point);
  const X_train = tf.tensor(data_train.map(p => [p.x, p.y]));
  const Y_train = tf.tensor(data_train.map(p => p.label));
  
  // console.log(X_train.print(), Y_train.print());
  
  // test data
  data_test = Array.from({length: 100}, () => new Point);
  const X_test = tf.tensor(data_test.map(p => [p.x, p.y]));
  const Y_test = tf.tensor(data_test.map(p => p.label));

  model.add(tf.layers.dense({units: 1, inputShape:[2]}))
  model.compile({loss: 'meanSquaredError', optimizer: 'sgd'});

  console.log('Pre-training accuracy: ');
  model.evaluate(X_test, Y_test).print();

  // train model
  model.fit(X_train, Y_train).then(() => {
    console.log('Post-training accuracy: ');
    model.evaluate(X_test, Y_test).print();
  });

  // frameRate(0.5);

}


function draw() {
  background('fff');
  data_test.forEach(point => point.draw());
  
  // visual training
  // if (X_train.length) p.train([X_train.pop()], [Y_train.pop()]);

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