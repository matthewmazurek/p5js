var yard, camPos;

var o = {
  apples: 10,
  canvasSize: 400,
  gameSize: 25
}

function setup() {
  createCanvas(o.canvasSize, o.canvasSize);
  yard = new Yard(o.gameSize);
  score = new Score(yard);
  cam = new Camera;
  colorMode(HSB, 255);
  noStroke();
}

function draw() {

  // update game state
  yard.update();

  // draw
  background(0);

  // camera work
  cam.update();
  
  // draw boundary
  push();
  noFill();
  stroke(255);
  strokeWeight(2);
  rect(0, 0, width, height);
  pop();

  // draw gamestate
  yard.draw();
  
  // update and draw score
  score.update();
  score.draw();

}

function keyPressed() {
  switch (keyCode) {
    case UP_ARROW:
      yard.snake.dir = createVector(0, -1);
      break;
    case DOWN_ARROW:
      yard.snake.dir = createVector(0, 1);
      break;
    case LEFT_ARROW:
      yard.snake.dir = createVector(-1, 0);
      break;
    case RIGHT_ARROW:
      yard.snake.dir = createVector(1, 0);
      break;
  }
}

class Camera {
  constructor() {
    this.camPos = createVector(
      width / 2 - yard.snake.pos.x * yard.r,
      height / 2 - yard.snake.pos.y * yard.r
    );
    this.lock = true;
  }
  update() {
    if (!this.lock) return;
    var targetCamPos = createVector(
      width / 2 - yard.snake.pos.x * yard.r,
      height / 2 - yard.snake.pos.y * yard.r
    );
    this.camPos.lerp(targetCamPos, 0.1);
    translate(this.camPos.x, this.camPos.y);
  }
  static(pos) {
    return pos.sub(this.camPos);
  }
}

class Score {
  constructor(yard) {
    this.yard = yard;
    this.current = 0;
    this.best = 0;
  }
  update() {
    // Score Calculation
    this.current = 100 * (this.yard.snake.length - 1) + this.yard.snake.moves;
  }
  record() {
    this.best = max(this.current, this.best);
  }
  draw() {
    var display = `Score: ${this.current} | Record: ${this.best}`,
        pos = cam.static(createVector(width - 10, 10));
    fill(255);
    textAlign(RIGHT, TOP);
    textSize(12);
    text(`Record: ${this.best}`, pos.x, pos.y);
    textSize(30);
    text(this.current, pos.x, pos.y + 14);
  }
}

class Yard {
  constructor(w) {
    this.w = w;
    this.r = width / w;

    // the snake
    this.snake = new Snake(this);

    // apples
    this.apples = [];

  }
  update() {

    // move snake
    this.snake.update();

    if (this.snake.isDead) {
      // game over, restart!
      score.record();
      this.snake = new Snake(this);
    }
    // top up apples
    while (this.apples.length < o.apples)
      this.apples.push(new Apple(this));

  }
  draw() {
    this.snake.draw();
    this.apples.forEach(function (apple) {
      apple.draw();
    })
  }
}

class Snake {
  constructor(yard, x, y) {

    this.yard = yard;
    var defaultPos = floor(this.yard.w / 2);
    x = x || defaultPos;
    y = y || defaultPos;

    this.speed = 10 // lower is faster
    this.dir = createVector(0, -1); // up
    this.moves = 0;
    
    this.segments = [];
    this.head = new Segment(x, y, this, true);
    this.segments.push(this.head);

    this.growTo = undefined;

    this.isDead = false;
    this.isEating = false;
  }
  get pos() {
    return this.segments[0].pos;
  }
  get length() {
    return this.segments.length;
  }
  get last() {
    return this.segments[this.length - 1];
  }
  grow() {
    var to = this.last.prevPos;
    this.growing = false;
    this.segments.push(new Segment(to.x, to.y, this));
  }
  update() {
    if (frameCount % this.speed == 0) {
      this.moves++;
      this.segments.forEach$(function (s) {
        s.update()
      });
      if (this.growing) this.grow();
    }
  }
  draw() {
    this.segments.forEach(function (s) {
      s.draw(this.length);
    }, this);
  }
}

class Segment {
  constructor(x, y, snake, isHead) {
    this.pos = createVector(x, y);
    this.prevPos = undefined;
    this.snake = snake;
    this.isHead = isHead || false;
    this.idx = this.snake.segments.length;
  }
  update() {
    this.prevPos = this.pos.copy();
    if (this.isHead) {
      this.pos.add(this.snake.dir);
      this.snake.isDead = (this.outOfBounds || this.collide);
      this.snake.growing = this.eats();
      if (this.snake.growTo) console.log(this.snake.growTo);
    } else this.pos = this.nextSeg.pos.copy();
  }
  get nextSeg() {
    return this.snake.segments[this.idx - 1];
  }
  get outOfBounds() {
    return (this.pos.x < 0 || this.pos.x >= this.snake.yard.w ||
      this.pos.y < 0 || this.pos.y >= this.snake.yard.w);
  }
  get collide() {
    return this.snake.segments.some(function (s) {
      return this.idx != s.idx && this.pos.equals(s.pos);
    }, this);
  }
  eats() {
    return this.snake.yard.apples.some$(function (apple, i, apples) {
      if (this.pos.equals(apple.pos)) {
        apples.splice(i, 1);
        return true;
      }
    }, this);
  }
  draw(l) {
    var scl = this.snake.yard.r;
    var pxPos = this.pos.copy().mult(scl);
    // colorMode(HSB, 255);
    fill(l % 255, 255, 255);
    rect(pxPos.x, pxPos.y, scl, scl);
  }
}

class Apple {
  constructor(yard, x, y) {
    this.yard = yard;
    this.pos = createVector(
      x || floor(random(this.yard.w)),
      y || floor(random(this.yard.w))
    );
  }
  draw() {
    var scl = this.yard.r;
    var r = scl * 0.8;
    var pxPos = this.pos.copy().mult(this.yard.r);
    fill(255);
    ellipse(pxPos.x + scl/2, pxPos.y + scl/2, r, r);
  }
}

// reverse array utility functions
Array.prototype.forEach$ = function (fn, self) {
  for (var i = this.length - 1; i >= 0; i--) {
    fn.apply(self, [this[i], i, this]);
  }
}
Array.prototype.some$ = function (fn, self) {
  for (var i = this.length - 1; i >= 0; i--) {
    if (fn.apply(self, [this[i], i, this])) return true;
  }
}
