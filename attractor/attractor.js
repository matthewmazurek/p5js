var particles = [], attractors = [], G = 50;

function setup() {
  createCanvas(400, 400);
  while (attractors.length < 5)
    attractors.push(new Attractor());
}

function mousePressed() {
  attractors.push(new Attractor(mouseX, mouseY));
}

function draw() {
  background(51);
  while (particles.length < 100)
    particles.push(new Particle());
  particles.forEach$(function(particle, i) {
    if (particle.lifeSpan <= 0)
      particles.splice(i, 1);
    else {
      attractors.forEach(function(attractor) {
        particle.attractedTo(attractor);
      })
      particle.update();
      particle.show();
    }
  });
  attractors.forEach(function(attractor) {
    attractor.show();
  });
}

class Particle {
  constructor(x, y) {
    this.pos = createVector(x || random(width), y || random(height));
    this.prev = this.pos.copy();
    this.vel = createVector(); // p5.Vector.random2D();
    this.acc = createVector();
    this.lifeSpan = random(10) * frameRate();
  }
  update() {
    this.vel.add(this.acc);
    this.vel.limit(5);
    this.pos.add(this.vel);
    this.acc.mult(0);
    this.lifeSpan--;
    // this.vel.limit(5);
  }
  show() {
    stroke(255);
    strokeWeight(4);
    line(this.pos.x, this.pos.y, this.prev.x, this.prev.y);
    
    this.prev = this.pos.copy();
  }
  attractedTo(attractor) {
    var force = p5.Vector.sub(attractor.pos, this.pos);
    var d = force.mag();
    d = constrain(d, 1, 25);
    var strength = G * attractor.m / (d * d);
    force.setMag(strength);
    if (d < 20) force.mult(-1);
    this.acc.add(force);
  }
}

class Attractor extends Particle {
  constructor(x, y) {
    super(x, y);
    this.vel = 0; 
    this.acc = 0;
    this.m = 1;
  }
  show() {
    noStroke();
    fill(0, 255, 0);
    ellipse(this.pos.x, this.pos.y, 5, 5);
  }
}

Array.prototype.forEach$ = function(fn, self) {
  for (var i=this.length-1; i>=0; i--) {
    fn.apply(self, [this[i], i, this]);
  }
}