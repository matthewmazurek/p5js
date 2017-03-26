var distribution, mean, sd, colored, o;

var options = function() { return {
  canvasSize: 400,
  circlesPerFrame: 500,
  circleAlpha: 10, // [0, 255]
  circleRadius: 10,
  standardDev: 1/8, // [0, 1]
  linear: false,
  colorMode: false,
  colorFn: colored['random'] // byFrame, byAngle, random
}};

function setup() {
  
  colored = {
    'byFrame': function() { return frameCount % 255 },
    'byAngle': function(_) { return (Math.atan(_.angle.y, _.angle.x) % TWO_PI) * 255 },
    'random': function(_) { return random(255) }
  }

  o = options();
  
  createCanvas(o.canvasSize, o.canvasSize);
  colorMode(HSB, 255);
  background(51);
  mean = createVector(width / 2, height / 2);
  sd = o.standardDev * o.canvasSize;
  
  distribution = new Gaussian();
  
}

function draw() {
  distribution.draw();
}

class Gaussian {
  draw() {
    for (var i=0; i<o.circlesPerFrame; i++) {
      this.angle = o.linear ? createVector(1, 0) : p5.Vector.random2D();
      this.pos = this.angle.copy().setMag(this.rand * sd).add(mean);
      noStroke();
      fill(
        o.colorMode ? o.colorFn(this) : 255,  // H
        o.colorMode ? 255 : 0,                // S
        255,                                  // B
        o.circleAlpha                         // A
      );
      ellipse(this.pos.x, this.pos.y, o.circleRadius, o.circleRadius);
    }
  }
  get rand() {
    var u = 1 - Math.random(),
        v = 1 - Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }
}