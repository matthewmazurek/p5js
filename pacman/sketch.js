
let grid, player;

const PLAYER = 1;

function setup() {
  createCanvas(400, 400);
  grid = new Grid();
  player = new Player(grid)
  grid.addObject(player);
}

function draw() {
  grid.update();
  grid.draw();
}

class Grid {
  constructor(w = 10, h = 10) {
    this.w = w;
    this.h = h;
    this.s = min(width, height) / max(w, h);
    this.tiles = Array.from({ length: this.h }, (_, j) =>
      Array.from({ length: this.w }, (_, i) => new Tile({ i, j }, this))
    );
    this.objects = [];
  }
  addObject(obj) {
    this.objects.push(obj);
  }
  update() {
    this.updateObjects();
    this.forEachTile((tile, { i, j }) => {
      tile.contents = undefined;
      this.forEachObj(obj => {
        if (obj.gridPos.i == i && obj.gridPos.j == j) tile.contents = obj;
      });
    })
  }
  tileAt(idx) {
    return this.tiles[idx.j][idx.i];
  }
  get tilesArr() {
    return this.tiles.reduce((arr, row) => arr.concat(row), []);
  }
  forEachTile(fn) {
    this.tilesArr.forEach(tile => fn(tile, tile.idx));
  }
  forEachObj(fn) {
    this.objects.forEach((obj, idx) => fn(obj, idx));
  }
  updateObjects() {
    this.forEachObj(obj => obj.update());
  }
  draw() {
    this.forEachTile(tile => tile.draw());
    this.forEachObj(obj => obj.draw());
  }
}

class Tile {
  constructor(idx, grid) {
    this.grid = grid;
    this.idx = idx;
    this.s = grid.s;
    this.contents = undefined;
  }
  draw() {
    stroke(255);
    fill(0);
    if (this.contents && this.contents.type == PLAYER) fill('blue');
    strokeWeight(1);
    rect(this.idx.i * this.s, this.idx.j * this.s, this.s, this.s);
  }
}

class Obj {
  constructor(type, grid, gridPos = { i: 0, j: 0 }) {
    this.type = type;
    this.grid = grid;
    this.gridPos = gridPos;
    this.s = grid.s;
  }
  update() { };
  draw() { };
}

class Player extends Obj {
  constructor(grid, gridPos) {
    super(PLAYER, grid, gridPos);
    this.pos = createVector(this.gridPos.i * this.s, this.gridPos.j * this.s);
    this.heading = createVector(1, 0);
    this.vel = 2;
  }
  move() {
    this.pos.add(p5.Vector.mult(this.heading, this.vel));
  }
  updateGridPos() {
    let i = round(this.pos.x / this.s);
    let j = round(this.pos.y / this.s);
    this.gridPos = { i, j };
  }
  update() {
    this.move();
    this.updateGridPos();
  }
  draw() {
    fill('yellow');
    noStroke();
    ellipseMode(CORNER);
    ellipse(this.pos.x, this.pos.y, this.s);
  }
}