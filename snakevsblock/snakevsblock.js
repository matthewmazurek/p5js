// Snake vs Block
const snakeScale = 15;

let snake;

function setup() {
  
  createCanvas(400, 600);
  
  snake = new Snake(1);
  
}

function draw() {
  
  
  snake.update();
  
  
  background('#000');
  snake.draw();
  
}

class Snake {
  
  constructor(len) {
    this.len = len || 1;
    this.pieces = Array.from({length: this.len}).map(piece => new SnakePiece(this));
    
    this.acc = createVector(0, 0);
    this.vel = createVector(0, -1);
    this.pos = createVector(width / 2, 400);
    
    this.maxSpeed = 1;
    this.maxForce = 10;
    
    
  }
  
  
  update() {
    
    this.seek(createVector(mouseX, this.pos.y));
    
    this.vel.add(this.acc);
    // this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.mult(0);
    
    
    this.pieces.forEach(piece => piece.updatePos());
    
    
  }
  
  seek(target) {
    
    let desired = p5.Vector.sub(target, this.pos);
    desired.setMag(this.maxSpeed);
    let steer = p5.Vector.sub(desired, createVector(this.vel.x, 0));
    steer.limit(this.maxForce);
    
    this.applyForce(steer);
    
  }
  
  applyForce(force) {
    this.acc.add(force);
  }
  
  draw() {
    this.pieces.forEach(piece => piece.draw());
  }
  
}

class SnakePiece {
  
  constructor(snake) {
    this.snake = snake;
  }
  
  updatePos() {
    
    this.pos = snake.pos;
    
  }
  
  draw() {
    noStroke();
    fill('purple');
    ellipseMode(CENTER);
    ellipse(this.pos.x, this.pos.y, snakeScale, snakeScale)
  }
  
}