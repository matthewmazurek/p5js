var field, particles = [];

function setup() {
  createCanvas (800, 400);
  field = new FlowField({resolution: 80});
  
  var maxParticles = 35;
  for (var i=0; i<maxParticles; i++) {
    particles.push(new Particle());
  }
  document.body.appendChild(document.createTextNode('Click to get new field; space to uncouple field from particles. Up and down arrows to add or remove particles.'));
}

function mouseClicked() {
  field.generateField();
}
function keyPressed() {
  switch (keyCode) {
    case DOWN_ARROW: particles.pop(); break;
    case UP_ARROW: particles.push(new Particle); break;
  }
}

function draw() { 
  
  background(51);
  if (!keyIsDown(32)) field.draw();
  
  particles.forEach(function(p) {
    if (!keyIsDown(32)) p.steer(field);
    p.update();
    p.wrap();
    p.draw();
  });
  
}

class FlowField {
  constructor(options) {
    var defaults = {resolution: 100};
    var o = Object.assign({}, defaults, options);
    this.resolution = o.resolution;
    this.cols = width / this.resolution;
    this.rows = height / this.resolution;
    this.generateField();
  }
  generateField() {
    this.vectors = [];
    var seed = random(10);
    for (var j=0, yoff=0; j<this.rows; j++, yoff += 0.2) {
      this.vectors[j] = [];
      for (var i=0, xoff=0; i<this.cols; i++, xoff += 0.2) {
        var theta = map(noise(seed + xoff, seed + yoff), 0, 1, 0, TWO_PI);
        this.vectors[j][i] = p5.Vector.fromAngle(theta);
      }
    }
  }
  lookUp(v) {
    var i = constrain(floor(v.x / this.resolution), 0, this.cols - 1);
    var j = constrain(floor(v.y / this.resolution), 0, this.rows - 1);
    return this.vectors[j][i];
  }
  forEach(fn) {
    for (var j=0; j<this.rows; j++) {
      for (var i=0; i<this.cols; i++) {
        fn.apply(this, [this.vectors[j][i], j, i, this.vectors]);
      }
    }
  } 
  draw() {
    this.forEach(function(v, j, i) {
      var arrowSize = this.resolution/2, x = i*this.resolution, y = j*this.resolution, len = v.mag()*arrowSize;
      stroke(175);
      push();
      translate(x, y);
      rotate(v.heading());
      line(0,0,arrowSize,0);
      pop();
    });
  }
}

class Particle {
  constructor(options) {
    
    var defaults = {
      x: random(width),
      y: random(height),
      maxSpeed: random(3, 7),
      maxForce: random(0.1, 0.5),
      mass: 1,
      r: 4
    }, o = Object.assign({}, defaults, options);
    
    this.position = new p5.Vector(o.x, o.y);
    this.velocity = new p5.Vector(0, 0);
    this.acceleration = new p5.Vector(0, 0);
    this.maxSpeed = o.maxSpeed;
    this.maxForce = o.maxForce;
    this.mass = o.mass;
    this.r = o.r;
  }
  run() {
    this.update();
    this.borders();
    this.draw();
  }
  update() {
    // this.steer();
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
    this.position.add(this.velocity);
    this.acceleration.mult(0);
  }
  steer(ff) {
    var desired = ff.lookUp(this.position).copy().mult(this.maxSpeed),
        steering = p5.Vector.sub(desired, this.velocity).limit(this.maxForce);
    this.applyForce(steering);
  }
  applyForce(f) {
    this.acceleration.add(f.mult(1/this.mass));
  }
  wrap() {
    if (this.position.x < -this.r) this.position.x = width + this.r;
    if (this.position.y < -this.r) this.position.y = height + this.r;
    if (this.position.x > width + this.r) this.position.x = -this.r;
    if (this.position.y > height + this.r) this.position.y = -this.r;
  }
  draw() {
    var theta = this.velocity.heading() + HALF_PI;
    fill(0, 255, 255);
    noStroke();
    push();
      translate(this.position.x, this.position.y);
      rotate(theta);
      beginShape(TRIANGLES);
      vertex(0, -this.r*2);
      vertex(-this.r, this.r*2);
      vertex(this.r, this.r*2);
      endShape();
    pop();
  }
}


