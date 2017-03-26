var o = { scl: 10, inc: 0.1 };
var rows, cols, pList, particles = [], flowField = [], zoff = 0, fr, sliders = [], sliderIdx = 0, saveBtn, resetBtn;

function setup() {
  
//  createCanvas (windowWidth, windowHeight);
  createCanvas (800, 600);
  background(255);
  
  colorMode(HSB, 255);
  
  rows = floor(height / o.scl);
  cols = floor(width / o.scl);
  flowField = new Array(cols * rows);
  
  // sliders
  Slider.posx = width + 50;
  Slider.posy = 80;
  Slider.verticalInc = 20;
  new Slider('numParticles', 'No. particles', 0, 500, 100);
  new Slider('maxSpeed', 'Max Vel', 0, 20, 15, 10);
  new Slider('trailWeight', 'Trail Wt', 1, 10, 1);
  new Slider('fieldStrength', 'Field strength', 0, 20, 1, 10);
  new Slider('flux', 'Field flux', 0, 10, 3, 100);
  new Slider('colorInc', 'Color vel', 0, 20, 10, 100);
  new Slider('colAlpha', 'Color alpha', 0, 255, 50);
  
  // Create particles
  pList = new ParticleList();
  
  // Save canvas
  saveBtn = createButton('Save Canvas');
  saveBtn.position(width + 50, 30);
  saveBtn.mousePressed(function() {
    saveCanvas('my-canvas');
  });
  
  // Reset canvas
  resetBtn = createButton('Clear Canvas');
  resetBtn.position(width + 50, 50);
  resetBtn.mousePressed(function() {
    var conf = confirm("Are you sure you want to clear the canvas?");
    if (conf) background(0, 0, 255)
  });
  
  // frame rate counter
  fr = createP('');
  
}


function draw() {
  
  // update options from sliders
  sliders.forEach(function(slider) { slider.update() });
  
  // update the field
  var yoff = 0;
  for (var y = 0; y < rows; y++) {
    var xoff = 0;
    for (var x = 0; x < cols; x++) {
      var index = (x + y * cols);
      var angle = noise(xoff, yoff, zoff) * TWO_PI;
      var v = p5.Vector.fromAngle(angle);
      v.setMag(o.fieldStrength);
      flowField[index] = v;
      xoff += o.inc;
      // draw forceField
//      stroke(176);
//      strokeWeight(1);
//      push();
//        translate(x * o.scl, y * o.scl);
//        rotate(v.heading());
//        line(0 , 0, o.scl, 0);
//      pop();
    }
    yoff += o.inc;
  }
  zoff += o.flux;
  
  // update particles
  pList.update();
  
  // frame rate display
  fr.html(floor(frameRate()));
  
}

class ParticleList {
  constructor() {
    this.particles = [];
    this.update();
  }
  update() {
    // update quanity
    while (this.particles.length < o.numParticles) {
      this.particles.push(new Particle());
    }
    while (this.particles.length > o.numParticles) {
      this.particles.pop();
    }
    // update particles
    this.particles.forEach(function(particle) {
      particle.follow(flowField);
      particle.update();
      particle.show();
    });
  }
}

class Slider {
  
  constructor(option, label, a, b, init, scl) {
    this.idx = sliderIdx++;
    this.x = Slider.posx;
    this.y = Slider.posy + this.idx * Slider.verticalInc;
    this.option = option;
    this.scl = scl || 1;
    this.slider = createSlider(a, b, init);
    this.slider.position(this.x, this.y);
    this.slider.style('width', '80px');
    this.lbl = createSpan(label);
    this.lbl.position(this.x + 100, this.y);
    this.update();
    sliders.push(this);
  }
  update() {
    o[this.option] = this.slider.value() / this.scl;
  }
}

class Particle {
  constructor() {
    this.pos = createVector(random(width), random(height));
    this.ppos = this.pos.copy();
    this.vel = p5.Vector.random2D();
    this.acc = createVector(0, 0);
    this.h = 0;
  }
  follow(field) {
    var x = floor(this.pos.x / o.scl),
        y = floor(this.pos.y / o.scl),
        index = x + y * cols;
    this.applyForce(field[index]);
  }
  update() {
    this.ppos = this.pos.copy();
    this.vel.add(this.acc);
    this.vel.limit(o.maxSpeed);
    this.pos.add(this.vel);
    this.acc.mult(0);
    this.edges();
    this.updateColor();
  }
  updateColor() {
    this.h += o.colorInc;
    if (this.h > 255) this.h = 0;
  }
  applyForce(force) {
    this.acc.add(force);
  }
  edges() {
    var changed = false,
        changePos = function(fn) { fn.apply(this); changed = true },
        margin = 5;
    
    if (this.pos.x > width + margin) { this.pos.x = -margin; changed = true }
    if (this.pos.x < 0 - margin) {this.pos.x = width + margin; changed = true }
    if (this.pos.y > height + margin) { this.pos.y = -margin; changed = true }
    if (this.pos.y < 0 - margin) { this.pos.y = height + margin; changed = true }
    
    if (changed) this.ppos = this.pos.copy();
  }
  show() {
//    stroke(0, 0, 0, 25);
    stroke(this.h, 255, 255, o.colAlpha);
    strokeWeight(o.trailWeight);
    line(this.pos.x, this.pos.y, this.ppos.x, this.ppos.y);
  }
}


