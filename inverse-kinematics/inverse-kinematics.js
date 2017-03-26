var worms = [];

function setup() {
  
  createCanvas(600, 400);
  
  new Worm({ // Alice
    segments: 100,
    length: 3,
    taper: true,
    girth: 3,
    tether: true,
    tetherTo: new p5.Vector(width / 2, height)
  });
  
  new Worm({ // Bob
    segments: 100,
    length: 3,
    taper: true,
    tether: true,
    tetherTo: new p5.Vector(width / 2, 0)
  });
  
}

function draw() {
  
  background(51);
  
  worms.forEach(function(worm){
    worm.update();
    worm.show();
  });
  
}

class Worm {
  
  constructor(options) {
    var defaults = {segments: 5, length: 50, girth: 10, taper: false, tether: false, tetherTo: new p5.Vector(width/2, height)};
    this.o = Object.assign({}, defaults, options);
    this.segs = [];
    for (var i=0; i<this.o.segments; i++) {
      this.segs.push(new Segment(this, this.o.length, i));
    }
    worms.push(this);
  }
  
  update() {
    for (var i=0; i<this.segs.length; i++)
      this.segs[i].updateForward();
    if (this.o.tether && !mouseIsPressed)
      for (var i=this.segs.length-1; i>=0; i--)
        this.segs[i].updateReverse();
  }
  
  show() {
    for (var i=0; i<this.segs.length; i++)
      this.segs[i].show();
  }
  
}

class Segment {
  
  constructor(worm, len, idx) {
    this.worm = worm;
    this.idx = idx;
    this.a = new p5.Vector();
    this.b = new p5.Vector();
    this.len = len;
    this.angle = 0;
    this.calculateB();
  }
  
  get child() { return this.worm.segs[this.idx+1] }
  
  get parent() { return this.worm.segs[this.idx-1] }
  
  calculateB() {
    var dx = this.len * cos(this.angle);
    var dy = this.len * sin(this.angle);
    this.b.set(this.a.x + dx, this.a.y + dy);
  }
  
  updateForward() {
    if (this.parent) {
      this.follow(this.parent.a.x, this.parent.a.y);
    } else {
      this.follow(mouseX, mouseY);
    }
    this.calculateB();
  }
  
  updateReverse() {
    if (this.child) {
      this.a = this.child.b.copy();
    } else {
      var tetherTo = this.worm.o.tetherTo;
      this.a.set(tetherTo.x, tetherTo.y);
    }
    this.calculateB();
  }
  
  show() {
    stroke(255);
    var sw = this.worm.o.girth;
    if (this.worm.o.taper) {
      var n = this.worm.o.segments;
      sw *= ((n-this.idx)/n);
    }
    strokeWeight(sw);
    line(this.a.x, this.a.y, this.b.x, this.b.y);
  }
  
  follow(targetX, targetY) {
    var target = new p5.Vector(targetX, targetY);
    var dir = p5.Vector.sub(target, this.a);
    this.angle = dir.heading();
    
    dir.setMag(this.len);
    dir.mult(-1);
    
    this.a = p5.Vector.add(target, dir);  
  }
  
}
